/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecResult, InterpreterStep } from "@ethereumjs/evm";
import { Address, PrefixedHexString } from "@ethereumjs/util";

export interface TxData {
  from: Address;
  to?: Address;
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
  address: Address;
  code: Uint8Array;
  codeSize: number;
  balance: bigint;
  nonce: bigint;
}

/**
 * Comprehensive account information from the EVM state
 */
export interface AccountInfo {
  /** The account address */
  address: Address;
  /** The account balance in wei */
  balance: bigint;
  /** The account nonce */
  nonce: bigint;
  /** Whether this account is a contract (has code) */
  isContract?: boolean;
  /** Hash of the contract code (if isContract is true) */
  codeHash?: string;
  /** Hash of the storage root */
  storageRoot?: string;
  /** Contract bytecode (if isContract is true) */
  code?: Uint8Array;
}

export interface DeploymentResult {
  contractAddress: Address;
  transactionHash?: string;
  gasUsed: bigint;
  success: boolean;
  returnValue: Uint8Array;
  steps: ExecutionStep[];
  executionResult: ExecResult
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

// State export is handled by the EVM store serializers

export interface StateSnapshot {
  id: string;
  timestamp: number;
  stateRoot: string;
  description?: string;
  metadata?: {
    blockNumber: bigint;
    accountCount: number;
    contractCount: number;
  };
}
