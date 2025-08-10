import ERRORS from '../errors';

// Add this constant at the top
const MAX_MEMORY_SIZE = 16 * 1024 * 1024; // 16MB limit

export default class Memory {
  protected _memory: Buffer;

  /**
   * Initializes empty EVM memory
   */
  constructor() {
    this._memory = Buffer.alloc(0);
  }

  /**
   * Writes data to memory at the specified offset, expanding memory if needed
   * @param offset - Byte offset to write at
   * @param value - Buffer containing data to write
   * @param size - Expected size of the data (1 for byte, 32 for word, or custom size)
   * @throws Error if offset is negative or value size doesn't match expected size
   */
  write(offset: number, value: Buffer, size: 1 | 32 | number) {
    if (offset < 0) throw new Error(ERRORS.INVALID_MEMORY_OFFSET);
    if (value.length !== size) throw new Error(ERRORS.INVALID_MEMORY_VALUE_SIZE);

    const newSize = offset + size;
    if (newSize > MAX_MEMORY_SIZE) {
      throw new Error(ERRORS.INVALID_MEMORY_OFFSET); // Reuse existing error
    }

    const overflow = Math.ceil(newSize / 32) * 32 - this.size;
    if (overflow > 0) {
      if (this.size + overflow > MAX_MEMORY_SIZE) {
        throw new Error(ERRORS.INVALID_MEMORY_OFFSET);
      }
      this._memory = Buffer.concat([this._memory, Buffer.alloc(overflow)]);
    }

    for (const byte of value) this._memory[offset++] = byte;
  }

  /**
   * Reads data from memory at the specified offset, expanding memory if needed
   * @param offset - Byte offset to read from
   * @param size - Number of bytes to read
   * @returns Buffer containing the requested data
   * @throws Error if offset is negative
   */
  read(offset: number, size: number): Buffer {
    if (offset < 0) throw new Error(ERRORS.INVALID_MEMORY_OFFSET);
    if (size === 0) return Buffer.alloc(0);

    const newSize = offset + size;
    if (newSize > MAX_MEMORY_SIZE) {
      throw new Error(ERRORS.INVALID_MEMORY_OFFSET);
    }

    const overflow = Math.ceil(newSize / 32) * 32 - this.size;
    if (overflow > 0) {
      if (this.size + overflow > MAX_MEMORY_SIZE) {
        throw new Error(ERRORS.INVALID_MEMORY_OFFSET);
      }
      this._memory = Buffer.concat([this._memory, Buffer.alloc(overflow)]);
    }

    const output = Buffer.alloc(size);
    this._memory.copy(output, 0, offset);
    return output;
  }

  /**
   * Gets the current memory size in bytes
   * @returns Total memory size
   */
  get size(): number {
    return this._memory.length;
  }

  /**
   * Gets the number of active 32-byte words in memory
   * @returns Number of words (memory size / 32)
   */
  get activeWordsCount(): number {
    return this.size / 32;
  }

  /**
   * Gets a hex dump of memory contents for debugging
   * @returns String representation of memory as hex, one word per line
   */
  get dump(): string {
    let dump = '';
    for (let i = 0; i < this._memory.length; i += 32) {
      dump += this._memory.subarray(i, i + 32).toString('hex') + '\n';
    }
    return dump;
  }
}
