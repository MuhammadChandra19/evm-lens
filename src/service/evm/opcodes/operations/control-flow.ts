import ERRORS from "../../errors";

import type { MachineState } from "../../machine-state/types";

/**
 * STOP opcode (0x00): Halts execution successfully
 * @throws STOP error to terminate execution
 */
export function STOP() {
  throw new Error(ERRORS.STOP);
}

/**
 * JUMP opcode (0x56): Pops destination and jumps to that position
 * Destination must be a valid JUMPDEST (0x5b opcode)
 * @param ms - Machine state
 * @throws Error if jump destination is out of bounds or invalid
 */
export function JUMP(ms: MachineState) {
  const dest = ms.stack.pop();

  // Check if destination is a reasonable number first
  if (dest > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(ERRORS.JUMP_OUT_OF_BOUNDS);
  }

  const destNum = Number(dest);
  if (destNum >= ms.code.length) {
    throw new Error(ERRORS.JUMP_OUT_OF_BOUNDS);
  }

  if (ms.code[destNum] !== 0x5b) {
    throw new Error(ERRORS.JUMP_TO_INVALID_DESTINATION);
  }

  ms.pc = destNum;
}

/**
 * JUMPI opcode (0x57): Pops destination and condition, jumps if condition is non-zero
 * Destination must be a valid JUMPDEST (0x5b opcode)
 * @param ms - Machine state
 * @throws Error if jump destination is out of bounds or invalid
 */
export function JUMPI(ms: MachineState) {
  const [dest, cond] = ms.stack.popN(2);
  if (cond === 0n) return;

  // Check if destination is a reasonable number first
  if (dest > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(ERRORS.JUMP_OUT_OF_BOUNDS);
  }

  const destNum = Number(dest);
  if (destNum >= ms.code.length) {
    throw new Error(ERRORS.JUMP_OUT_OF_BOUNDS);
  }

  if (ms.code[destNum] !== 0x5b) {
    throw new Error(ERRORS.JUMP_TO_INVALID_DESTINATION);
  }

  ms.pc = destNum;
}

/**
 * PC opcode (0x58): Pushes current program counter value onto stack
 * @param ms - Machine state
 */
export function PC(ms: MachineState) {
  ms.stack.push(BigInt(ms.pc));
}

/**
 * GAS opcode (0x5a): Pushes remaining gas onto stack
 * @param ms - Machine state
 */
export function GAS(ms: MachineState) {
  ms.stack.push(ms.gasAvailable);
}

/**
 * JUMPDEST opcode (0x5b): Valid jump destination marker, does nothing
 * @param _ms - Machine state
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function JUMPDEST(_ms: MachineState) {
  // do nothing
}
