import { MachineState } from '../../machine-state/types';

/**
 * Bitwise AND
 *  - 0x16
 * @param state - The machine state
 * @returns void
 */
export const AND = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a & b;
  state.stack.push(res);
};

/**
 * Bitwise OR
 *  - 0x17
 * @param state - The machine state
 * @returns void
 */
export const OR = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a | b;
  state.stack.push(res);
};

/**
 * Bitwise XOR
 *  - 0x18
 * @param state - The machine state
 * @returns void
 */
export const XOR = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a ^ b;
  state.stack.push(res);
};

/**
 * Bitwise NOT
 *  - 0x19
 * @param state - The machine state
 * @returns void
 */
export const NOT = (state: MachineState) => {
  const [a] = state.stack.popN(1);
  const res = ~a;
  state.stack.push(res);
};

/**
 * Byte
 *  - 0x1a
 * @param state - The machine state
 * @returns void
 */
export const BYTE = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = (a >> (8n * b)) & 0xffn;
  state.stack.push(res);
};

/**
 * Shift left
 *  - 0x1b
 * @param state - The machine state
 * @returns void
 */
export const SHL = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a << b;
  state.stack.push(res);
};

/**
 * Shift right
 *  - 0x1c
 * @param state - The machine state
 * @returns void
 */
export const SHR = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a >> b;
  state.stack.push(res);
};

/**
 * Shift right arithmetic
 *  - 0x1d
 * @param state - The machine state
 * @returns void
 */
export const SAR = (state: MachineState) => {
  const [a, b] = state.stack.popN(2);
  const res = a >> b;
  state.stack.push(res);
};
