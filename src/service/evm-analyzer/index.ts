import { EVMManager } from "./core/evm-manager";
import { StateManagerService } from "./core/state-manager";
import { ContractManager } from "./core/contract-manager";
import { ExecutionAnalyzer } from "./analysis/analyzer";
import { TxData, TraceOptions, AccountInfo, ExecutionStep } from "./types";
import { Address } from "@ethereumjs/util";

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
  /**
   * Create a new account
   * @param address - The Address object to create
   * @returns The created Address object
   */
  async createAccount(address: Address) {
    return this.stateManager.createAccount(address);
  }

  /**
   * Fund an account with the specified balance
   * @param address - The Address object to fund
   * @param balance - The balance in wei
   * @returns The Address object
   */
  async fundAccount(address: Address, balance: bigint) {
    return this.stateManager.fundAccount(address, balance);
  }

  /**
   * Get comprehensive account information
   * @param address - The Address object to query
   * @returns AccountInfo object or null if account doesn't exist
   */
  async getAccountInfo(address: Address): Promise<AccountInfo | null> {
    return this.stateManager.getAccountInfo(address);
  }

  // Contract management
  /**
   * Deploy a contract to the EVM
   * @param fromAddress - The deployer Address object
   * @param bytecode - The contract bytecode (including constructor)
   * @param contractAddress - The target contract Address object
   * @param options - Tracing options
   * @returns Deployment result
   */
  async deployContract(
    fromAddress: Address,
    bytecode: string,
    contractAddress: Address,
    options?: TraceOptions,
  ) {
    return this.contractManager.deployContract(
      fromAddress,
      bytecode,
      contractAddress,
      options,
    );
  }

  /**
   * Call a contract function
   * @param txData - Transaction data
   * @param options - Tracing options
   * @returns Call result with execution steps
   */
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

  // State import/export is handled by the EVM store serializers
  // These methods provide direct access to state root for advanced usage

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
export * from "./types";
export { ExecutionAnalyzer } from "./analysis/analyzer";
