import { bigMath } from "../utils"

import type { MachineState } from "../../machine-state/types"

/**
 * ADD opcode (0x01): Pops two values, pushes their sum (mod 2^256)
 * @param ms - Machine state
 */
export function ADD(ms: MachineState) {
  const [a, b] = ms.stack.popN(2)
  const res = bigMath.mod256(a + b)
  ms.stack.push(res)
}

/**
 * MUL opcode (0x02): Pops two values, pushes their product (mod 2^256)
 * @param ms - Machine state
 */
export function MUL(ms: MachineState) {
  const [a, b] = ms.stack.popN(2)
  const res = bigMath.mod256(a * b)
  ms.stack.push(res)
}

/**
 * SUB opcode (0x03): Pops two values, pushes their difference (mod 2^256)
 * @param ms - Machine state
 */
export function SUB(ms: MachineState) {
  const [a, b] = ms.stack.popN(2)
  const res = bigMath.mod256(a - b)
  ms.stack.push(res)
}

/**
 * DIV opcode (0x04): Pops two values, pushes integer division result
 * Division by zero returns 0
 * @param ms - Machine state
 */
export function DIV(ms: MachineState) {
  const [a, b] = ms.stack.popN(2)
  const res = b === 0n ? 0n : bigMath.mod256(a / b)
  ms.stack.push(res)
}

/**
 * SDIV opcode (0x05): Pops two values, pushes signed integer division result
 * Treats values as signed 256-bit integers, division by zero returns 0
 * @param ms - Machine state
 */
export function SDIV(ms: MachineState) {
  const [a, b] = ms.stack.popN(2)
  const div = b === 0n ? 0n : bigMath.toSigned256(a) / bigMath.toSigned256(b)
  const res = bigMath.toUnsigned256(div)
  ms.stack.push(res)
}

/**
 * MOD opcode (0x06): Pops two values, pushes modulo result
 * Modulo by zero returns 0
 * @param ms - Machine state
 */
export function MOD(ms: MachineState) {
  const [a, b] = ms.stack.popN(2)
  const res = b === 0n ? 0n : bigMath.mod256(a % b)
  ms.stack.push(res)
}

/**
 * SMOD opcode (0x07): Pops two values, pushes signed modulo result
 * Treats values as signed 256-bit integers, modulo by zero returns 0
 * @param ms - Machine state
 */
export function SMOD(ms: MachineState) {
  const [a, b] = ms.stack.popN(2)
  const mod = b === 0n ? 0n : bigMath.toSigned256(a) % bigMath.toSigned256(b)
  const res = bigMath.toUnsigned256(mod)
  ms.stack.push(res)
}

// TODO: addmod, mulmod, exp, signextend
