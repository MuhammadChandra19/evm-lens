import { ERRORS } from '../../errors';
import { MachineState } from '../../machine-state/types';

/**
 * Stops the execution of the program
 *  - 0x00
 * @returns void
 *
 * @throws {Error} If the program counter is out of bounds (`ERRORS.PROGRAM_COUNTER_OUT_OF_BOUNDS`).
 */
export const STOP = () => {
  throw new Error(ERRORS.STOP);
};

/**
 * Jumps to the destination if the condition is true
 *  - 0x57
 * @param state - The machine state
 * @returns void
 *
 * @throws {Error} If the program counter is out of bounds (`ERRORS.PROGRAM_COUNTER_OUT_OF_BOUNDS`).
 */
export function JUMPI(state: MachineState) {
  const [dest, cond] = state.stack.popN(2);
  if (cond === 0n) return;
  if (dest >= state.code.length) {
    throw new Error(ERRORS.JUMP_OUT_OF_BOUNDS);
  }
  if (state.code[Number(dest)] !== 0x5b) {
    throw new Error(ERRORS.INVALID_JUMP_DESTINATION);
  }
  state.pc = Number(dest);
}

// 0x58
export function PC(state: MachineState) {
  state.stack.push(BigInt(state.pc));
}

// 0x5a
export function GAS(state: MachineState) {
  state.stack.push(state.gasAvailable);
}

// 0x5b
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function JUMPDEST(_state: MachineState) {
  // do nothing
}
