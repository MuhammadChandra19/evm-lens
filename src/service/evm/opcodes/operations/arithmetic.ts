import { bigMath } from '../utils';

import type { MachineState } from '../../machine-state/types';

/**
 * ADD opcode (0x01): Pops two values, pushes their sum (mod 2^256)
 * @param ms - Machine state
 */
export function ADD(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = bigMath.mod256(a + b);
  ms.stack.push(res);
}

/**
 * MUL opcode (0x02): Pops two values, pushes their product (mod 2^256)
 * @param ms - Machine state
 */
export function MUL(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = bigMath.mod256(a * b);
  ms.stack.push(res);
}

/**
 * SUB opcode (0x03): Pops two values, pushes their difference (mod 2^256)
 * @param ms - Machine state
 */
export function SUB(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = bigMath.mod256(a - b);
  ms.stack.push(res);
}

/**
 * DIV opcode (0x04): Pops two values, pushes integer division result
 * Division by zero returns 0
 * @param ms - Machine state
 */
export function DIV(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = b === 0n ? 0n : bigMath.mod256(a / b);
  ms.stack.push(res);
}

/**
 * SDIV opcode (0x05): Pops two values, pushes signed integer division result
 * Treats values as signed 256-bit integers, division by zero returns 0
 * @param ms - Machine state
 */
export function SDIV(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const div = b === 0n ? 0n : bigMath.toSigned256(a) / bigMath.toSigned256(b);
  const res = bigMath.toUnsigned256(div);
  ms.stack.push(res);
}

/**
 * MOD opcode (0x06): Pops two values, pushes modulo result
 * Modulo by zero returns 0
 * @param ms - Machine state
 */
export function MOD(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = b === 0n ? 0n : bigMath.mod256(a % b);
  ms.stack.push(res);
}

/**
 * SMOD opcode (0x07): Pops two values, pushes signed modulo result
 * Treats values as signed 256-bit integers, modulo by zero returns 0
 * @param ms - Machine state
 */
export function SMOD(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const mod = b === 0n ? 0n : bigMath.toSigned256(a) % bigMath.toSigned256(b);
  const res = bigMath.toUnsigned256(mod);
  ms.stack.push(res);
}

/**
 * ADDMOD opcode (0x08): Addition modulo N
 * Pops three values (a, b, N), pushes (a + b) % N
 * If N is 0, returns 0
 * @param ms - Machine state
 */
export function ADDMOD(ms: MachineState) {
  const [a, b, n] = ms.stack.popN(3);

  if (n === 0n) {
    ms.stack.push(0n);
    return;
  }

  const res = (a + b) % n;
  ms.stack.push(res);
}

/**
 * MULMOD opcode (0x09): Multiplication modulo N
 * Pops three values (a, b, N), pushes (a * b) % N
 * If N is 0, returns 0
 * @param ms - Machine state
 */
export function MULMOD(ms: MachineState) {
  const [a, b, n] = ms.stack.popN(3);

  if (n === 0n) {
    ms.stack.push(0n);
    return;
  }

  const res = (a * b) % n;
  ms.stack.push(res);
}

/**
 * EXP opcode (0x0a): Exponentiation
 * Pops two values (a, b), pushes a^b (mod 2^256)
 * @param ms - Machine state
 */
export function EXP(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);

  // Special cases
  if (b === 0n) {
    ms.stack.push(1n);
    return;
  }

  if (a === 0n) {
    ms.stack.push(0n);
    return;
  }

  if (a === 1n) {
    ms.stack.push(1n);
    return;
  }

  // For large exponents, we need to be careful about overflow
  // Use modular exponentiation to keep result in bounds
  let result = 1n;
  let base = a;
  let exponent = b;
  const modulus = 2n ** 256n;

  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent = exponent / 2n;
  }

  ms.stack.push(result);
}

/**
 * SIGNEXTEND opcode (0x0b): Sign extension
 * Pops two values (i, x), extends the sign of x from bit position (i*8+7)
 * @param ms - Machine state
 */
export function SIGNEXTEND(ms: MachineState) {
  const [i, x] = ms.stack.popN(2);

  // If i >= 31, no sign extension needed (already full 256-bit)
  if (i >= 31n) {
    ms.stack.push(x);
    return;
  }

  // Calculate the bit position for sign extension
  const bitPos = i * 8n + 7n;
  const signBitMask = 1n << bitPos;

  // Check if the sign bit is set
  const isNegative = (x & signBitMask) !== 0n;

  if (isNegative) {
    // If negative, set all higher bits to 1
    const mask = (1n << (bitPos + 1n)) - 1n; // Mask for bits 0 to bitPos
    const higherBits = ((1n << 256n) - 1n) ^ mask; // All 1s above bitPos
    const result = x | higherBits;
    ms.stack.push(bigMath.mod256(result));
  } else {
    // If positive, clear all higher bits (set to 0)
    const mask = (1n << (bitPos + 1n)) - 1n; // Mask for bits 0 to bitPos
    const result = x & mask;
    ms.stack.push(result);
  }
}
