// src/service/evm/script/test_return.ts
import EVM from "..";
import { parsers } from "../opcodes/utils";

// Simple bytecode that just returns "Hello"
const simpleReturn = "60056000526005600060006000f3";
// PUSH1 5 PUSH1 0 MSTORE PUSH1 5 PUSH1 0 PUSH1 0 PUSH1 0 RETURN

const evm = new EVM({
  debug: true,
  saveLogs: false,
});

const result = await evm.start({
  _code: parsers.hexStringToUint8Array(simpleReturn),
});

console.log("Simple RETURN test:", result);
