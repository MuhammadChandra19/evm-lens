// src/service/evm-analyzer/abi/util.ts

import { keccak256 } from "ethereum-cryptography/keccak";
import { ABIConstructor, ABIEvent } from "../types";
import { AbiFunction } from "./types";

// Simple encoding functions
const encodeUint256 = (value: bigint): string => {
  const result = value.toString(16).padStart(64, "0");
  return result;
};

const encodeAddress = (address: string): string => {
  const cleanAddr = address.startsWith("0x") ? address.slice(2) : address;
  return cleanAddr.padStart(64, "0");
};

const encodeBool = (value: boolean): string => {
  return encodeUint256(value ? BigInt(1) : BigInt(0));
};

const encodeBytes32 = (value: string): string => {
  const cleanHex = value.startsWith("0x") ? value.slice(2) : value;
  return cleanHex.padEnd(64, "0");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const encodeParameter = (type: string, value: any): string => {
  // Handle arrays
  if (type.includes("[") && type.includes("]")) {
    if (!Array.isArray(value)) {
      throw new Error(`Expected array for type ${type}, got ${typeof value}`);
    }
    const baseType = type.split("[")[0];
    const arrayMatch = type.match(/\[(\d*)\]/);
    const isFixedArray = arrayMatch && arrayMatch[1];

    let encoded = "";
    if (!isFixedArray) {
      encoded += encodeUint256(BigInt(value.length));
    }
    for (const item of value) {
      encoded += encodeParameter(baseType, item);
    }
    return encoded;
  }

  // Handle basic types
  switch (type) {
    case "address":
      return encodeAddress(value);
    case "bool":
      return encodeBool(value);
    default:
      if (type.startsWith("uint") || type.startsWith("int")) {
        const numValue =
          typeof value === "string" || typeof value === "number"
            ? BigInt(value)
            : value;
        return encodeUint256(numValue);
      } else if (type.startsWith("bytes")) {
        return encodeBytes32(value);
      }
      throw new Error(`Unsupported type: ${type}`);
  }
};

// Function signature generation
export const generateFunctionSignature = (
  func: AbiFunction | ABIEvent,
): string => {
  const inputs = func.inputs.map((input) => input.type).join(",");
  return `${func.name}(${inputs})`;
};

export const generateConstructorSignature = (
  constructor: ABIConstructor,
): string => {
  const inputs = constructor.inputs.map((input) => input.type).join(",");
  return `constructor(${inputs})`;
};

export const generateSelector = (signature: string): string => {
  const hash = keccak256(Buffer.from(signature, "utf8"));
  return "0x" + Buffer.from(hash.slice(0, 4)).toString("hex");
};

export const generateEventHash = (signature: string): string => {
  const hash = keccak256(Buffer.from(signature, "utf8"));
  return "0x" + Buffer.from(hash).toString("hex");
};

export const generateFunctionHash = (func: AbiFunction | ABIEvent): string => {
  const signature = generateFunctionSignature(func);
  return generateSelector(signature);
};

export const generateInputHash = (
  func: AbiFunction | ABIEvent,
  args: string[],
  decimals?: number,
): string => {
  let result = "";

  if (func.inputs.length === 0) {
    return result;
  }

  if (func.inputs.length !== args.length) {
    throw new Error(
      `Expected ${func.inputs.length} arguments, got ${args.length}`,
    );
  }

  for (let i = 0; i < func.inputs.length; i++) {
    const input = func.inputs[i];
    let value = args[i];

    // ✅ Simple decimal logic: if decimals provided and type is number, apply it
    if (
      decimals &&
      (input.type?.startsWith("uint") || input.type?.startsWith("int"))
    ) {
      // Check if it's a parseable number
      try {
        const num = BigInt(value);
        // Only apply decimals if the number seems "small" (not already scaled)
        if (value.length <= 10) {
          // Rough heuristic: if less than 10 digits, probably not scaled
          const scaledValue = num * BigInt(10 ** decimals);
          value = scaledValue.toString();
        }
      } catch {
        // If not parseable as BigInt, use as-is
      }
    }

    if (input.type) {
      try {
        const encoded = encodeParameter(input.type, value);
        result += encoded;
      } catch (error) {
        throw new Error(
          `Error encoding parameter '${input.name}' of type '${input.type}': ${error}`,
        );
      }
    }
  }

  return result;
};
