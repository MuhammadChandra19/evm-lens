import { createEVM, EVM as EVMType } from '@ethereumjs/evm';
import { Blockchain as BlockchainType, createBlockchain } from '@ethereumjs/blockchain';
import { MerkleStateManager } from '@ethereumjs/statemanager';

export class EVMManager {
  private evm: EVMType | null = null;
  private blockchain: BlockchainType | null = null;
  private stateManager: MerkleStateManager | null = null;

  constructor(evm: EVMType, blockchain: BlockchainType, stateManager: MerkleStateManager) {
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
      throw new Error('EVM not initialized');
    }
    return this.evm;
  }

  getStateManager(): MerkleStateManager {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }
    return this.stateManager;
  }

  getBlockchain(): BlockchainType {
    if (!this.blockchain) {
      throw new Error('Blockchain not initialized');
    }
    return this.blockchain;
  }

  async cleanup(): Promise<void> {
    // Cleanup resources if needed
  }

  // State export methods
  async getStateRoot(): Promise<Uint8Array> {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }
    return this.stateManager.getStateRoot();
  }

  async setStateRoot(root: Uint8Array): Promise<void> {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }
    await this.stateManager.setStateRoot(root);
  }

  async checkpoint(): Promise<void> {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }
    await this.stateManager.checkpoint();
  }

  async commit(): Promise<void> {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }
    await this.stateManager.commit();
  }

  async revert(): Promise<void> {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }
    await this.stateManager.revert();
  }

  async flush(): Promise<void> {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }
    await this.stateManager.flush();
  }

  // Note: MerkleStateManager doesn't have a copy method in v10
  // Use checkpoint/commit/revert for state management instead
}
