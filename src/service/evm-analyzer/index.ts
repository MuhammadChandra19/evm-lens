import { EVMManager } from './core/evm-manager';
import { StateManagerService } from './core/state-manager';
import { ContractManager } from './core/contract-manager';
import { ExecutionAnalyzer } from './analysis/analyzer';
import { TxData, TraceOptions, AccountInfo, ExecutionStep, ExportedEVMState, ImportableEVMState } from './types';

export class EVMAnalyzer {
  private evmManager: EVMManager;
  private stateManager: StateManagerService;
  private contractManager: ContractManager;

  constructor(evmManager: EVMManager) {
    this.evmManager = evmManager;
    this.stateManager = new StateManagerService(evmManager.getStateManager());
    this.contractManager = new ContractManager(evmManager, this.stateManager);
  }

  static async create(): Promise<EVMAnalyzer> {
    const evmManager = await EVMManager.create();
    return new EVMAnalyzer(evmManager);
  }

  // State management
  async createAccount(address: string) {
    return this.stateManager.createAccount(address);
  }

  async fundAccount(address: string, balance: bigint) {
    return this.stateManager.fundAccount(address, balance);
  }

  async getAccountInfo(address: string): Promise<AccountInfo | null> {
    return this.stateManager.getAccountInfo(address);
  }

  // Contract management
  async deployContract(fromAddress: string, bytecode: string, contractAddress: string, options?: TraceOptions) {
    return this.contractManager.deployContract(fromAddress, bytecode, contractAddress, options);
  }

  async callContract(txData: TxData, options?: TraceOptions) {
    return this.contractManager.callContract(txData, options);
  }

  // Analysis
  analyzeExecution(steps: ExecutionStep[]) {
    return ExecutionAnalyzer.analyze(steps);
  }

  // Utility getters
  get stateManagerService() {
    return this.stateManager;
  }

  get contractManagerService() {
    return this.contractManager;
  }

  async cleanup() {
    await this.evmManager.cleanup();
  }

  // State export and management methods
  async getStateRoot(): Promise<Uint8Array> {
    return await this.evmManager.getStateRoot();
  }

  async setStateRoot(root: Uint8Array): Promise<void> {
    await this.evmManager.setStateRoot(root);
  }

  async checkpoint(): Promise<void> {
    await this.evmManager.checkpoint();
  }

  async commit(): Promise<void> {
    await this.evmManager.commit();
  }

  async revert(): Promise<void> {
    await this.evmManager.revert();
  }

  async flush(): Promise<void> {
    await this.evmManager.flush();
  }

  // Note: State copying is not directly supported in ethereumjs v10
  // Use checkpoint/commit/revert for state management instead
  async createCheckpoint(): Promise<void> {
    await this.checkpoint();
  }

  async restoreCheckpoint(): Promise<void> {
    await this.revert();
  }

  // Export complete EVM state
  async exportState(): Promise<ExportedEVMState> {
    const stateRoot = await this.getStateRoot();
    const blockchain = this.evmManager.getBlockchain();

    // Get latest block info
    const latestBlock = await blockchain.getCanonicalHeadBlock();

    return {
      stateRoot: Buffer.from(stateRoot).toString('hex'),
      accounts: [], // Would need to be populated with known accounts
      blockchain: {
        latestBlockNumber: latestBlock.header.number,
        latestBlockHash: Buffer.from(latestBlock.hash()).toString('hex'),
      },
    };
  }

  // Import state from exported data
  async importState(stateData: ImportableEVMState): Promise<void> {
    // Set the state root
    const stateRoot = Buffer.from(stateData.stateRoot, 'hex');
    await this.setStateRoot(stateRoot);

    // Restore accounts if provided
    if (stateData.accounts) {
      for (const accountData of stateData.accounts) {
        try {
          // Create account
          await this.createAccount(accountData.address);

          // Set balance
          if (accountData.balance !== '0') {
            await this.fundAccount(accountData.address, BigInt(accountData.balance));
          }

          // Set code if it's a contract
          if (accountData.code) {
            const codeBytes = Buffer.from(accountData.code, 'hex');
            await this.stateManager.setCode(accountData.address, codeBytes);
          }

          // Restore storage
          if (accountData.storage) {
            for (const [slot, value] of accountData.storage) {
              const slotBytes = Buffer.from(slot, 'hex');
              const valueBytes = Buffer.from(value, 'hex');
              await this.stateManager.putStorage(accountData.address, slotBytes, valueBytes);
            }
          }
        } catch (error) {
          console.warn(`Failed to restore account ${accountData.address}:`, error);
        }
      }
    }
  }

  // Direct access to underlying components for advanced usage
  get evmManagerInstance() {
    return this.evmManager;
  }

  get rawEVM() {
    return this.evmManager.getEVM();
  }

  get rawBlockchain() {
    return this.evmManager.getBlockchain();
  }

  get rawStateManager() {
    return this.evmManager.getStateManager();
  }
}

export default EVMAnalyzer;
export * from './types';
export { ExecutionAnalyzer } from './analysis/analyzer';
