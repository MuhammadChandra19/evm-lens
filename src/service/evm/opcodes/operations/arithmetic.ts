import { bigMath } from '@/lib/utils/bigMath';

import type { MachineState } from '../../machine-state/types';
import { BIGINT_0, BIGINT_1, BIGINT_2, BIGINT_2EXP160, BIGINT_2EXP224, BIGINT_2EXP96, BIGINT_31, BIGINT_7, BIGINT_8, BIGINT_96, BIGINT_160, BIGINT_224 } from '@/lib/constants';
import { exponentiation } from '../utils';

// 0x01
export function ADD(state: MachineState) {
  const [a, b] = state.stack.popN(2);
  const res = bigMath.mod256(a + b);
  state.stack.push(res);
}

// 0x02
export function MUL(state: MachineState) {
  const [a, b] = state.stack.popN(2);
  const res = bigMath.mod256(a * b);
  state.stack.push(res);
}

// 0x03
export function SUB(state: MachineState) {
  const [a, b] = state.stack.popN(2);
  const res = bigMath.mod256(a - b);
  state.stack.push(res);
}

// 0x04
export function DIV(state: MachineState) {
  const [a, b] = state.stack.popN(2);
  const res = b === 0n ? 0n : bigMath.mod256(a / b);
  state.stack.push(res);
}

// 0x05
export function SDIV(state: MachineState) {
  const [a, b] = state.stack.popN(2);
  const div = b === 0n ? 0n : bigMath.toSigned256(a) / bigMath.toSigned256(b);
  const res = bigMath.toUnsigned256(div);
  state.stack.push(res);
}

// 0x06
export function MOD(state: MachineState) {
  const [a, b] = state.stack.popN(2);
  const res = b === 0n ? 0n : bigMath.mod256(a % b);
  state.stack.push(res);
}

// 0x07
export function SMOD(state: MachineState) {
  const [a, b] = state.stack.popN(2);
  const mod = b === 0n ? 0n : bigMath.toSigned256(a) % bigMath.toSigned256(b);
  const res = bigMath.toUnsigned256(mod);
  state.stack.push(res);
}

// 0x08
export function ADDMOD(state: MachineState) {
  const [a, b, c] = state.stack.popN(3);
  const res = bigMath.mod256(a + b) % c;
  state.stack.push(res);
}

// 0x09
export function MULMOD(state: MachineState) {
  const [a, b, c] = state.stack.popN(3);
  const res = bigMath.mod256(a * b) % c;
  state.stack.push(res);
}

// 0x0a
export function EXP(state: MachineState) {
  const [base, exponent] = state.stack.popN(2);
  if (base === BIGINT_2) {
    switch (exponent) {
      case BIGINT_96:
        state.stack.push(BIGINT_2EXP96);
        return;
      case BIGINT_160:
        state.stack.push(BIGINT_2EXP160);
        return;
      case BIGINT_224:
        state.stack.push(BIGINT_2EXP224);
        return;
    }
  }

  if (exponent === BIGINT_0) {
    state.stack.push(BIGINT_1);
    return;
  }

  if (exponent === BIGINT_1) {
    state.stack.push(base);
    return;
  }

  const res = exponentiation(base, exponent);
  state.stack.push(res);
}

/**
 * Sign extend
 *  - 0x0b
 *  - Sign extends the value in the second stack item by the number of bits in the first stack item
 *  - If the first stack item is less than 32, the second stack item is sign extended to 256 bits
 *  - If the first stack item is greater than or equal to 32, the second stack item is not modified
 *
 * @see https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/evm/src/opcodes/functions.ts#L215
 * @param state - The machine state
 * @returns void
 */
export function SIGNEXTEND(state: MachineState) {
  // eslint-disable-next-line prefer-const
  let [a, b] = state.stack.popN(2);
  if (a < BIGINT_31) {
    const signBit = a * BIGINT_8 + BIGINT_7;
    const mask = (BIGINT_1 << signBit) - BIGINT_1;
    if ((b >> signBit) & BIGINT_1) {
      b = b | BigInt.asUintN(256, ~mask);
    } else {
      b = b & mask;
    }
  }
  state.stack.push(b);
}
