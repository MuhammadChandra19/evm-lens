import { bigMath } from '../utils';

import type { MachineState } from '../../machine-state/types';

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

/**
 * SHL opcode (0x1b): Shift left operation
 * Pops shift amount and value, pushes value << shift (mod 2^256)
 * @param ms - Machine state
 */
export function SHL(ms: MachineState) {
  const [shift, value] = ms.stack.popN(2);

  // If shift >= 256, result is 0
  if (shift >= 256n) {
    ms.stack.push(0n);
    return;
  }

  const res = bigMath.mod256(value << shift);
  ms.stack.push(res);
}

/**
 * SHR opcode (0x1c): Logical shift right operation
 * Pops shift amount and value, pushes value >> shift
 * @param ms - Machine state
 */
export function SHR(ms: MachineState) {
  const [shift, value] = ms.stack.popN(2);

  // If shift >= 256, result is 0
  if (shift >= 256n) {
    ms.stack.push(0n);
    return;
  }

  const res = value >> shift;
  ms.stack.push(res);
}

/**
 * SAR opcode (0x1d): Arithmetic (signed) shift right operation
 * Pops shift amount and value, pushes signed value >> shift
 * Preserves the sign bit for negative numbers
 * @param ms - Machine state
 */
export function SAR(ms: MachineState) {
  const [shift, value] = ms.stack.popN(2);

  // Convert to signed 256-bit representation
  const signedValue = bigMath.toSigned256(value);

  // If shift >= 256
  if (shift >= 256n) {
    // If negative, result is -1 (all 1s), if positive, result is 0
    const res = signedValue < 0n ? bigMath.mod256(-1n) : 0n;
    ms.stack.push(res);
    return;
  }

  // Perform arithmetic right shift
  const shiftedValue = signedValue >> shift;

  // Convert back to unsigned 256-bit representation
  const res = bigMath.toUnsigned256(shiftedValue);
  ms.stack.push(res);
}
