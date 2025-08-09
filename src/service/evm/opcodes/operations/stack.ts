import { ERRORS } from '../../errors';
import { MachineState } from '../../machine-state/types';

// 0x50 - POP
export const POP = (state: MachineState) => {
  state.stack.pop();
};

/**
 * Pushes a value to the stack
 *  - 0x60 - 0x7f
 * @param state - The machine state
 * @returns void
 *
 * @throws {Error} If the program counter is out of bounds (`ERRORS.PROGRAM_COUNTER_OUT_OF_BOUNDS`).
 */
export const PUSH = (state: MachineState) => {
  const size = state.code[state.pc] - 0x5f;
  if (state.pc + size >= state.code.length) {
    throw new Error(ERRORS.PROGRAM_COUNTER_OUT_OF_BOUNDS);
  }

  const value = state.code.slice(state.pc + 1, state.pc + size + 1);
  const valueBigInt = BigInt(value.toString());

  state.pc += size + 1;
  state.stack.push(valueBigInt);
};

/**
 * Duplicates the top value on the stack
 *  - 0x80 - 0x8f
 * @param state - The machine state
 * @returns void
 *
 * @throws {Error} If the program counter is out of bounds (`ERRORS.PROGRAM_COUNTER_OUT_OF_BOUNDS`).
 */
export const DUP = (state: MachineState) => {
  const pos = state.code[state.pc] - 0x7f;
  const value = state.stack.peek(pos);
  state.stack.push(value);
};

/**
 * Swaps the top `pos` items on the stack
 *  - 0x90 - 0x9f
 * @param state - The machine state
 * @returns void
 *
 * @throws {Error} If the program counter is out of bounds (`ERRORS.PROGRAM_COUNTER_OUT_OF_BOUNDS`).
 */
export const SWAP = (state: MachineState) => {
  const pos = state.code[state.pc] - 0x9f;
  state.stack.swap(pos);
};
