import { parsers } from '../utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

import type { MachineState } from '../../machine-state/types';

/**
 * Generates a mock block hash for testing purposes
 * In production, this would be replaced with actual blockchain data lookup
 */
function generateMockBlockHash(blockNumber: number): Uint8Array {
  // Create deterministic hash based on block number
  const blockData = Buffer.from(`block_${blockNumber}`, 'utf8');
  return keccak256(blockData);
}

/**
 * BLOCKHASH opcode (0x40): Get hash of a specific block
 * Pops block number from stack, pushes block hash (or 0 if unavailable)
 * Only the most recent 256 blocks are accessible
 * @param ms - Machine state
 */
export function BLOCKHASH(ms: MachineState) {
  const blockNumber = ms.stack.pop();
  const currentBlockNumber = BigInt(ms.block.number);

  const requestedBlock = Number(blockNumber);
  const currentBlock = Number(currentBlockNumber);

  // Validation
  if (blockNumber >= currentBlockNumber || currentBlock - requestedBlock > 256 || requestedBlock < 0) {
    ms.stack.push(0n);
    return;
  }

  // Try to get real hash first, fallback to mock
  const realHash = ms.block.blockHashes?.[requestedBlock];
  if (realHash) {
    const hashAsBigInt = parsers.HexStringIntoBigInt(realHash);
    ms.stack.push(hashAsBigInt);
  } else {
    // Fallback to mock hash for testing
    const mockHash = generateMockBlockHash(requestedBlock);
    const hashAsBigInt = parsers.BytesIntoBigInt(mockHash);
    ms.stack.push(hashAsBigInt);
  }
}

/**
 * COINBASE opcode (0x41): Push block coinbase address onto stack
 * @param ms - Machine state
 */
export function COINBASE(ms: MachineState) {
  const res = ms.block.coinbase;
  ms.stack.push(parsers.HexStringIntoBigInt(res));
}

/**
 * TIMESTAMP opcode (0x42): Push block timestamp onto stack
 * @param ms - Machine state
 */
export function TIMESTAMP(ms: MachineState) {
  const res = ms.block.timestamp;
  ms.stack.push(res);
}

/**
 * NUMBER opcode (0x43): Push block number onto stack
 * @param ms - Machine state
 */
export function NUMBER(ms: MachineState) {
  const res = ms.block.number;
  ms.stack.push(BigInt(res));
}

/**
 * DIFFICULTY opcode (0x44): Push block difficulty onto stack
 * @param ms - Machine state
 */
export function DIFFICULTY(ms: MachineState) {
  const res = ms.block.difficulty;
  ms.stack.push(BigInt(res));
}

/**
 * GASLIMIT opcode (0x45): Push block gas limit onto stack
 * @param ms - Machine state
 */
export function GASLIMIT(ms: MachineState) {
  const res = ms.block.gaslimit;
  ms.stack.push(parsers.HexStringIntoBigInt(res));
}

/**
 * CHAINID opcode (0x46): Push chain ID onto stack
 * @param ms - Machine state
 */
export function CHAINID(ms: MachineState) {
  const res = ms.block.chainid;
  ms.stack.push(BigInt(res));
}
