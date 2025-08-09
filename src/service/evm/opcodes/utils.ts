import { BIGINT_0, BIGINT_2 } from '@/lib/constants';
import { BIGINT_1 } from '@/lib/constants';
import type { OpcodeRunner, Runners } from './types';

// enums don't support bigints
export const CALL_RESULT = {
  REVERT: 0n,
  SUCCESS: 1n,
};

/**
 * Builds a range of opcode objects
 * @param start - The start of the range
 * @param end - The end of the range
 * @param name - The name of the opcode
 * @param runner - The runner function
 * @returns A record of Opcode to OpcodeDefinition
 */
export function buildOpcodeRangeObjects(start: number, end: number, name: string, runner: OpcodeRunner): Runners {
  const rangeRunners: Runners = {};
  for (let i = start; i <= end; i++) rangeRunners[i] = { name, runner };
  return rangeRunners;
}

/**
 * Parsers for converting between different data types
 */
export const parsers = {
  BytesIntoBigInt(bytes: Uint8Array): bigint {
    const array: string[] = [];
    for (const byte of bytes) array.push(byte.toString(16).padStart(2, '0'));
    return BigInt('0x' + array.join(''));
  },
  BigIntIntoBytes(bigint: bigint, length: number): Buffer {
    const hex = bigint.toString(16).padStart(2 * length, '0');
    return Buffer.from(hex, 'hex');
  },
  HexStringIntoBigInt(hex: string): bigint {
    if (!hex.startsWith('0x')) hex = hex.padStart(2 * hex.length + 2, '0x');
    return BigInt(hex);
  },
  BigintIntoHexString(bigint: bigint): string {
    return '0x' + bigint.toString(16);
  },
  hexStringToUint8Array(hexString: string): Uint8Array {
    return new Uint8Array((hexString?.match(/../g) || []).map((byte) => parseInt(byte, 16)));
  },
  BufferToHexString(buffer: Buffer): string {
    return '0x' + buffer.toString('hex');
  },
};
const N = BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639936);
export function exponentiation(bas: bigint, exp: bigint) {
  let t = BIGINT_1;
  while (exp > BIGINT_0) {
    if (exp % BIGINT_2 !== BIGINT_0) {
      t = (t * bas) % N;
    }
    bas = (bas * bas) % N;
    exp = exp / BIGINT_2;
  }
  return t;
}
