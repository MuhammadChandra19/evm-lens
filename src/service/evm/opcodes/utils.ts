import { MAX_256_BITS } from "../constants";

import type { OpcodeRunner, Runners } from "./types";

// enums don't support bigints
export const CALL_RESULT = {
  REVERT: 0n,
  SUCCESS: 1n,
};

/**
 * Builds a range of opcode runners for instructions like PUSH1-PUSH32, DUP1-DUP16, etc.
 * @param start - Starting opcode value (inclusive)
 * @param end - Ending opcode value (inclusive)
 * @param name - Base name for the opcodes
 * @param runner - Runner function to use for all opcodes in the range
 * @returns Runners object mapping opcode values to runner info
 */
export function buildOpcodeRangeObjects(
  start: number,
  end: number,
  name: string,
  runner: OpcodeRunner,
): Runners {
  const rangeRunners: Runners = {};
  for (let i = start; i <= end; i++) rangeRunners[i] = { name, runner };
  return rangeRunners;
}

export const parsers = {
  /**
   * Converts a byte array to BigInt
   * @param bytes - Uint8Array to convert
   * @returns BigInt representation of the bytes
   */
  BytesIntoBigInt(bytes: Uint8Array): bigint {
    let array: string[] = [];
    for (const byte of bytes) array.push(byte.toString(16).padStart(2, "0"));
    return BigInt("0x" + array.join(""));
  },

  /**
   * Converts a BigInt to a Buffer of specified length
   * @param bigint - BigInt value to convert
   * @param length - Target byte length
   * @returns Buffer representation padded to specified length
   */
  BigIntIntoBytes(bigint: bigint, length: number): Buffer {
    const hex = bigint.toString(16).padStart(2 * length, "0");
    return Buffer.from(hex, "hex");
  },

  /**
   * Converts a hex string to BigInt
   * @param hex - Hex string (with or without 0x prefix)
   * @returns BigInt representation of the hex string
   */
  HexStringIntoBigInt(hex: string): bigint {
    if (!hex.startsWith("0x")) hex = hex.padStart(2 * hex.length + 2, "0x");
    return BigInt(hex);
  },

  /**
   * Converts a BigInt to a hex string with 0x prefix
   * @param bigint - BigInt to convert
   * @returns Hex string representation with 0x prefix
   */
  BigintIntoHexString(bigint: bigint): string {
    return "0x" + bigint.toString(16);
  },

  /**
   * Converts a hex string to Uint8Array
   * @param hexString - Hex string to convert
   * @returns Uint8Array representation of the hex data
   */
  hexStringToUint8Array(hexString: string): Uint8Array {
    return new Uint8Array(
      (hexString?.match(/../g) || []).map((byte) => parseInt(byte, 16)),
    );
  },

  /**
   * Converts a Buffer to hex string with 0x prefix
   * @param buffer - Buffer to convert
   * @returns Hex string with 0x prefix
   */
  BufferToHexString(buffer: Buffer): string {
    return "0x" + buffer.toString("hex");
  },
};

// https://stackoverflow.com/questions/51867270
export const bigMath = {
  /**
   * Returns the absolute value of a BigInt
   * @param x - BigInt value
   * @returns Absolute value
   */
  abs(x: bigint): bigint {
    return x < 0n ? -x : x;
  },

  /**
   * Returns the sign of a BigInt (-1, 0, or 1)
   * @param x - BigInt value
   * @returns -1n for negative, 0n for zero, 1n for positive
   */
  sign(x: bigint): bigint {
    if (x === 0n) return 0n;
    return x < 0n ? -1n : 1n;
  },

  /**
   * Raises base to the power of exponent
   * @param base - Base value
   * @param exponent - Exponent value
   * @returns base^exponent
   */
  pow(base: bigint, exponent: bigint): bigint {
    return base ** exponent;
  },

  /**
   * Returns the minimum value from a set of BigInt values
   * @param value - First value
   * @param values - Additional values to compare
   * @returns Minimum value
   */
  min(value: bigint, ...values: bigint[]): bigint {
    for (const v of values) if (v < value) value = v;
    return value;
  },

  /**
   * Returns the maximum value from a set of BigInt values
   * @param value - First value
   * @param values - Additional values to compare
   * @returns Maximum value
   */
  max(value: bigint, ...values: bigint[]): bigint {
    for (const v of values) if (v > value) value = v;
    return value;
  },

  /**
   * Converts an unsigned 256-bit value to signed 256-bit
   * @param x - Unsigned BigInt value
   * @returns Signed 256-bit representation
   */
  toSigned256(x: bigint): bigint {
    return BigInt.asIntN(256, x);
  },

  /**
   * Converts a signed value to unsigned 256-bit
   * @param x - Signed BigInt value
   * @returns Unsigned 256-bit representation
   */
  toUnsigned256(x: bigint): bigint {
    return BigInt.asUintN(256, x);
  },

  /**
   * Performs modulo operation with 2^256 to keep values in valid range
   * @param x - BigInt value
   * @returns Value modulo 2^256, properly handling negative numbers
   */
  mod256(x: bigint): bigint {
    const mod = x % MAX_256_BITS;
    return mod < 0n ? mod + MAX_256_BITS : mod;
  },

  /**
   * Rounds up to the nearest multiple of ceil value
   * @param x - Value to round up
   * @param ceil - Multiple to round up to
   * @returns Smallest multiple of ceil that is >= x
   */
  ceil(x: bigint, ceil: bigint): bigint {
    const mod = x % ceil;
    return mod === 0n ? x : x + ceil - mod;
  },
};
