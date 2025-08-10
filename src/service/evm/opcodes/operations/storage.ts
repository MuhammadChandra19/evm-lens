import { parsers } from "../utils";

import type { MachineState } from "../../machine-state/types";

/**
 * SLOAD opcode (0x54): Load value from storage at key onto stack
 * Uses current contract address (txData.to) as storage context
 * @param ms - Machine state
 */
export function SLOAD(ms: MachineState) {
  const key = ms.stack.pop();
  const keyHex = parsers.BigintIntoHexString(key);
  const val = ms.storage.getAsBigInt(ms.txData.to, keyHex);
  ms.stack.push(val);
}

/**
 * SSTORE opcode (0x55): Store value from stack to storage at key
 * Uses current contract address (txData.to) as storage context
 * @param ms - Machine state
 */
export function SSTORE(ms: MachineState) {
  const [key, val] = ms.stack.popN(2);
  const keyHex = parsers.BigintIntoHexString(key);
  ms.storage.setAsBigInt(ms.txData.to, keyHex, val);
}
