import { Address, Account } from '@ethereumjs/util';
import { MerkleStateManager } from '@ethereumjs/statemanager';
import { AccountInfo } from '../types';

export class StateManagerService {
  constructor(private stateManager: MerkleStateManager) {}

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
}
