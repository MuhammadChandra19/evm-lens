import { Gas, ProgramCounter, TxData } from '../types';
import Memory from './memory';
import Stack from './stack';

export interface MachineState {
  memory: Memory;
  stack: Stack;
  code: Uint8Array;

  pc: ProgramCounter;
  gasAvailable: Gas;
  txData: TxData;
}
