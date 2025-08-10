import { parsers } from "../utils";

import type { MachineState } from "../../machine-state/types";

/**
 * MLOAD opcode (0x51): Load 32 bytes from memory at offset onto stack
 * @param ms - Machine state
 */
export function MLOAD(ms: MachineState) {
  const offset = Number(ms.stack.pop());
  const val = parsers.BytesIntoBigInt(ms.memory.read(offset, 32));
  ms.stack.push(val);
}

/**
 * MSTORE opcode (0x52): Store 32-byte word from stack to memory at offset
 * @param ms - Machine state
 */
export function MSTORE(ms: MachineState) {
  const [offset, val] = ms.stack.popN(2);
  const word = parsers.BigIntIntoBytes(val, 32);
  ms.memory.write(Number(offset), word, 32);
}

/**
 * MSTORE8 opcode (0x53): Store single byte from stack to memory at offset
 * @param ms - Machine state
 */
export function MSTORE8(ms: MachineState) {
  const [offset, val] = ms.stack.popN(2);
  const byte = parsers.BigIntIntoBytes(val, 1);
  ms.memory.write(Number(offset), byte, 1);
}

/**
 * MSIZE opcode (0x59): Push current memory size in bytes onto stack
 * @param ms - Machine state
 */
export function MSIZE(ms: MachineState) {
  ms.stack.push(BigInt(ms.memory.size));
}
