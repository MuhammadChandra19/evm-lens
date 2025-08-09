import { BIGINT_0 } from '@/lib/constants';
import { MachineState } from '../../machine-state/types';
import { parsers } from '../utils';

/**
 * Address
 *  - 0x30
 * @param state - The machine state
 * @returns void
 */
export const ADDRESS = (state: MachineState) => {
  const res = state.txData.to;
  state.stack.push(parsers.HexStringIntoBigInt(res));
};

/**
 * Balance
 *  - 0x31
 * @param state - The machine state
 * @returns void
 */
export const BALANCE = (state: MachineState) => {
  const address = state.stack.pop();
  const addressHex = parsers.BigintIntoHexString(address);
  const balance = state.globalState.getBalance(addressHex);
  state.stack.push(balance);
};

/**
 * Origin
 *  - 0x32
 * @param state - The machine state
 * @returns void
 */
export const ORIGIN = (state: MachineState) => {
  const res = state.txData.origin;
  state.stack.push(parsers.HexStringIntoBigInt(res));
};

/**
 * Caller
 *  - 0x33
 * @param state - The machine state
 * @returns void
 */
export const CALLER = (state: MachineState) => {
  const res = state.txData.from;
  state.stack.push(parsers.HexStringIntoBigInt(res));
};

/**
 * Callvalue
 *  - 0x34
 * @param state - The machine state
 * @returns void
 */
export const CALLVALUE = (state: MachineState) => {
  const res = state.txData.value;
  state.stack.push(res);
};

/**
 * CallDataLoad
 *  - 0x35
 * @param state - The machine state
 * @returns void
 */
export const CALLDATALOAD = (state: MachineState) => {
  const offset = Number(state.stack.pop());
  const calldata = state.txData.data.subarray(offset, offset + 32);

  const calldataAlloc = Buffer.alloc(32);
  calldata.copy(calldataAlloc, 0, 0);

  const res = parsers.BytesIntoBigInt(calldataAlloc);
  state.stack.push(res);
};

/**
 * CallDataSize
 *  - 0x36
 * @param state - The machine state
 * @returns void
 */
export const CALLDATASIZE = (state: MachineState) => {
  const res = state.txData.data.length;
  state.stack.push(BigInt(res));
};

/**
 * CallDataCopy
 *  - 0x37
 * @param state - The machine state
 * @returns void
 */
export const CALLDATACOPY = (state: MachineState) => {
  const memOffset = Number(state.stack.pop());
  const calldataOffset = Number(state.stack.pop());
  const size = Number(state.stack.pop());
  const data = state.txData.data.subarray(calldataOffset, calldataOffset + size);
  state.memory.store(memOffset, data, size);
};

/**
 * CodeSize
 *  - 0x38
 * @param state - The machine state
 * @returns void
 */
export const CODESIZE = (state: MachineState) => {
  const res = state.code.length;
  state.stack.push(BigInt(res));
};

/**
 * CodeCopy
 *  - 0x39
 * @param state - The machine state
 * @returns void
 */
export const CODECOPY = (state: MachineState) => {
  const memOffset = Number(state.stack.pop());
  const codeOffset = Number(state.stack.pop());
  const size = Number(state.stack.pop());

  const codeBytesSlice = state.code.subarray(codeOffset, codeOffset + size);
  const codeBuffer = Buffer.from(codeBytesSlice);

  const code = Buffer.alloc(size);
  codeBuffer.copy(code, 0, 0);

  state.memory.store(memOffset, code, size);
};

/**
 * GasPrice
 *  - 0x3a
 * @param state - The machine state
 * @returns void
 */
export const GASPRICE = (state: MachineState) => {
  const res = state.txData.gasprice;
  state.stack.push(res);
};

/**
 * ExtCodeSize
 *  - 0x3b
 * @param state - The machine state
 * @returns void
 */
export const EXTCODESIZE = (state: MachineState) => {
  const address = state.stack.pop();
  const addressHex = parsers.BigintIntoHexString(address);

  const account = state.globalState.getAccount(addressHex);
  const res = account?.code?.length ?? BIGINT_0;
  state.stack.push(BigInt(res));
};

/**
 * ExtCodeCopy
 *  - 0x3c
 * @param state - The machine state
 * @returns void
 */
export const EXTCODECOPY = (state: MachineState) => {
  const address = state.stack.pop();
  const addressHex = parsers.BigintIntoHexString(address);
  const extAccount = state.globalState.getAccount(addressHex);

  const memOffset = Number(state.stack.pop());
  const codeOffset = Number(state.stack.pop());
  const size = Number(state.stack.pop());

  const codeBytesSlice = extAccount?.code?.subarray(codeOffset, codeOffset + size);
  const codeBuffer = Buffer.from(codeBytesSlice ?? Buffer.alloc(0));

  const code = Buffer.alloc(size);
  codeBuffer.copy(code, 0, 0);

  state.memory.store(memOffset, code, size);
};

/**
 * ReturnDataSize
 *  - 0x3d
 * @param state - The machine state
 * @returns void
 */
export const RETURNDATASIZE = (state: MachineState) => {
  const res = state.returnData.length;
  state.stack.push(BigInt(res));
};

/**
 * ReturnDataCopy
 *  - 0x3e
 * @param state - The machine state
 * @returns void
 */
export const RETURNDATACOPY = (state: MachineState) => {
  const memOffset = Number(state.stack.pop());
  const returnDataOffset = Number(state.stack.pop());
  const size = Number(state.stack.pop());

  const data = state.returnData.subarray(returnDataOffset, returnDataOffset + size);
  state.memory.store(memOffset, data, size);
};

/**
 * ExtCodeHash
 *  - 0x3f
 * @param state - The machine state
 * @returns void
 */
export const EXTCODEHASH = (state: MachineState) => {
  const address = state.stack.pop();
  const addressHex = parsers.BigintIntoHexString(address);
  const extAccount = state.globalState.getAccount(addressHex);
  const res = extAccount?.code?.length ?? BIGINT_0;
  state.stack.push(BigInt(res));
};

// /**
//  * SelfBalance
//  *  - 0x3f
//  * @param state - The machine state
//  * @returns void
//  */
// export const SELFBALANCE = (state: MachineState) => {
//   const res = state.globalState.getBalance(state.txData.to);
//   state.stack.push(res);
// };
