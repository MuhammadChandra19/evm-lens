import { Gas, Log, ProgramCounter, State, TxData, Block } from './types';

// Enhanced instruction info for control flow analysis
export interface InstructionInfo {
  pc: ProgramCounter;
  opcode: number;
  name: string;
  operand?: Uint8Array;
  operandHex?: string;
  size: number; // total instruction size in bytes
  gasBase: Gas;

  // Control flow properties
  isJump: boolean;
  isConditionalJump: boolean;
  isJumpDestination: boolean;
  isTerminating: boolean; // STOP, RETURN, REVERT, etc.

  // Stack effects
  stackPop: number; // items consumed from stack
  stackPush: number; // items pushed to stack

  // Memory/Storage access
  accessesMemory: boolean;
  accessesStorage: boolean;
}

// Control flow analysis result
export interface ControlFlowAnalysis {
  instructions: Map<ProgramCounter, InstructionInfo>;
  jumpTargets: Map<ProgramCounter, ProgramCounter[]>; // target -> sources
  jumpSources: Map<ProgramCounter, ProgramCounter[]>; // source -> targets
  deadCode: ProgramCounter[]; // unreachable instructions
  entryPoints: ProgramCounter[]; // function entry points
}

// Basic block representation
export interface BasicBlock {
  id: string;
  startPc: ProgramCounter;
  endPc: ProgramCounter;
  instructions: InstructionInfo[];

  // Control flow
  successors: ProgramCounter[]; // next blocks
  predecessors: ProgramCounter[]; // previous blocks

  // Analysis metadata
  isReachable: boolean;
  functionId?: string;
  loopDepth: number;
}

// Function detection
export interface DetectedFunction {
  id: string;
  selector?: string; // 4-byte function selector for public functions
  startPc: ProgramCounter;
  endPc?: ProgramCounter;
  name?: string; // inferred or provided name
  signature?: string; // function signature if known
  isPublic: boolean;
  isPayable: boolean;
  blocks: string[]; // basic block IDs
}

// Complete control flow graph
export interface ControlFlowGraph {
  blocks: Map<string, BasicBlock>;
  functions: DetectedFunction[];
  entryPoint: ProgramCounter;
  analysis: ControlFlowAnalysis;

  // Metadata
  totalInstructions: number;
  totalGasEstimate: Gas;
  complexity: number; // cyclomatic complexity
}

// Execution snapshot at a specific step
export interface ExecutionSnapshot {
  stepNumber: number;
  pc: ProgramCounter;
  opcode: string;

  // Machine state snapshot
  gasRemaining: Gas;
  gasUsed: Gas;

  // Stack state (formatted for display)
  stackBefore: string[];
  stackAfter: string[];
  stackDelta: {
    pushed: string[];
    popped: string[];
  };

  // Memory changes
  memoryChanges?: {
    offset: number;
    sizeBefore: number;
    sizeAfter: number;
    data: string; // hex representation
  };

  // Storage changes
  storageChanges?: Array<{
    key: string;
    valueBefore: string;
    valueAfter: string;
  }>;

  // Other state
  returnData?: string;
  logs?: Log[];
  error?: string;
}

// Complete execution trace
export interface ExecutionTrace {
  snapshots: ExecutionSnapshot[];
  initialState: {
    code: string;
    txData: TxData;
    block: Block;
    state: State;
  };
  finalState: {
    success: boolean;
    gasUsed: Gas;
    returnData: string;
    logs: Log[];
    error?: string;
    modifiedStorage: Record<string, string>;
  };

  // Execution statistics
  stats: {
    totalSteps: number;
    uniqueInstructionsHit: number;
    maxStackDepth: number;
    maxMemorySize: number;
    loopIterations: Record<ProgramCounter, number>;
  };
}

// Service interface for analysis
export interface EVMAnalyzer {
  // Static analysis
  analyzeControlFlow(code: Uint8Array): ControlFlowGraph;
  detectFunctions(cfg: ControlFlowGraph): DetectedFunction[];

  // Execution with tracing
  executeWithTrace(code: Uint8Array, txData: TxData, block: Block, state?: State, maxSteps?: number): Promise<ExecutionTrace>;

  // Utilities
  disassemble(code: Uint8Array): InstructionInfo[];
  estimateGas(cfg: ControlFlowGraph): Gas;
}
