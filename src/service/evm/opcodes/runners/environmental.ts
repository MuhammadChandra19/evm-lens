import { parsers } from "../utils"

import type { MachineState } from "../../machine-state/types"

/**
 * ADDRESS opcode (0x30): Push current contract address onto stack
 * @param ms - Machine state
 */
export function ADDRESS(ms: MachineState) {
  const res = ms.txData.to
  ms.stack.push(parsers.HexStringIntoBigInt(res))
}

/**
 * BALANCE opcode (0x31): Pop address, push its balance onto stack
 * @param ms - Machine state
 */
export function BALANCE(ms: MachineState) {
  const address = ms.stack.pop()
  const addressHex = parsers.BigintIntoHexString(address)
  const res = ms.globalState.getBalance(addressHex)
  ms.stack.push(res)
}

/**
 * ORIGIN opcode (0x32): Push transaction origin address onto stack
 * @param ms - Machine state
 */
export function ORIGIN(ms: MachineState) {
  const res = ms.txData.origin
  ms.stack.push(parsers.HexStringIntoBigInt(res))
}

/**
 * CALLER opcode (0x33): Push caller address onto stack
 * @param ms - Machine state
 */
export function CALLER(ms: MachineState) {
  const res = ms.txData.from
  ms.stack.push(parsers.HexStringIntoBigInt(res))
}

/**
 * CALLVALUE opcode (0x34): Push call value (wei sent) onto stack
 * @param ms - Machine state
 */
export function CALLVALUE(ms: MachineState) {
  const res = ms.txData.value
  ms.stack.push(res)
}

/**
 * CALLDATALOAD opcode (0x35): Load 32 bytes from calldata at offset onto stack
 * @param ms - Machine state
 */
export function CALLDATALOAD(ms: MachineState) {
  const offset = Number(ms.stack.pop())
  const calldataWord = ms.txData.data.subarray(offset, offset + 32)

  const calldataWordPadded = Buffer.alloc(32)
  calldataWord.copy(calldataWordPadded, 0, 0)

  const res = parsers.BytesIntoBigInt(calldataWordPadded)
  ms.stack.push(res)
}

/**
 * CALLDATASIZE opcode (0x36): Push calldata size in bytes onto stack
 * @param ms - Machine state
 */
export function CALLDATASIZE(ms: MachineState) {
  const res = ms.txData.data.length
  ms.stack.push(BigInt(res))
}

/**
 * CALLDATACOPY opcode (0x37): Copy calldata to memory
 * Pops memory offset, data offset, and size from stack
 * @param ms - Machine state
 */
export function CALLDATACOPY(ms: MachineState) {
  const memOffset = Number(ms.stack.pop())
  const dataOffset = Number(ms.stack.pop())
  const size = Number(ms.stack.pop())

  const data = ms.txData.data.subarray(dataOffset, dataOffset + size)
  ms.memory.write(memOffset, data, size)
}

/**
 * CODESIZE opcode (0x38): Push current contract code size onto stack
 * @param ms - Machine state
 */
export function CODESIZE(ms: MachineState) {
  const res = ms.code.length
  ms.stack.push(BigInt(res))
}

/**
 * CODECOPY opcode (0x39): Copy contract code to memory
 * Pops memory offset, code offset, and size from stack
 * @param ms - Machine state
 */
export function CODECOPY(ms: MachineState) {
  const memOffset = Number(ms.stack.pop())
  const codeOffset = Number(ms.stack.pop())
  const size = Number(ms.stack.pop())

  const codeBytesPortion = ms.code.subarray(codeOffset, codeOffset + size)
  const codeBuffer = Buffer.from(codeBytesPortion)

  const code = Buffer.alloc(size)
  codeBuffer.copy(code, 0, 0)

  ms.memory.write(memOffset, code, size)
}

/**
 * GASPRICE opcode (0x3a): Push transaction gas price onto stack
 * @param ms - Machine state
 */
export function GASPRICE(ms: MachineState) {
  const res = ms.txData.gasprice
  ms.stack.push(res)
}

/**
 * EXTCODESIZE opcode (0x3b): Pop address, push its code size onto stack
 * @param ms - Machine state
 */
export function EXTCODESIZE(ms: MachineState) {
  const address = ms.stack.pop()
  const addressHex = parsers.BigintIntoHexString(address)
  const extAccount = ms.globalState?.getAccount(addressHex)
  const res = extAccount?.code?.length ?? 0
  ms.stack.push(BigInt(res))
}

/**
 * EXTCODECOPY opcode (0x3c): Copy external contract code to memory
 * Pops address, memory offset, code offset, and size from stack
 * @param ms - Machine state
 */
export function EXTCODECOPY(ms: MachineState) {
  const address = ms.stack.pop()
  const addressHex = parsers.BigintIntoHexString(address)
  const extAccount = ms.globalState?.getAccount(addressHex)

  const memOffset = Number(ms.stack.pop())
  const codeOffset = Number(ms.stack.pop())
  const size = Number(ms.stack.pop())

  const codeBytesPortion = extAccount?.code?.subarray(codeOffset, codeOffset + size)
  const codeBuffer = Buffer.from(codeBytesPortion ?? Buffer.alloc(0))

  const code = Buffer.alloc(size)
  codeBuffer.copy(code, 0, 0)

  ms.memory.write(memOffset, code, size)
}

/**
 * RETURNDATASIZE opcode (0x3d): Push return data size from last call onto stack
 * @param ms - Machine state
 */
export function RETURNDATASIZE(ms: MachineState) {
  const res = BigInt(ms.returnData.length)
  ms.stack.push(res)
}

/**
 * RETURNDATACOPY opcode (0x3e): Copy return data from last call to memory
 * Pops memory offset, return data offset, and size from stack
 * @param ms - Machine state
 */
export function RETURNDATACOPY(ms: MachineState) {
  const memOffset = Number(ms.stack.pop())
  const returnDataOffset = Number(ms.stack.pop())
  const size = Number(ms.stack.pop())

  const returnData = ms.returnData.subarray(returnDataOffset, returnDataOffset + size)
  ms.memory.write(memOffset, returnData, size)
}

// todo: 0x3f

/**
 * SELFBALANCE opcode (0x47): Push current contract's balance onto stack
 * @param ms - Machine state
 */
export function SELFBALANCE(ms: MachineState) {
  const res = ms.globalState.getBalance(ms.txData.to)
  ms.stack.push(res)
}

// todo: 0x48
