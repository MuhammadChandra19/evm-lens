import { bigMath } from '../utils';

import type { MachineState } from '../../machine-state/types';

/**
 * LT opcode (0x10): Pops two values, pushes 1 if first < second, else 0
 * @param ms - Machine state
 */
export function LT(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = a < b ? 1n : 0n;
  ms.stack.push(res);
}

/**
 * GT opcode (0x11): Pops two values, pushes 1 if first > second, else 0
 * @param ms - Machine state
 */
export function GT(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = a > b ? 1n : 0n;
  ms.stack.push(res);
}

/**
 * SLT opcode (0x12): Pops two values, pushes 1 if first < second (signed), else 0
 * Treats values as signed 256-bit integers
 * @param ms - Machine state
 */
export function SLT(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = bigMath.toSigned256(a) < bigMath.toSigned256(b) ? 1n : 0n;
  ms.stack.push(res);
}

/**
 * SGT opcode (0x13): Pops two values, pushes 1 if first > second (signed), else 0
 * Treats values as signed 256-bit integers
 * @param ms - Machine state
 */
export function SGT(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = bigMath.toSigned256(a) > bigMath.toSigned256(b) ? 1n : 0n;
  ms.stack.push(res);
}

/**
 * EQ opcode (0x14): Pops two values, pushes 1 if equal, else 0
 * @param ms - Machine state
 */
export function EQ(ms: MachineState) {
  const [a, b] = ms.stack.popN(2);
  const res = a === b ? 1n : 0n;
  ms.stack.push(res);
}

/**
 * ISZERO opcode (0x15): Pops one value, pushes 1 if zero, else 0
 * @param ms - Machine state
 */
export function ISZERO(ms: MachineState) {
  const a = ms.stack.pop();
  const res = a === 0n ? 1n : 0n;
  ms.stack.push(res);
}
