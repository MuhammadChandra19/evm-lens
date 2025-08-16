import { createEVM, EVM as EVMType } from "@ethereumjs/evm";
import {
  Blockchain as BlockchainType,
  createBlockchain,
} from "@ethereumjs/blockchain";
import { MerkleStateManager } from "@ethereumjs/statemanager";

export class EVMManager {
  private evm: EVMType | null = null;
  private blockchain: BlockchainType | null = null;
  private stateManager: MerkleStateManager | null = null;

  constructor(
    evm: EVMType,
    blockchain: BlockchainType,
    stateManager: MerkleStateManager,
  ) {
    this.evm = evm;
    this.blockchain = blockchain;
    this.stateManager = stateManager;
  }

  static async create(): Promise<EVMManager> {
    const stateManager = new MerkleStateManager();
    const blockchain = await createBlockchain();
    const evm = await createEVM({
      stateManager,
      blockchain,
    });

    return new EVMManager(evm, blockchain, stateManager);
  }

  getEVM(): EVMType {
    if (!this.evm) {
      throw new Error("EVM not initialized");
    }
    return this.evm;
  }

  getStateManager(): MerkleStateManager {
    if (!this.stateManager) {
      throw new Error("State manager not initialized");
    }
    return this.stateManager;
  }

  getBlockchain(): BlockchainType {
    if (!this.blockchain) {
      throw new Error("Blockchain not initialized");
    }
    return this.blockchain;
  }

  async cleanup(): Promise<void> {
    // Cleanup resources if needed
  }
}
