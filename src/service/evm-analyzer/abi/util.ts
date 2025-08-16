import { keccak256 } from 'ethereum-cryptography/keccak';
import { ABIConstructor, ABIEvent } from '../types'
import { AbiFunction } from './types'

const encodeUint256 = (value: bigint): string => {
  return value.toString(16).padStart(64, "0");
};

const encodeAddress = (address: string): string => {
  const cleanAddr = address.startsWith("0x") ? address.slice(2) : address;
  return cleanAddr.padStart(64, "0");
};

// Additional encoding functions for other types
const encodeBool = (value: boolean): string => {
  return encodeUint256(value ? BigInt(1) : BigInt(0));
};

const encodeBytes32 = (value: string): string => {
  const cleanHex = value.startsWith("0x") ? value.slice(2) : value;
  return cleanHex.padEnd(64, "0");
};

const encodeString = (value: string): string => {
  // For dynamic types like strings, you need offset + length + data
  // This is simplified - in practice you'd handle dynamic encoding
  const hex = Buffer.from(value, 'utf8').toString('hex');
  const length = encodeUint256(BigInt(value.length));
  const paddedHex = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
  return length + paddedHex;
};

const encodeBytes = (value: string): string => {
  const cleanHex = value.startsWith("0x") ? value.slice(2) : value;
  const length = encodeUint256(BigInt(cleanHex.length / 2));
  const paddedHex = cleanHex.padEnd(Math.ceil(cleanHex.length / 64) * 64, '0');
  return length + paddedHex;
};

// Dynamic encoder based on type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const encodeParameter = (type: string, value: any): string => {
  // Handle array types
  if (type.includes('[') && type.includes(']')) {
    if (!Array.isArray(value)) {
      throw new Error(`Expected array for type ${type}, got ${typeof value}`);
    }
    
    const baseType = type.split('[')[0];
    const arrayMatch = type.match(/\[(\d*)\]/);
    const isFixedArray = arrayMatch && arrayMatch[1];
    
    let encoded = '';
    
    // For dynamic arrays, encode length first
    if (!isFixedArray) {
      encoded += encodeUint256(BigInt(value.length));
    }
    
    // Encode each element
    for (const item of value) {
      encoded += encodeParameter(baseType, item);
    }
    
    return encoded;
  }

  // Handle basic types
  switch (type) {
    case 'address':
      return encodeAddress(value);
    
    case 'bool':
      return encodeBool(value);
    
    case 'string':
      return encodeString(value);
    
    case 'bytes':
      return encodeBytes(value);
    
    default:
      // Handle uintX, intX, bytesX
      if (type.startsWith('uint') || type.startsWith('int')) {
        const bigIntValue = typeof value === 'bigint' ? value : BigInt(value);
        return encodeUint256(bigIntValue);
      } else if (type.startsWith('bytes') && type.length > 5) {
        // Fixed bytes like bytes32
        return encodeBytes32(value);
      }
      
      throw new Error(`Unsupported type: ${type}`);
  }
};


export const generateFunctionSignature = (func: AbiFunction | ABIEvent): string => {
  const inputs = func.inputs.map((input) => input.type).join(",");
  return `${func.name}(${inputs})`;
}

export const generateConstructorSignature = (
    constructor: ABIConstructor,
  ): string => {
  const inputs = constructor.inputs.map((input) => input.type).join(",");
  return `constructor(${inputs})`;
}


export const generateSelector = (signature: string): string => {
  const hash = keccak256(Buffer.from(signature, "utf8"));
  return "0x" + Buffer.from(hash.slice(0, 4)).toString("hex");
}

export const generateEventHash = (signature: string): string => {
  const hash = keccak256(Buffer.from(signature, "utf8"));
  return "0x" + Buffer.from(hash).toString("hex");
}

export const generateFunctionHash = (func: AbiFunction | ABIEvent): string => {
  const signature = generateFunctionSignature(func)
  const selector = generateSelector(signature)
  return selector
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateInputHash = (func: AbiFunction | ABIEvent, args: any[]): string => {
  let result = ""

  for(let i = 0; i < func.inputs.length; i++) {
    const current = func.inputs[i]
    const value = args[i];
    if (current.type) {
      try {
        const encoded = encodeParameter(current.type, value);
        result += encoded;
      } catch (error) {
        throw new Error(`Error encoding parameter '${current.name}' of type '${current.type}': ${error}`);
      }
    }

  }

  return result
}