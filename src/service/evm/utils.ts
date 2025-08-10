/* eslint-disable @typescript-eslint/ban-ts-comment */
import { parsers } from "./opcodes/utils";
import { ZERO_ADDRESS } from "./constants";

import type { Test, TxData, State, Block } from "./types";

/**
 * Builds transaction data from test parameters or uses defaults
 * @param t - Optional test configuration containing transaction parameters
 * @returns TxData object with transaction information
 */
export function buildTxData(t?: Test): TxData {
  return {
    to: t?.tx?.to ?? ZERO_ADDRESS,
    from: t?.tx?.from ?? ZERO_ADDRESS,
    value: BigInt(t?.tx?.value ?? 0),
    origin: t?.tx?.origin ?? t?.tx?.from ?? ZERO_ADDRESS,
    gasprice: BigInt(t?.tx?.gasprice ?? 0),
    data: Buffer.from(t?.tx?.data ?? "", "hex"),
  };
}

/**
 * Builds global state from test parameters or returns empty state
 * Converts string values to appropriate types (BigInt, Uint8Array)
 * @param t - Optional test configuration containing state data
 * @returns State object mapping addresses to account data
 */
export function buildState(t?: Test): State {
  const state = {};
  if (!t?.state) return state;

  for (const address in t.state) {
    // @ts-expect-error
    state[address] = {
      balance: BigInt(t.state[address].balance || 0),
      code: parsers.hexStringToUint8Array(t.state[address].code?.bin || "0x00"),
    };
  }

  return state;
}

/**
 * Builds block information from test parameters or uses defaults
 * @param t - Optional test configuration containing block parameters
 * @returns Block object with blockchain context information
 */
export function buildBlock(t?: Test): Block {
  return {
    number: Number(t?.block?.number || 0),
    timestamp: BigInt(t?.block?.timestamp || 0n),
    coinbase: t?.block?.coinbase || ZERO_ADDRESS,
    difficulty: BigInt(t?.block?.difficulty || 0n),
    gaslimit: t?.block?.gaslimit || "0x0",
    chainid: Number(t?.block?.chainid || 0),
  };
}

/**
 * Validates that the input file contains required code information
 * @param options - Input options to validate
 * @returns True if valid, false otherwise
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateInputFile(options: any) {
  if (!options.code) return false;
  if (!options.code.bin && !options.code.asm) return false;
  if (options.code.bin && typeof options.code.bin !== "string") return false;
  if (options.code.asm && typeof options.code.asm !== "string") return false;

  return true;
}
