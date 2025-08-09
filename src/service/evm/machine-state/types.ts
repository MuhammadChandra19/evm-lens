import GlobalState from '../globalState';
import { BlockContext, Gas, ProgramCounter, TxData } from '../types';
import { Opcode } from '../opcodes/types';
import Memory from './memory';
import Stack from './stack';

export interface MachineState {
  programCounter: ProgramCounter;
  opCode: Opcode;
  memory: Memory;
  stack: Stack;
  code: Uint8Array;

  pc: ProgramCounter;
  gasAvailable: Gas;
  gasLeft: Gas;
  txData: TxData;

  // add
  block: BlockContext;

  globalState: GlobalState;
  returnData: Buffer;
}
