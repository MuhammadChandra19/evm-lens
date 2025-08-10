import { parsers } from "../utils"

import type { MachineState } from "../../machine-state/types"

// todo: 0x40

/**
 * COINBASE opcode (0x41): Push block coinbase address onto stack
 * @param ms - Machine state
 */
export function COINBASE(ms: MachineState) {
  const res = ms.block.coinbase
  ms.stack.push(parsers.HexStringIntoBigInt(res))
}

/**
 * TIMESTAMP opcode (0x42): Push block timestamp onto stack
 * @param ms - Machine state
 */
export function TIMESTAMP(ms: MachineState) {
  const res = ms.block.timestamp
  ms.stack.push(res)
}

/**
 * NUMBER opcode (0x43): Push block number onto stack
 * @param ms - Machine state
 */
export function NUMBER(ms: MachineState) {
  const res = ms.block.number
  ms.stack.push(BigInt(res))
}

/**
 * DIFFICULTY opcode (0x44): Push block difficulty onto stack
 * @param ms - Machine state
 */
export function DIFFICULTY(ms: MachineState) {
  const res = ms.block.difficulty
  ms.stack.push(BigInt(res))
}

/**
 * GASLIMIT opcode (0x45): Push block gas limit onto stack
 * @param ms - Machine state
 */
export function GASLIMIT(ms: MachineState) {
  const res = ms.block.gaslimit
  ms.stack.push(parsers.HexStringIntoBigInt(res))
}

/**
 * CHAINID opcode (0x46): Push chain ID onto stack
 * @param ms - Machine state
 */
export function CHAINID(ms: MachineState) {
  const res = ms.block.chainid
  ms.stack.push(BigInt(res))
}
