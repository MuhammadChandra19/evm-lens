import { toast } from 'sonner';
import { Address } from '@ethereumjs/util';

import usePlaygroundStore from '@/store/playground-store';
import { PlaygroundConfig, Transaction, TokenBalance, ContractMetadata } from '@/store/playground-store/types';
import { SnapshotType } from '@/repository/snapshot/entity';
import { EVMResult, CreateNewEVMPayload, TxData, ContractDeploymentData, FunctionCallData, AccountCreationData, AccountFundingData } from './types';
import { ETH_DECIMAL } from '@/lib/constants';
import { generateFunctionHash, generateInputHash } from '@/service/evm-analyzer/abi/util';
import { AbiFunction } from '@/service/evm-analyzer/abi/types';
import EVMAnalyzer, { AccountInfo } from '@/service/evm-analyzer';
import { ActionRecorder } from '../action-recorder';

/**
 * EVM Adapter - handles all EVM operations with consistent return types
 * Integrates with playground store for state management
 */
export class EVMAdapter {
  private recordAction: typeof ActionRecorder.prototype.recordAction;
  private evm: EVMAnalyzer;

  constructor(evm: EVMAnalyzer, recordAction: typeof ActionRecorder.prototype.recordAction) {
    this.evm = evm;
    this.recordAction = recordAction;
  }

  /**
   * Deploy contract with playground integration (copied from deployContractToEVM)
   */
  async deployContract(payload: CreateNewEVMPayload, playgroundId: number, shouldRecord: boolean = true): Promise<EVMResult<ContractDeploymentData>> {
    try {
      const playgroundStore = usePlaygroundStore.getState();

      // Create owner address
      const owner = new Address(Buffer.from(payload.ownerAddress.slice(2), 'hex'));
      const ownerAddress = await this.createAccountInternal(owner);
      if (!ownerAddress) {
        return {
          success: false,
          error: 'Failed to create owner account',
        };
      }

      // Create contract address
      const contract = new Address(Buffer.from(payload.contractAddress.slice(2), 'hex'));
      const contractAddress = await this.createAccountInternal(contract);
      if (!contractAddress) {
        return {
          success: false,
          error: 'Failed to create contract account',
        };
      }

      // Deploy contract
      const res = await this.evm.deployContract(ownerAddress, payload.constructorBytecode, contractAddress);
      if (!res.success) {
        return {
          success: false,
          error: 'Contract deployment failed',
        };
      }

      // Fund the owner account
      const parsedBalance = payload.initialOwnerBalance * BigInt(10 ** ETH_DECIMAL);
      console.log('🔍 Funding owner account:', {
        initialOwnerBalance: payload.initialOwnerBalance.toString(),
        ETH_DECIMAL,
        parsedBalance: parsedBalance.toString(),
        ownerAddress: ownerAddress.toString(),
      });
      await this.fundAccountInternal(ownerAddress, parsedBalance);

      // Get account info
      const ownerAccountInfo = await this.evm.getAccountInfo(ownerAddress);

      // Create contract metadata
      const contractMetadata: ContractMetadata = {
        address: contractAddress.toString(),
        name: payload.projectName,
        abi: payload.abi,
        deployedAt: new Date(),
        totalSupply: BigInt(payload.totalSupply) * BigInt(10 ** payload.decimal),
        decimals: payload.decimal,
      };

      // Create token balances for accounts
      const tokenBalances: TokenBalance[] = [];
      if (ownerAccountInfo) {
        tokenBalances.push({
          contractAddress: contractAddress.toString(),
          accountAddress: ownerAddress.toString(),
          balance: ownerAccountInfo.balance,
          decimals: payload.decimal,
          lastUpdated: new Date(),
        });
      }

      // Update playground store with contract metadata
      playgroundStore.setContractMetadata(playgroundId, contractMetadata);

      // Add token balances
      tokenBalances.forEach((balance) => {
        playgroundStore.setTokenBalance(playgroundId, balance);
      });

      // Record the action
      if (shouldRecord) {
        await this.recordAction('DEPLOY_CONTRACT', payload, res.gasUsed.toString(), playgroundId);
      }

      // Create playground config
      const config: PlaygroundConfig = {
        id: playgroundId,
        name: payload.projectName,
        contractAddress,
        ownerAddress,
        decimals: payload.decimal,
        totalSupply: BigInt(payload.totalSupply),
        abi: payload.abi,
        createdAt: new Date(),
        isActive: true,
      };

      // Store playground config
      playgroundStore.setPlaygroundConfig(config);

      // Add deployment transaction
      const deploymentTx: Transaction = {
        id: `deploy-${Date.now()}`,
        playgroundId,
        type: 'DEPLOY_CONTRACT' as SnapshotType,
        from: payload.ownerAddress,
        to: payload.contractAddress,
        gasUsed: res.gasUsed || 0n,
        success: true,
        timestamp: new Date(),
      };

      playgroundStore.addTransaction(deploymentTx);

      return {
        success: true,
        data: {
          contractAddress,
          ownerAddress,
          deploymentResult: res,
          playgroundId,
        },
        gasUsed: res.gasUsed,
      };
    } catch (error) {
      toast.error('Contract deployment failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Call contract function (copied from callFunction)
   */
  async callFunction(tx: TxData, playgroundId: number, shouldRecord: boolean = true): Promise<EVMResult<FunctionCallData>> {
    try {
      const playgroundStore = usePlaygroundStore.getState();
      const contractMetadata = playgroundStore.getContractMetadata(playgroundId);

      if (!contractMetadata?.address) {
        return {
          success: false,
          error: 'No contract deployed',
        };
      }

      const contractAddress = new Address(Buffer.from(contractMetadata.address.replace('0x', ''), 'hex'));

      let data = generateFunctionHash(tx.func);
      data += generateInputHash(tx.func, tx.args, contractMetadata.decimals || 18);

      let ethAmount = 0n;
      if (tx.type === 'function' && (tx.func as AbiFunction).stateMutability === 'payable') {
        ethAmount = tx.ethAmount * BigInt(10 ** (contractMetadata.decimals || 18));
      }

      const result = await this.evm.callContract(
        {
          data,
          from: tx.executorAddress,
          to: contractAddress,
          gasLimit: BigInt(tx.gasLimit),
          value: ethAmount,
        },
        {
          includeMemory: true,
          includeStack: true,
          includeStorage: true,
        }
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Function execution failed',
        };
      }

      // Record the action only for state-changing functions (not view functions)
      if (shouldRecord && tx.type === 'function' && (tx.func as AbiFunction).stateMutability !== 'view') {
        const actionPayload = {
          ...tx,
          executorAddress: [tx.executorAddress.toString(), 'Address'],
        };
        await this.recordAction('CALL_FUNCTION', actionPayload, result.gasUsed.toString(), playgroundId);
      }

      // Add function call transaction
      const functionTx: Transaction = {
        id: `call-${Date.now()}`,
        playgroundId,
        type: 'CALL_FUNCTION' as SnapshotType,
        from: tx.executorAddress.toString(),
        functionName: 'name' in tx.func ? tx.func.name : undefined,
        args: tx.args,
        value: tx.ethAmount,
        gasUsed: result.gasUsed || 0n,
        success: true,
        timestamp: new Date(),
        returnValue: result.returnValue ? Buffer.from(result.returnValue).toString('hex') : undefined,
      };

      playgroundStore.addTransaction(functionTx);

      return {
        success: true,
        data: {
          result,
          steps: result.steps || [],
          returnValue: result.returnValue ? Buffer.from(result.returnValue).toString('hex') : undefined,
          playgroundId,
        },
        gasUsed: result.gasUsed,
      };
    } catch (error) {
      toast.error('Function call failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Create account (copied from createAccount)
   */
  async createAccount(address: string, playgroundId: number, shouldRecord: boolean = true): Promise<EVMResult<AccountCreationData>> {
    try {
      const playgroundStore = usePlaygroundStore.getState();

      const fixAddress = address.startsWith('0x') ? address.slice(2) : address;
      const addressType = new Address(Buffer.from(fixAddress, 'hex'));

      const result = await this.createAccountInternal(addressType);

      if (!result) {
        return {
          success: false,
          error: 'Failed to create account',
        };
      }

      // Record the action if shouldRecord is true
      if (shouldRecord) {
        await this.recordAction('CREATE_ACCOUNT', { address }, '0', playgroundId);
      }

      // Add account creation transaction
      const accountTx: Transaction = {
        id: `create-account-${Date.now()}`,
        playgroundId,
        type: 'CREATE_ACCOUNT' as SnapshotType,
        from: address,
        gasUsed: 0n,
        success: true,
        timestamp: new Date(),
      };

      playgroundStore.addTransaction(accountTx);

      return {
        success: true,
        data: {
          address: result,
          balance: 0n,
          nonce: 0n,
          playgroundId,
        },
      };
    } catch (error) {
      toast.error('Account creation failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Fund account (copied from fundAccount)
   */
  async fundAccount(address: Address, balance: bigint, playgroundId: number, shouldRecord: boolean = true): Promise<EVMResult<AccountFundingData>> {
    try {
      const playgroundStore = usePlaygroundStore.getState();

      // Get previous balance
      const previousAccount = await this.getAccountInternal(address);
      const previousBalance = previousAccount?.balance || 0n;

      const result = await this.fundAccountInternal(address, balance);

      if (!result.success) {
        return {
          success: false,
          error: result.error instanceof Error ? result.error.message : 'Failed to fund account',
        };
      }

      // Record the action if shouldRecord is true
      if (shouldRecord) {
        const actionPayload = {
          address: [address.toString(), 'Address'],
          balance: balance,
        };
        await this.recordAction('FUND_ACCOUNT', actionPayload, '0', playgroundId);
      }

      // Add funding transaction
      const fundingTx: Transaction = {
        id: `fund-${Date.now()}`,
        playgroundId,
        type: 'FUND_ACCOUNT' as SnapshotType,
        from: 'system',
        to: address.toString(),
        value: balance,
        gasUsed: 0n,
        success: true,
        timestamp: new Date(),
      };

      playgroundStore.addTransaction(fundingTx);

      // Create/update token balance entry so the account shows up in explorer
      // We'll use the contract address from the playground config as the "token"
      const playgroundConfig = playgroundStore.getPlaygroundConfig(playgroundId);
      if (playgroundConfig?.contractAddress) {
        const tokenBalance: TokenBalance = {
          accountAddress: address.toString(),
          contractAddress: playgroundConfig.contractAddress.toString(),
          balance: previousBalance + balance, // Total balance after funding
          decimals: playgroundConfig.decimals || 18,
          symbol: playgroundConfig.name || 'TOKEN',
          lastUpdated: new Date(),
        };

        playgroundStore.setTokenBalance(playgroundId, tokenBalance);
        // Token balance entry created for explorer visibility
      }

      return {
        success: true,
        data: {
          address,
          previousBalance,
          newBalance: previousBalance + balance,
          amountAdded: balance,
          playgroundId,
        },
      };
    } catch (error) {
      toast.error('Account funding failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Internal helper methods (copied from EVM actions)
  private async createAccountInternal(address: Address): Promise<Address | null> {
    const account = await this.evm.createAccount(address);
    // Note: Recording is handled by the calling method, not here
    return account;
  }

  private async fundAccountInternal(address: Address, balance: bigint): Promise<{ success: boolean; error: unknown }> {
    try {
      await this.evm.fundAccount(address, balance);
      const result = { success: true, error: null };

      // Note: Recording is handled by the calling method, not here

      return result;
    } catch (e) {
      console.error('Account funding failed:', e);
      return { success: false, error: e };
    }
  }

  private async getAccountInternal(address: Address): Promise<AccountInfo | null> {
    try {
      const res = await this.evm.getAccountInfo(address);
      return res;
    } catch (e) {
      console.error('Failed to get account:', e);
      return null;
    }
  }

  /**
   * Update token balance in playground store
   */
  updateTokenBalance(playgroundId: number, accountAddress: string, contractAddress: string, balance: bigint, decimals: number = 18, symbol?: string): void {
    const playgroundStore = usePlaygroundStore.getState();

    const tokenBalance: TokenBalance = {
      contractAddress,
      accountAddress,
      balance,
      decimals,
      symbol,
      lastUpdated: new Date(),
    };

    playgroundStore.setTokenBalance(playgroundId, tokenBalance);
  }

  /**
   * Get playground configuration
   */
  getPlaygroundConfig(playgroundId: number): PlaygroundConfig | undefined {
    const playgroundStore = usePlaygroundStore.getState();
    return playgroundStore.getPlaygroundConfig(playgroundId);
  }

  /**
   * Get playground transaction history
   */
  getPlaygroundTransactions(playgroundId: number): Transaction[] {
    const playgroundStore = usePlaygroundStore.getState();
    return playgroundStore.getTransactionHistory(playgroundId);
  }

  /**
   * Get playground token balances
   */
  getPlaygroundTokenBalances(playgroundId: number): Map<string, TokenBalance> {
    const playgroundStore = usePlaygroundStore.getState();
    return playgroundStore.getTokenBalances(playgroundId);
  }

  /**
   * Get account info from EVM
   */
  async getAccountInfo(address: Address): Promise<AccountInfo | null> {
    return this.evm.getAccountInfo(address);
  }
}

export default EVMAdapter;
