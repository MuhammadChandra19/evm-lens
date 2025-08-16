import { EVMManager } from "./core/evm-manager";
import { StateManagerService } from "./core/state-manager";
import { ContractManager } from "./core/contract-manager";
import { ExecutionAnalyzer } from "./analysis/analyzer";
import { TxData, TraceOptions, AccountInfo, ExecutionStep } from "./types";

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
  async deployContract(bytecode: string, options?: TraceOptions) {
    return this.contractManager.deployContract(bytecode, options);
  }

  async deployContractToAddress(address: string, runtimeBytecode: string) {
    return this.contractManager.deployContractToAddress(
      address,
      runtimeBytecode,
    );
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
}

export default EVMAnalyzer;
export * from "./types";
export { ExecutionAnalyzer } from "./analysis/analyzer";
