import { ERRORS } from '../errors';

/**
 * In-memory byte-addressable storage that mimics the EVM's memory semantics.
 *
 * - Memory is conceptually uninitialized and auto-expands in 32-byte words.
 * - Writes beyond the current size expand memory to the next 32-byte boundary that
 *   covers the write range.
 * - Reads beyond the current size return zero-padded bytes without expanding memory.
 */
class Memory {
  protected _memory: Buffer;

  /**
   * Creates an empty memory instance with size 0.
   */
  constructor() {
    this._memory = Buffer.alloc(0);
  }

  /**
   * Stores `size` bytes from `value` starting at `offset`.
   *
   * - If the write would exceed current memory bounds, memory expands to the next
   *   32-byte boundary that fully covers `[offset, offset + size)`.
   * - The `value.length` must exactly equal `size`.
   *
   * Typical EVM analogs:
   * - MSTORE8: `size = 1`
   * - MSTORE: `size = 32`
   *
   * @param offset - Byte offset at which to begin writing. Must be >= 0.
   * @param value - The bytes to write into memory.
   * @param size - Number of bytes to write. Must equal `value.length`.
   *
   * @throws {Error} If `offset < 0` (`ERRORS.INVALID_MEMORY_OFFSET`).
   * @throws {Error} If `value.length !== size` (`ERRORS.INVALID_MEMORY_VALUE_SIZE`).
   */
  store(offset: number, value: Buffer, size: 1 | 32 | number) {
    if (offset < 0) throw new Error(ERRORS.INVALID_MEMORY_OFFSET);
    if (value.length != size) throw new Error(ERRORS.INVALID_MEMORY_VALUE_SIZE);

    const overflow = this.overflow(offset, size);
    if (overflow) this._memory = Buffer.concat([this._memory, Buffer.alloc(overflow)]);

    for (const byte of value) this._memory[offset++] = byte;
  }

  /**
   * Loads `size` bytes starting at `offset`.
   *
   * - If the requested range is fully within current memory, returns a view
   *   (subarray) of the underlying buffer.
   * - If the request extends beyond current memory, returns a new zero-padded
   *   buffer of length `size` containing the readable portion, without expanding memory.
   * - If `size === 0`, returns an empty buffer.
   *
   * @param offset - Byte offset at which to begin reading. Must be >= 0.
   * @param size - Number of bytes to read.
   * @returns A `Buffer` of length `size` with the requested bytes (zero-padded as needed).
   *
   * @throws {Error} If `offset < 0` (`ERRORS.INVALID_MEMORY_OFFSET`).
   */
  load(offset: number, size: number): Buffer {
    if (offset < 0) throw new Error(ERRORS.INVALID_MEMORY_OFFSET);
    if (size === 0) return Buffer.alloc(0);

    const overflow = this.overflow(offset, size);
    if (!overflow) return this._memory.subarray(offset, offset + size);

    const result = Buffer.alloc(size);
    this._memory.copy(result, 0, offset);
    return result;
  }

  /**
   * Computes the number of bytes needed to expand memory (if any) to ensure
   * that `[offset, offset + size)` is fully addressable, rounding up to the
   * next 32-byte boundary.
   *
   * A positive return value indicates additional bytes required to grow memory.
   * A falsy value (typically 0) indicates no growth is required.
   *
   * @param offset - Start byte index of the access.
   * @param size - Number of bytes being accessed.
   * @returns The number of bytes to append to `_memory` to cover the access, rounded to 32 bytes.
   * @private
   */
  private overflow(offset: number, size: number) {
    const required = offset + size;
    return required > this.size ? required - this.size : 0;
  }

  /**
   * Current memory size in bytes.
   */
  get size(): number {
    return this._memory.length;
  }

  /**
   * Number of 32-byte words currently active in memory.
   */
  get activeWordsCount(): number {
    return this.size / 32;
  }

  /**
   * Returns a human-readable dump of memory, where each line is a 32-byte
   * chunk encoded as hex.
   */
  get dump(): string {
    let dump = '';
    for (let i = 0; i < this._memory.length; i += 32) dump += this._memory.subarray(i, i + 32).toString('hex') + '\n';

    return dump;
  }
}

export default Memory;
