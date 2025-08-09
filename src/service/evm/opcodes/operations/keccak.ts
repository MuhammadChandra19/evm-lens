import { keccak256 } from 'ethereum-cryptography/keccak';
import { MachineState } from '../../machine-state/types';
import { parsers } from '../utils';

/**
 * Keccak256
 * Computes the Keccak-256 hash of the memory at the given offset and size
 *  - 0x20
 * @param state - The machine state
 * @returns void
 */
export const KECCAK256 = (state: MachineState) => {
  const [offset, size] = state.stack.popN(2);
  const data = state.memory.load(Number(offset), 32).subarray(0, Number(size));
  const hash = keccak256(data);

  const res = parsers.BytesIntoBigInt(hash);
  state.stack.push(res);
};
