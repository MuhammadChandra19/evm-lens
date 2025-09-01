import { Address } from "@ethereumjs/util";
import { ActionRecorder } from "../action-recorder";
import EVMAnalyzer, { AccountInfo, CallResult } from "../evm-analyzer";
import {
  ContractDeploymentData,
  CreateNewEVMPayload,
  EVMResult,
  TxData,
} from "./types";
import { ETH_DECIMAL } from "@/lib/constants";
import useAppStore from "@/store/app";
import {
  generateFunctionHash,
  generateInputHash,
} from "../evm-analyzer/abi/util";
import { AbiFunction } from "../evm-analyzer/abi/types";

/**
 * EVM Adapter - handles all EVM operations with consistent return types
 * Integrates with playground store for state management
 */
export class EVMAdapter {
  private recordAction: typeof ActionRecorder.prototype.recordAction;
  private evm: EVMAnalyzer;

  constructor(
    evm: EVMAnalyzer,
    recordAction: typeof ActionRecorder.prototype.recordAction,
  ) {
    this.evm = evm;
    this.recordAction = recordAction;
  }

  /**
   * Deploy contract with playground integration (copied from deployContractToEVM)
   */
  async deployContract(
    payload: CreateNewEVMPayload,
    playgroundId: number,
    shouldRecord: boolean = true,
  ): Promise<EVMResult<ContractDeploymentData>> {
    try {
      const appStore = useAppStore.getState();
      const owner = new Address(
        Buffer.from(payload.ownerAddress.slice(2), "hex"),
      );
      const ownerAddress = await this.createAccount(owner);
      if (!ownerAddress) {
        return {
          success: false,
          error: "Failed to create owner account",
        };
      }

      const contract = new Address(
        Buffer.from(payload.contractAddress.slice(2), "hex"),
      );
      const contractAddress = await this.createAccount(contract);
      if (!contractAddress) {
        return {
          success: false,
          error: "Failed to create contract account",
        };
      }

      const res = await this.evm.deployContract(
        ownerAddress,
        payload.constructorBytecode,
        contractAddress,
      );

      if (!res.success) {
        return {
          success: false,
          error: "Contract deployment failed",
        };
      }

      const parsedBalance =
        payload.initialOwnerBalance * BigInt(10 ** ETH_DECIMAL);
      await this.fundAccount(ownerAddress, parsedBalance);

      const ownerAccountInfo = await this.evm.getAccountInfo(ownerAddress);
      const contractAccountInfo =
        await this.evm.getAccountInfo(contractAddress);

      const accounts: [string, AccountInfo][] = [];
      if (ownerAccountInfo) {
        accounts.push([ownerAddress.toString(), ownerAccountInfo]);
      }
      if (contractAccountInfo) {
        accounts.push([contractAddress.toString(), contractAccountInfo]);
      }
      appStore.setAccounts(accounts);
      appStore.createNewPlayground({
        abi: payload.abi,
        id: payload.id,
        contractAddress: contractAddress,
        decimals: payload.decimal,
        name: payload.projectName,
        ownerAddress: ownerAddress,
        totalSupply:
          BigInt(payload.totalSupply) * BigInt(10 ** payload.decimal), // Fix calculation
      });

      // Record the action with detailed context
      if (shouldRecord) {
        await this.recordAction(
          "DEPLOY_CONTRACT",
          payload,
          res.gasUsed.toString(),
        );
      }

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
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async callFunction(
    tx: TxData,
    shouldRecord: boolean = true,
  ): Promise<EVMResult<CallResult>> {
    try {
      const appStore = useAppStore.getState();
      const config = appStore.getPlaygroundConfig(tx.playgroundId);

      let data = generateFunctionHash(tx.func);
      data += generateInputHash(tx.func, tx.args, config.decimals);

      let ethAmount = 0n;
      if (
        tx.type === "function" &&
        (tx.func as AbiFunction).stateMutability === "payable"
      ) {
        ethAmount = tx.ethAmount * BigInt(10 ** config.decimals);
      }

      const result = await this.evm.callContract(
        {
          data,
          from: tx.executorAddress,
          to: config.contractAddress,
          gasLimit: BigInt(tx.gasLimit),
          value: ethAmount,
        },
        {
          includeMemory: true,
          includeStack: true,
          includeStorage: true,
        },
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Function execution failed",
        };
      }

      if (
        shouldRecord &&
        tx.type === "function" &&
        (tx.func as AbiFunction).stateMutability !== "view"
      ) {
        const actionPayload = {
          ...tx,
          executorAddres: [tx.executorAddress.toString(), "Address"],
        };

        await this.recordAction(
          "CALL_FUNCTION",
          actionPayload,
          result.gasUsed.toString(),
        );
      }

      return {
        success: true,
        data: result,
        gasUsed: result.gasUsed,
        gasRefund: result.gasRefund,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async createAccount(
    address: Address,
    shouldRecord: boolean = true,
  ): Promise<Address | null> {
    const account = await this.evm.createAccount(address);

    if (account && shouldRecord) {
      const acitonPayload = { address: address.toString() };
      await this.recordAction("CREATE_ACCOUNT", acitonPayload, "0");
    }

    return account;
  }

  async fundAccount(
    address: Address,
    balance: bigint,
    shouldRecord: boolean = true,
    recordAmount?: bigint,
  ) {
    try {
      await this.evm.fundAccount(address, balance);
      const result = { success: true, error: null };

      if (shouldRecord) {
        const actionPayload = {
          address: [address.toString(), "Address"],
          balance: recordAmount !== undefined ? recordAmount : balance,
        };
        await this.recordAction("FUND_ACCOUNT", actionPayload, "0");
      }

      return result;
    } catch (e) {
      return { success: false, error: e };
    }
  }

  async getAccount(address: Address) {
    try {
      const res = await this.evm.getAccountInfo(address);
      return res;
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : "Unknown error occurred",
      );
    }
  }
}
