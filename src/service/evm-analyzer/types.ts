/* eslint-disable @typescript-eslint/no-explicit-any */
import { InterpreterStep } from '@ethereumjs/evm';
import { PrefixedHexString } from '@ethereumjs/util';

export interface TxData {
  from: string;
  to: string;
  value: bigint;
  data: string;
  gasLimit: bigint;
}

export interface ExecutionStep {
  opcode: {
    name: string;
    fee: number;
    dynamicFee?: bigint;
    isAsync: boolean;
    code: number;
  };
  memory: Uint8Array;
  stack: bigint[];
  storage: [PrefixedHexString, PrefixedHexString][];
  pc: number;
  gasLeft: bigint;
  gasRefund: bigint;
  depth: number;
}

export interface ExecutionResult<T = any> {
  res: T;
  step: ExecutionStep[];
}

export interface ContractInfo {
  address: string;
  code: Uint8Array;
  codeSize: number;
  balance: bigint;
  nonce: bigint;
}

export interface AccountInfo {
  address: string;
  balance: bigint;
  nonce: bigint;
  isContract: boolean;
  codeHash?: string;
  storageRoot?: string;
}

export interface DeploymentResult {
  contractAddress: string;
  transactionHash?: string;
  gasUsed: bigint;
  success: boolean;
  returnValue: Uint8Array;
}

export interface CallResult {
  success: boolean;
  returnValue: Uint8Array;
  gasUsed: bigint;
  gasRefund: bigint;
  logs: any[];
  error?: string;
}

export interface TraceOptions {
  includeMemory?: boolean;
  includeStack?: boolean;
  includeStorage?: boolean;
  maxSteps?: number;
  breakOnError?: boolean;
}

export interface AnalysisResult {
  totalGasUsed: bigint;
  opcodeFrequency: Record<string, number>;
  maxStackDepth: number;
  memoryAccesses: number;
  storageAccesses: number;
  jumps: Array<{ from: number; to: number }>;
  errors: string[];
  steps: ExecutionStep[];
}

export type { InterpreterStep };
