import { BIGINT_0 } from '@/lib/constants';
import { MachineState } from '../../machine-state/types';
import { parsers } from '../utils';

/**
 * BLOCKHASH
 *  - 0x40
 */
export const BLOCKHASH = (state: MachineState) => {
  const n = state.stack.pop(); // block number
  const current = state.block.number;

  // Only the 256 most recent blocks (excluding current) are available
  if (n >= current || current - n > 256n) {
    state.stack.push(BIGINT_0);
    return;
  }

  const hashBuf = state.globalState.getBlockHash(n);
  if (!hashBuf) {
    state.stack.push(BIGINT_0);
    return;
  }

  // Convert 32-byte hash to bigint (big-endian)
  const asBigInt = parsers.BytesIntoBigInt(hashBuf);
  state.stack.push(asBigInt);
};

/**
 * COINBASE
 *  - 0x41
 * @param state - The machine state
 * @returns void
 */
export const COINBASE = (state: MachineState) => {
  const res = state.block.coinbase;
  state.stack.push(parsers.HexStringIntoBigInt(res));
};

/**
 * TIMESTAMP
 *  - 0x42
 * @param state - The machine state
 * @returns void
 */
export const TIMESTAMP = (state: MachineState) => {
  const res = state.block.timestamp;
  state.stack.push(res);
};

/**
 * NUMBER
 *  - 0x43
 * @param state - The machine state
 * @returns void
 */
export const NUMBER = (state: MachineState) => {
  const res = state.block.number;
  state.stack.push(res);
};

/**
 * DIFFICULTY
 *  - 0x44
 * @param state - The machine state
 * @returns void
 */
export const DIFFICULTY = (state: MachineState) => {
  const res = state.block.difficulty;
  state.stack.push(res);
};

/**
 * GASLIMIT
 *  - 0x45
 * @param state - The machine state
 * @returns void
 */
export const GASLIMIT = (state: MachineState) => {
  const res = state.block.gasLimit;
  state.stack.push(res);
};

/**
 * CHAINID
 *  - 0x46
 * @param state - The machine state
 * @returns void
 */
export const CHAINID = (state: MachineState) => {
  const res = state.block.chainId;
  state.stack.push(res);
};

/**
 * SELFBALANCE
 *  - 0x47
 * @param state - The machine state
 * @returns void
 */
export const SELFBALANCE = (state: MachineState) => {
  const res = state.globalState.getBalance(state.txData.to);
  state.stack.push(res);
};

/**
 * BASEFEE
 *  - 0x48
 * @param state - The machine state
 * @returns void
 */
export const BASEFEE = (state: MachineState) => {
  const res = state.block.baseFee;
  state.stack.push(res);
};
