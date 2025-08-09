import { MAX_256_BITS } from '../constants';
import { ERRORS } from '../errors';

/**
 * Maximum EVM stack depth.
 * The EVM stack can hold at most 1024 items at any time.
 */
const MAX_DEPTH = 1024;

/**
 * LIFO stack of 256-bit words emulating EVM stack semantics.
 *
 * - Items are 256-bit unsigned integers represented as `bigint`.
 * - Maximum depth is 1024 items.
 * - Values must be within the inclusive range [0, MAX_256_BITS].
 *   Note: In typical EVM semantics the maximum valid value is 2^256 - 1;
 *   this implementation currently validates against `value > MAX_256_BITS`.
 */
class Stack {
  protected _stack: bigint[];
  protected _len: number;

  /**
   * Creates an empty stack.
   */
  constructor() {
    this._stack = [];
    this._len = 0;
  }

  /**
   * Pushes a 256-bit word onto the stack.
   *
   * - Validates that `value` is within the allowed 256-bit unsigned range.
   * - Ensures the push does not exceed the maximum depth (1024).
   *
   * @param value - The unsigned 256-bit word to push.
   *
   * @throws {Error} If `value < 0` or `value > MAX_256_BITS` (`ERRORS.INVALID_STACK_VALUE`).
   * @throws {Error} If the stack would exceed `MAX_DEPTH` (`ERRORS.STACK_OVERFLOW`).
   */
  push(value: bigint) {
    if (value < 0 || value > MAX_256_BITS) {
      throw new Error(ERRORS.INVALID_STACK_VALUE, {
        cause: {
          item: value,
        },
      });
    }

    if (this._len + 1 > MAX_DEPTH) {
      throw new Error(ERRORS.STACK_OVERFLOW);
    }

    this._stack[this._len++] = value;
  }

  /**
   * Pops and returns the top 256-bit word from the stack.
   *
   * @returns The top `bigint` value.
   *
   * @throws {Error} If the stack is empty (`ERRORS.STACK_UNDERFLOW`).
   */
  pop(): bigint {
    if (this._len === 0) {
      throw new Error(ERRORS.STACK_UNDERFLOW);
    }

    return this._stack[--this._len];
  }

  /**
   * Pops `n` 256-bit words from the stack.
   *
   * @param n - The number of words to pop.
   * @returns An array of `bigint` values.
   *
   * @throws {Error} If the stack does not have at least `n` items (`ERRORS.STACK_UNDERFLOW`).
   */
  popN(n: number): bigint[] {
    if (this._len < n) {
      throw new Error(ERRORS.STACK_UNDERFLOW);
    }

    if (n === 0) {
      return [];
    }

    const arr = Array(n);
    const cache = this._stack;

    for (let pop = 0; pop < n; pop++) {
      arr[pop] = cache[--this._len];
    }

    return arr;
  }

  /**
   * Peek `n` 256-bit words from the stack.
   *
   * @param n - The number of words to peek.
   * @returns The `bigint` value at the given position.
   *
   * @throws {Error} If the stack does not have at least `n` items (`ERRORS.STACK_UNDERFLOW`).
   */
  peek(n: number) {
    if (this._len === 0) throw new Error(ERRORS.STACK_UNDERFLOW);

    return this._stack[this._len - (n || 1)];
  }

  /**
   * Swaps the top `pos` items on the stack.
   *
   * @param pos - The number of items to swap.
   *
   * @throws {Error} If the stack does not have at least `pos` items (`ERRORS.STACK_UNDERFLOW`).
   */
  swap(pos: number) {
    if (this._len < pos) {
      throw new Error(ERRORS.STACK_UNDERFLOW);
    }

    const top = this._stack[this._len - 1];
    this._stack[this._len - 1] = this._stack[this._len - pos - 1];
    this._stack[this._len - pos - 1] = top;
  }

  /**
   * Returns a copy of the current stack.
   *
   * @returns An array of `bigint` values.
   */
  get stack(): bigint[] {
    return this._stack.slice(0, this._len);
  }
}

export default Stack;
