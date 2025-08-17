/* eslint-disable @typescript-eslint/no-explicit-any */
import { InterpreterStep } from "@ethereumjs/evm";
import { PrefixedHexString } from "@ethereumjs/util";

export interface TxData {
  from: string;
  to?: string;
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
  steps: ExecutionStep[];
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

export interface FunctionInfo {
  selector: string; // 4-byte function selector (e.g., "0xa9059cbb")
  signature?: string; // Function signature (e.g., "transfer(address,uint256)")
  name?: string; // Function name (e.g., "transfer")
  inputs?: Parameter[];
  outputs?: Parameter[];
  stateMutability?: "pure" | "view" | "nonpayable" | "payable";
  type: "function" | "constructor" | "fallback" | "receive";
}

export interface Parameter {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ContractAnalysis {
  functions: FunctionInfo[];
  events: EventInfo[];
  constructor?: FunctionInfo;
  fallback?: FunctionInfo;
  receive?: FunctionInfo;
  totalSupply?: bigint;
  name?: string;
  symbol?: string;
  decimals?: number;
}

export interface EventInfo {
  hash: string;
  signature: string;
  name: string;
  inputs: Parameter[];
}

export interface ABIInput {
  internalType?: string;
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ABIOutput {
  internalType?: string;
  name: string;
  type: string;
}

export interface ABIFunction {
  inputs: ABIInput[];
  name: string;
  outputs: ABIOutput[];
  stateMutability: "pure" | "view" | "nonpayable" | "payable";
  type: "function";
}

export interface ABIEvent {
  anonymous: boolean;
  inputs: ABIInput[];
  name: string;
  type: "event";
}

export interface ABIConstructor {
  inputs: ABIInput[];
  stateMutability: "nonpayable" | "payable";
  type: "constructor";
}

export type ABIItem = ABIFunction | ABIEvent | ABIConstructor;

export interface ContractMetadata {
  compiler: {
    version: string;
  };
  language: string;
  output: {
    abi: ABIItem[];
    devdoc?: any;
    userdoc?: any;
  };
  settings: any;
  sources: any;
  version: number;
}

export interface EnhancedContractAnalysis extends ContractAnalysis {
  metadata?: ContractMetadata;
  abiDerived: boolean; // Whether analysis was derived from ABI
}
