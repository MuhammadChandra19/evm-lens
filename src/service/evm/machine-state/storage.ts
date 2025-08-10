import ERRORS from '../errors';
import type { Address } from '../types';

type StorageLayout = Map<string, Map<string, Buffer>>;

export default class Storage {
  private _storage: StorageLayout;

  /**
   * Initializes empty EVM storage
   */
  constructor() {
    this._storage = new Map();
  }

  /**
   * Gets a storage value for a specific address and key
   * @param address - Contract address
   * @param key - Storage key as hex string
   * @returns Storage value as Buffer (32 bytes), or zero-filled buffer if not found
   */
  public get(address: Address, key: string): Buffer {
    return this._storage.get(address)?.get(key) ?? Buffer.alloc(32);
  }

  /**
   * Sets a storage value for a specific address and key
   * @param address - Contract address
   * @param key - Storage key as hex string
   * @param value - Storage value as Buffer (max 32 bytes)
   * @throws Error if value is larger than 32 bytes
   */
  public set(address: Address, key: string, value: Buffer): void {
    // todo: add validation for key size after switching to buffers

    if (value.length > 32) throw new Error(ERRORS.INVALID_STORAGE_VALUE_SIZE);

    const oldStorageValue = this._storage.get(address)?.get(key);
    if (!oldStorageValue) this._storage.set(address, new Map());
    if (oldStorageValue?.equals(value)) return;

    // todo: implement logger & persistent changes log

    this._storage.get(address)!.set(key, value);
  }

  /**
   * Gets a storage value as BigInt for easier arithmetic operations
   * @param address - Contract address
   * @param key - Storage key as hex string
   * @returns Storage value converted to BigInt
   */
  public getAsBigInt(address: Address, key: string): bigint {
    return BigInt('0x' + this.get(address, key).toString('hex'));
  }

  /**
   * Sets a storage value from a BigInt value
   * @param address - Contract address
   * @param key - Storage key as hex string
   * @param value - Storage value as BigInt
   */
  public setAsBigInt(address: Address, key: string, value: bigint): void {
    this.set(address, key, Buffer.from(value.toString(16).padStart(64, '0'), 'hex'));
  }

  /**
   * Gets a JSON representation of all storage for debugging
   * @returns JSON string of the entire storage structure
   */
  get dump(): string {
    return JSON.stringify(this._storage, null, 2);
  }
}
