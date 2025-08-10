import { bigMath } from "../utils";

import type { MachineState } from "../../machine-state/types";

/**
 * AND opcode (0x16): Pops two values, pushes bitwise AND result
 * @param ms - Machine state
 */
export function AND(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = a & b;
  ms.stack.push(res);
}

/**
 * OR opcode (0x17): Pops two values, pushes bitwise OR result
 * @param ms - Machine state
 */
export function OR(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = a | b;
  ms.stack.push(res);
}

/**
 * XOR opcode (0x18): Pops two values, pushes bitwise XOR result
 * @param ms - Machine state
 */
export function XOR(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = a ^ b;
  ms.stack.push(res);
}

/**
 * NOT opcode (0x19): Pops one value, pushes bitwise NOT result (mod 2^256)
 * @param ms - Machine state
 */
export function NOT(ms: MachineState) {
  const a = ms.stack.pop();
  const res = bigMath.mod256(~a);
  ms.stack.push(res);
}

/**
 * BYTE opcode (0x1a): Pops position and value, pushes the byte at that position
 * Position 0 is the most significant byte. Returns 0 if position >= 32
 * @param ms - Machine state
 */
export function BYTE(ms: MachineState) {
  const [pos, val] = ms.stack.popN(2);
  const res = pos > 31n ? 0n : (val >> (8n * (31n - pos))) & 0xffn;
  ms.stack.push(res);
}

// todo: 1b, 1c, 1d
