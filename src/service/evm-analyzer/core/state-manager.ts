import { Address, Account } from "@ethereumjs/util";
import { MerkleStateManager } from "@ethereumjs/statemanager";
import { AccountInfo } from "../types";

export class StateManagerService {
  stateManager: MerkleStateManager;
  constructor(stateManager: MerkleStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Create a new account at the given address
   * @param address - The Address object to create
   * @returns The created Address object
   */
  async createAccount(address: Address): Promise<Address> {
    await this.stateManager.putAccount(address, undefined);
    return address;
  }

  /**
   * Fund an account with the specified balance
   * @param address - The Address object to fund
   * @param balance - The balance in wei
   * @returns The Address object
   */
  async fundAccount(address: Address, balance: bigint): Promise<Address> {
    const existingAccount = await this.stateManager.getAccount(address);
    const account = new Account(
      existingAccount?.nonce || 0n,
      balance,
      existingAccount?.storageRoot,
      existingAccount?.codeHash,
    );

    await this.stateManager.putAccount(address, account);
    return address;
  }

  /**
   * Get comprehensive account information
   * @param address - The Address object to query
   * @returns AccountInfo object or null if account doesn't exist
   */
  async getAccountInfo(address: Address): Promise<AccountInfo | null> {
    const account = await this.stateManager.getAccount(address);

    if (!account) return null;

    const isContract = !account.isEmpty() && account.nonce === 0n;

    const accountInfo: AccountInfo = {
      address: address,
      balance: account.balance,
      nonce: account.nonce,
      isContract,
      codeHash: Buffer.from(account.codeHash).toString("hex"),
      storageRoot: Buffer.from(account.storageRoot).toString("hex"),
    };

    // Include code if it's a contract
    if (isContract) {
      const code = await this.stateManager.getCode(address);
      if (code) {
        accountInfo.code = code;
      }
    }

    return accountInfo;
  }

  /**
   * Set contract code for an address
   * @param address - The Address object
   * @param code - The bytecode to set
   */
  async setCode(address: Address, code: Uint8Array): Promise<void> {
    await this.stateManager.putCode(address, code);
  }

  /**
   * Get contract code for an address
   * @param address - The Address object
   * @returns The contract bytecode or undefined
   */
  async getCode(address: Address): Promise<Uint8Array | undefined> {
    return await this.stateManager.getCode(address);
  }

  /**
   * Get account balance
   * @param address - The Address object
   * @returns The balance in wei
   */
  async getBalance(address: Address): Promise<bigint> {
    const accountInfo = await this.getAccountInfo(address);
    return accountInfo?.balance || 0n;
  }

  // Storage operations
  /**
   * Get storage value for a contract
   * @param address - The contract address
   * @param key - The storage key
   * @returns The storage value
   */
  async getStorage(address: Address, key: Uint8Array): Promise<Uint8Array> {
    return await this.stateManager.getStorage(address, key);
  }

  /**
   * Set storage value for a contract
   * @param address - The contract Address object
   * @param key - The storage key
   * @param value - The storage value
   */
  async putStorage(
    address: Address,
    key: Uint8Array,
    value: Uint8Array,
  ): Promise<void> {
    await this.stateManager.putStorage(address, key, value);
  }

  // State export methods
  async getStateRoot(): Promise<Uint8Array> {
    return await this.stateManager.getStateRoot();
  }

  async setStateRoot(root: Uint8Array): Promise<void> {
    await this.stateManager.setStateRoot(root);
  }

  async checkpoint(): Promise<void> {
    await this.stateManager.checkpoint();
  }

  async commit(): Promise<void> {
    await this.stateManager.commit();
  }

  async revert(): Promise<void> {
    await this.stateManager.revert();
  }

  async flush(): Promise<void> {
    await this.stateManager.flush();
  }

  // Note: MerkleStateManager doesn't have a copy method in v10
  // Use checkpoint/commit/revert for state management instead
  // Account state export is handled by the EVM store serializers
}
