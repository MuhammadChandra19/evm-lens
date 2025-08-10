import { MAX_256_BITS } from '../constants';
import ERRORS from '../errors';

const EMPTY_STACK = 0;
const FULL_STACK = 1024;

export default class Stack {
  protected _stack: bigint[];

  /**
   * Initializes an empty EVM stack
   */
  constructor() {
    this._stack = [];
  }

  /**
   * Pushes a value onto the top of the stack
   * @param value - BigInt value to push (must be 0 <= value <= 2^256)
   * @throws Error if value is out of range or stack is full
   */
  push(value: bigint) {
    if (value < 0n) throw new Error(ERRORS.STACK_VALUE_TOO_SMALL);
    if (value > MAX_256_BITS) throw new Error(ERRORS.STACK_VALUE_TOO_BIG);
    if (this._stack.length === FULL_STACK) throw new Error(ERRORS.STACK_OVERFLOW);

    this._stack.push(value);
  }

  /**
   * Pops and returns the top value from the stack
   * @returns The top stack value
   * @throws Error if stack is empty
   */
  pop(): bigint {
    if (this._stack.length === EMPTY_STACK) throw new Error(ERRORS.STACK_UNDERFLOW);

    return this._stack.pop()!;
  }

  /**
   * Pops N values from the stack and returns them in execution order
   * @param n - Number of values to pop
   * @returns Array of values in the order they should be used (reversed from stack order)
   * @throws Error if stack doesn't have enough values
   */
  popN(n: number): bigint[] {
    if (this._stack.length < n) throw new Error(ERRORS.STACK_UNDERFLOW);

    return this._stack.splice(this._stack.length - n, n).reverse();
  }

  /**
   * Peeks at a value on the stack without removing it
   * @param n - Position from top (1 = top, 2 = second from top, etc.)
   * @returns The value at the specified position
   * @throws Error if stack is empty or position is invalid
   */
  peek(n?: number): bigint {
    if (this._stack.length === EMPTY_STACK) throw new Error(ERRORS.STACK_UNDERFLOW);

    return this._stack[this._stack.length - (n || 1)];
  }

  /**
   * Swaps the top stack value with the value at position n
   * @param n - Position to swap with (1-indexed from top)
   * @throws Error if stack doesn't have enough values
   */
  swap(n: number) {
    if (this._stack.length < n) throw new Error(ERRORS.STACK_UNDERFLOW);

    const top = this._stack.pop()!;
    const bottom = this._stack[this._stack.length - n];
    this._stack[this._stack.length - n] = top;
    this._stack.push(bottom);
  }

  /**
   * Gets the current stack depth
   * @returns Number of values currently on the stack
   */
  get length(): number {
    return this._stack.length;
  }

  /**
   * Gets a copy of the stack in display order (top to bottom)
   * @returns Array of stack values with top value first
   */
  get dump(): bigint[] {
    return this._stack.slice().reverse();
  }
}
