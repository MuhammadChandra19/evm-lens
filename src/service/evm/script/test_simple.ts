// Test these simpler contracts first:

import EVM from "..";
import { parsers } from "../opcodes/utils";
import { buildTxData } from "../utils";

// 1. Simple value storage
const storeValue = "6001600055"; // PUSH1 1 PUSH1 0 SSTORE

// 2. Simple deposit
const deposit = "34600055"; // CALLVALUE PUSH1 0 SSTORE

// 3. Return a value
const returnValue = "60016000526001600060006000f3"; // PUSH1 1 PUSH1 0 MSTORE PUSH1 1 PUSH1 0 PUSH1 0 PUSH1 0 RETURN

const evm = new EVM({ debug: true });

// Test each one
const result1 = await evm.start({
  _code: parsers.hexStringToUint8Array(storeValue),
});

const result2 = await evm.start({
  _code: parsers.hexStringToUint8Array(deposit),
  _txData: buildTxData({
    tx: { value: BigInt(1000) },
    name: "",
    code: { asm: "", bin: "" },
    expect: {},
  }),
});

console.log(result1);
console.log(result2);
console.log(returnValue);
