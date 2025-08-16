import { keccak256 } from "ethereum-cryptography/keccak";

import ERRORS from "../../errors";
import { freshExecutionContext } from "../../machine-state/utils";
import { parsers, CALL_RESULT } from "../utils";
import { ZERO_ADDRESS } from "../../constants";

import type EVM from "../..";
import type { MachineState } from "../../machine-state/types";

/**
 * CREATE opcode (0xf0): Create a new contract
 * Pops value, offset, and length from stack
 * Executes init code and deploys contract if successful
 * @param ms - Machine state
 * @param evm - EVM instance for recursive execution
 */
export async function CREATE(ms: MachineState, evm: EVM) {
  const [value, offset, length] = ms.stack.popN(3);

  // todo: generate real address: keccak256(rlp([sender_address,sender_nonce]))[12:]
  const sender = parsers.hexStringToUint8Array(ms.txData.to);
  const keccak = parsers.BufferToHexString(Buffer.from(keccak256(sender)));
  const addressCreated = keccak.substring(0, 42);

  ms.globalState.setAccount(addressCreated, { balance: value });

  const initCode = ms.memory.read(Number(offset), Number(length));

  const createMachineState: MachineState = {
    ...ms,
    ...freshExecutionContext(),
    txData: {
      ...ms.txData,
      value: 0n,
      from: ZERO_ADDRESS,
      to: addressCreated,
    },
    code: initCode,
  };

  const createResult = await evm.run(createMachineState, true);

  if (createResult.success) {
    ms.globalState.setAccount(addressCreated, {
      ...ms.globalState.getAccount(addressCreated),
      code: parsers.hexStringToUint8Array(createResult.return),
    });

    ms.stack.push(parsers.HexStringIntoBigInt(addressCreated));
  } else ms.stack.push(CALL_RESULT.REVERT);
}

/**
 * CALL opcode (0xf1): Call another contract
 * Pops gas, address, value, args offset/size, ret offset/size from stack
 * Executes target contract and handles return data
 * @param ms - Machine state
 * @param evm - EVM instance for recursive execution
 */
export async function CALL(ms: MachineState, evm: EVM) {
  const [gas, address, value, argsOffset, argsSize, retOffset, retSize] =
    ms.stack.popN(7);

  const data = ms.memory.read(Number(argsOffset), Number(argsSize));
  const to = parsers.BigintIntoHexString(address);
  const codeToCall = ms.globalState.getAccount(to).code;

  if (!codeToCall) return ms.stack.push(CALL_RESULT.SUCCESS);

  const callMachineState: MachineState = {
    ...ms,
    ...freshExecutionContext(),
    gasAvailable: gas,
    txData: { ...ms.txData, from: ms.txData.to, to, value, data },
    code: codeToCall,
  };

  const callResult = await evm.run(callMachineState, true);

  if (callResult.return) {
    const callReturnData = Buffer.from(callResult.return, "hex");
    const callReturnOffset = Number(retOffset);
    const callReturnSize = Number(retSize);

    ms.returnData = callReturnData;

    if (callReturnSize > 0)
      ms.memory.write(callReturnOffset, callReturnData, callReturnSize);
  }

  if (callResult.success) ms.stack.push(CALL_RESULT.SUCCESS);
  else ms.stack.push(CALL_RESULT.REVERT);
}

/**
 * RETURN opcode (0xf3): Return data and halt execution successfully
 * Pops offset and size from stack, copies memory data to return buffer
 * @param ms - Machine state
 * @throws STOP error to terminate execution
 */
export function RETURN(ms: MachineState) {
  const [offset, size] = ms.stack.popN(2);
  const ret = ms.memory.read(Number(offset), Number(size));
  ms.returnData = ret;
  ms.pc = ms.code.length;

  throw new Error(ERRORS.STOP);
}

/**
 * DELEGATECALL opcode (0xf4): Call another contract with current context
 * Similar to CALL but preserves caller and value from current context
 * @param ms - Machine state
 * @param evm - EVM instance for recursive execution
 */
export async function DELEGATECALL(ms: MachineState, evm: EVM) {
  const [gas, address, argsOffset, argsSize, retOffset, retSize] =
    ms.stack.popN(6);

  const data = ms.memory.read(Number(argsOffset), Number(argsSize));
  const to = parsers.BigintIntoHexString(address);
  const codeToCall = ms.globalState.getAccount(to).code;

  if (!codeToCall) return ms.stack.push(CALL_RESULT.SUCCESS);

  const callMachineState: MachineState = {
    ...ms,
    ...freshExecutionContext(),
    gasAvailable: gas,

    // The caller and value are the same as the current context
    txData: { ...ms.txData, data },
    code: codeToCall,
  };

  const callResult = await evm.run(callMachineState, true);

  console.log(callResult);

  if (callResult.return) {
    const callReturnData = Buffer.from(callResult.return, "hex");
    const callReturnOffset = Number(retOffset);
    const callReturnSize = Number(retSize);

    ms.returnData = callReturnData;

    if (callReturnSize > 0)
      ms.memory.write(callReturnOffset, callReturnData, callReturnSize);
  }

  if (callResult.success) ms.stack.push(CALL_RESULT.SUCCESS);
  else ms.stack.push(CALL_RESULT.REVERT);
}

/**
 * STATICCALL opcode (0xfa): Call another contract in static (read-only) mode
 * Similar to CALL but prevents state changes in the called contract
 * @param ms - Machine state
 * @param evm - EVM instance for recursive execution
 */
export async function STATICCALL(ms: MachineState, evm: EVM) {
  const [gas, address, argsOffset, argsSize, retOffset, retSize] =
    ms.stack.popN(6);

  const data = ms.memory.read(Number(argsOffset), Number(argsSize));
  const to = parsers.BigintIntoHexString(address);
  const codeToCall = ms.globalState.getAccount(to).code;

  if (!codeToCall) return ms.stack.push(CALL_RESULT.SUCCESS);

  const callMachineState: MachineState = {
    ...ms,
    ...freshExecutionContext(),
    gasAvailable: gas,
    txData: { ...ms.txData, data },
    code: codeToCall,
    static: true,
  };

  const callResult = await evm.run(callMachineState, true);

  if (callResult.return) {
    const callReturnData = Buffer.from(callResult.return, "hex");
    const callReturnOffset = Number(retOffset);
    const callReturnSize = Number(retSize);

    ms.returnData = callReturnData;

    if (callReturnSize > 0)
      ms.memory.write(callReturnOffset, callReturnData, callReturnSize);
  }

  if (callResult.success) ms.stack.push(CALL_RESULT.SUCCESS);
  else ms.stack.push(CALL_RESULT.REVERT);
}

/**
 * REVERT opcode (0xfd): Revert execution and return data
 * Pops offset and size from stack, copies memory data to return buffer
 * @param ms - Machine state
 * @throws REVERT error to terminate execution with revert
 */
export function REVERT(ms: MachineState) {
  const [offset, size] = ms.stack.popN(2);
  const ret = ms.memory.read(Number(offset), Number(size));
  ms.returnData = ret;
  ms.pc = ms.code.length;

  throw new Error(ERRORS.REVERT);
}

/**
 * SELFDESTRUCT opcode (0xff): Destroy current contract and send balance
 * Pops recipient address from stack, transfers balance and marks contract for deletion
 * @param ms - Machine state
 * @throws STOP error to terminate execution
 */
export function SELFDESTRUCT(ms: MachineState) {
  const [address] = ms.stack.popN(1);
  const addressToPay = parsers.BigintIntoHexString(address);
  const accountToPay = ms.globalState.getAccount(addressToPay);
  const accountToDestroy = ms.globalState.getAccount(ms.txData.to);

  if (accountToDestroy?.balance) {
    ms.globalState.setAccount(addressToPay, {
      ...accountToPay,
      balance: accountToDestroy.balance + (accountToPay?.balance || 0n),
    });
  }

  ms.globalState.setAccount(ms.txData.to, {});
  ms.pc = ms.code.length;

  throw new Error(ERRORS.STOP);
}

/**
 * INVALID opcode (0xfe): Invalid instruction that should always fail
 * This opcode consumes all remaining gas and reverts the transaction
 * @param _ms - Machine state (unused)
 * @throws Error always - this opcode should never succeed
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function INVALID(_ms: MachineState) {
  throw new Error(ERRORS.REVERT);
}
