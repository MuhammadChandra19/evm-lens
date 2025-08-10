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
  const data = ms.memory.read(Number(offset), 32).subarray(0, Number(size));
  const hash = keccak256(data);
  const res = parsers.BytesIntoBigInt(hash);
  ms.stack.push(res);
}
