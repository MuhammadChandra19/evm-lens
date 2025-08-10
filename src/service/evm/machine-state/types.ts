import type Stack from './stack';
import type Memory from './memory';
import type Storage from './storage';
import type GlobalState from '../globalState';
import type { Block, Gas, Log, ProgramCounter, TxData } from '../types';

export interface MachineState {
  gasAvailable: Gas;
  pc: ProgramCounter;
  memory: Memory;
  stack: Stack;

  code: Uint8Array;
  txData: TxData;
  storage: Storage;
  globalState: GlobalState;
  block: Block;
  returnData: Buffer;
  logs: Log[];

  codeString: string;

  static: boolean;
}
