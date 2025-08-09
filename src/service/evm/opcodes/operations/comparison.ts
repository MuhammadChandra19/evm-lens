import { bigMath } from '@/lib/utils/bigMath';
import { MachineState } from '../../machine-state/types';

// 0x10
export const LT = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a < b ? 1n : 0n;
  state.stack.push(res);
};

/**
 * Greater than
 *  - 0x11
 * @param state - The machine state
 * @returns void
 */
export const GT = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a > b ? 1n : 0n;
  state.stack.push(res);
};

/**
 * Signed less than
 *  - 0x12
 * @param state - The machine state
 * @returns void
 */
export const SLT = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = bigMath.toSigned256(a) < bigMath.toSigned256(b) ? 1n : 0n;
  state.stack.push(res);
};

/**
 * Signed greater than
 *  - 0x13
 * @param state - The machine state
 * @returns void
 */
export const SGT = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = bigMath.toSigned256(a) > bigMath.toSigned256(b) ? 1n : 0n;
  state.stack.push(res);
};

/**
 * Equals
 *  - 0x14
 * @param state - The machine state
 * @returns void
 */
export const EQ = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a === b ? 1n : 0n;
  state.stack.push(res);
};

/**
 * Is zero
 *  - 0x15
 * @param state - The machine state
 * @returns void
 */
export const ISZERO = (state: MachineState) => {
  const [a] = state.stack.popN(1);
  const res = a === 0n ? 1n : 0n;
  state.stack.push(res);
};
