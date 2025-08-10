import { keccak256 } from 'ethereum-cryptography/keccak';
import { parsers } from '../utils';

import type { MachineState } from '../../machine-state/types';

/**
 * SHA3 opcode (0x20): Compute Keccak-256 hash of memory data
 * Pops offset and size from stack, pushes hash result
 * @param ms - Machine state
 */
export function SHA3(ms: MachineState) {
  const [offset, size] = ms.stack.popN(2);

  try {
    const data = ms.memory.read(Number(offset), Number(size));
    const uint8Data = new Uint8Array(data); // ✅ Convert Buffer to Uint8Array
    const hash = keccak256(uint8Data);
    const res = parsers.BytesIntoBigInt(hash);
    ms.stack.push(res);
  } catch (error) {
    console.error('SHA3 error:', error);
    throw error;
  }
}
