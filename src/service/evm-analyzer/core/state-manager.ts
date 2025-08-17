import { Address, Account } from '@ethereumjs/util';
import { MerkleStateManager } from '@ethereumjs/statemanager';
import { AccountInfo } from '../types';

export class StateManagerService {
  stateManager: MerkleStateManager;
  constructor(stateManager: MerkleStateManager) {
    this.stateManager = stateManager;
  }

  async createAccount(address: string): Promise<Address> {
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));
    await this.stateManager.putAccount(addr, undefined);
    return addr;
  }

  async fundAccount(address: string, balance: bigint): Promise<Address> {
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));

    const existingAccount = await this.stateManager.getAccount(addr);
    const account = new Account(existingAccount?.nonce || 0n, balance, existingAccount?.storageRoot, existingAccount?.codeHash);

    await this.stateManager.putAccount(addr, account);
    return addr;
  }

  async getAccountInfo(address: string): Promise<AccountInfo | null> {
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));
    const account = await this.stateManager.getAccount(addr);

    if (!account) return null;

    return {
      address: address,
      balance: account.balance,
      nonce: account.nonce,
      isContract: !account.isEmpty() && account.codeHash.length > 0,
      codeHash: Buffer.from(account.codeHash).toString('hex'),
      storageRoot: Buffer.from(account.storageRoot).toString('hex'),
    };
  }

  async setCode(address: string, code: Uint8Array): Promise<void> {
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));
    await this.stateManager.putCode(addr, code);
  }

  async getCode(address: string): Promise<Uint8Array | undefined> {
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));
    return await this.stateManager.getCode(addr);
  }

  async getBalance(address: string): Promise<bigint> {
    const accountInfo = await this.getAccountInfo(address);
    return accountInfo?.balance || 0n;
  }

  // Storage operations
  async getStorage(address: string, key: Uint8Array): Promise<Uint8Array> {
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));
    return await this.stateManager.getStorage(addr, key);
  }

  async putStorage(address: string, key: Uint8Array, value: Uint8Array): Promise<void> {
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));
    await this.stateManager.putStorage(addr, key, value);
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

  // Export complete account state
  async exportAccountState(address: string): Promise<{
    account: AccountInfo | null;
    code?: Uint8Array;
    storage?: Map<string, Uint8Array>;
  }> {
    const account = await this.getAccountInfo(address);
    if (!account) return { account: null };

    const result: {
      account: AccountInfo;
      code?: Uint8Array;
      storage?: Map<string, Uint8Array>;
    } = { account };

    // Export code if it's a contract
    if (account.isContract) {
      result.code = await this.getCode(address);
    }

    // Note: Storage export would require iterating through all storage slots
    // This is complex and would need additional implementation
    // For now, we provide the interface but storage would need to be
    // exported through specific slot queries

    return result;
  }

  // Get all accounts (this would need to iterate through the state trie)
  // This is a placeholder - actual implementation would be complex
  async getAllAccounts(): Promise<string[]> {
    // This would require iterating through the entire state trie
    // For now, return empty array as a placeholder
    // In a real implementation, you'd need to traverse the Merkle Patricia Trie
    return [];
  }
}
