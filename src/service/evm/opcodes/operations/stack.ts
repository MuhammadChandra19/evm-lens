import ERRORS from "../../errors";
import { parsers } from "../utils";

import type { MachineState } from "../../machine-state/types";

/**
 * POP opcode (0x50): Removes the top item from the stack
 * @param ms - Machine state
 */
export function POP(ms: MachineState) {
  ms.stack.pop();
}

/**
 * PUSH opcodes (0x60-0x7f): Push 1-32 bytes from code onto stack
 * The number of bytes is determined by (opcode - 0x5f)
 * @param ms - Machine state
 * @throws Error if not enough bytes available in code
 */
export function PUSH(ms: MachineState) {
  const size = ms.code[ms.pc] - 0x5f;
  if (ms.pc + size >= ms.code.length) throw new Error(ERRORS.PC_OUT_OF_BOUNDS);

  const value = ms.code.slice(ms.pc + 1, ms.pc + size + 1);
  const valueAsBigInt = parsers.BytesIntoBigInt(value);

  ms.pc += size;
  ms.stack.push(valueAsBigInt);
}

/**
 * DUP opcodes (0x80-0x8f): Duplicate the Nth stack item to the top
 * The position is determined by (opcode - 0x7f)
 * @param ms - Machine state
 */
export function DUP(ms: MachineState) {
  const pos = ms.code[ms.pc] - 0x7f;
  const value = ms.stack.peek(pos);
  ms.stack.push(value);
}

/**
 * SWAP opcodes (0x90-0x9f): Swap the top stack item with the Nth item
 * The position is determined by (opcode - 0x8f)
 * @param ms - Machine state
 */
export function SWAP(ms: MachineState) {
  const pos = ms.code[ms.pc] - 0x8f;
  ms.stack.swap(pos);
}
