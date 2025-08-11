import fs from 'fs';
import path from 'path';
import runners from './opcodes/runners';
import type { MachineState } from './machine-state/types';
import { parsers } from './opcodes/utils';
import { ExecutionSnapshot, ExecutionTrace } from './evm-analysis-types';
import type { TxData, Block } from './types';

export default class Logger {
  private _output: string[];
  private _steps: number;

  // NEW: Execution trace for visualization
  private _executionTrace: ExecutionSnapshot[];
  private _initialState?: {
    code: Uint8Array;
    codeString: string;
    asm?: string;
  };

  // NEW: Previous state tracking for better snapshots
  private _previousState?: {
    stack: string[];
    gasAvailable: bigint;
    memorySize: number;
    storageKeys: Set<string>;
  };

  // NEW: Visualization callbacks
  private _onStepCallback?: (snapshot: ExecutionSnapshot) => void;
  private _trackExecution: boolean;

  /**
   * Initializes a new logger instance for EVM execution tracking
   * @param trackExecution - Whether to track execution for visualization (default: true)
   */
  constructor(trackExecution: boolean = true) {
    this._steps = 0;
    this._output = [];
    this._executionTrace = [];
    this._trackExecution = trackExecution;
  }

  /**
   * Set callback for real-time step updates (for live visualization)
   */
  setStepCallback(callback: (snapshot: ExecutionSnapshot) => void) {
    this._onStepCallback = callback;
  }

  /**
   * Logs the start of execution with bytecode and optional assembly
   * @param bin - Bytecode as Uint8Array
   * @param asm - Optional assembly code string
   */
  start(bin: Uint8Array, asm?: string) {
    // Your existing logging
    this._output.push(`******************** Starting Execution ********************`);
    this._output.push(``);
    this._output.push(`Execution Bytecode:`);
    this._output.push(`${Buffer.from(bin).toString('hex')}`);
    this._output.push(``);

    if (asm) {
      this._output.push(`Execution ASM:`);
      this._output.push(asm);
      this._output.push(``);
    }

    this._output.push(`Starting execution...`);
    this._output.push(``);

    // NEW: Store initial state for visualization
    if (this._trackExecution) {
      this._initialState = {
        code: bin,
        codeString: Buffer.from(bin).toString('hex'),
        asm,
      };
      this._executionTrace = [];
    }
  }

  /**
   * Logs a single execution step with complete machine state
   * @param ms - Current machine state including stack, memory, storage, etc.
   */
  step(ms: MachineState) {
    const currentOpcode = runners[ms.code[ms.pc]];

    // Your existing logging
    this._output.push(`******************** Step ${this._steps} ********************`);
    this._output.push(`Opcode: ${currentOpcode.name}`);
    this._output.push(`Program Counter: ${ms.pc}`);
    this._output.push(``);
    this._output.push(`Stack:`);
    this._output.push(`${ms.stack.dump.map(parsers.BigintIntoHexString).join('\n')}`);
    this._output.push(``);
    this._output.push(`Memory:`);
    this._output.push(`${ms.memory.dump || 'Empty'}`);
    this._output.push(``);
    this._output.push(`Storage:`);
    this._output.push(`${ms.storage.dump || 'Empty'}`);
    this._output.push(``);
    this._output.push(`Return data:`);
    this._output.push(`${ms.returnData.toString('hex') || 'Empty'}`);
    this._output.push(``);
    this._output.push(`Logs:`);
    this._output.push(`${ms.logs || 'Empty'}`);
    this._output.push(``);

    // NEW: Create execution snapshot for visualization
    if (this._trackExecution) {
      const snapshot = this._createExecutionSnapshot(ms);
      this._executionTrace.push(snapshot);

      // Call real-time callback if set
      if (this._onStepCallback) {
        this._onStepCallback(snapshot);
      }
    }

    this._steps++;
  }

  /**
   * NEW: Create execution snapshot from machine state
   */
  private _createExecutionSnapshot(ms: MachineState): ExecutionSnapshot {
    const currentOpcode = runners[ms.code[ms.pc]];

    // Get current state
    const currentStack = ms.stack.dump.map(parsers.BigintIntoHexString);
    const currentGas = ms.gasAvailable;
    const currentMemorySize = ms.memory.dump ? ms.memory.dump.length / 2 : 0;

    // Use previous state if available, otherwise use current state as both
    const stackBefore = this._previousState?.stack || [...currentStack];
    const stackAfter = currentStack;
    const gasBefore = this._previousState?.gasAvailable || currentGas;
    const gasUsed = gasBefore > currentGas ? gasBefore - currentGas : 0n;
    const memoryBefore = this._previousState?.memorySize || currentMemorySize;

    // Calculate stack delta using proper before/after states
    const stackDelta = this._calculateStackDelta(stackBefore, stackAfter, currentOpcode.name);

    // Create memory changes info if memory size changed
    const memoryChanges =
      ms.memory.dump && currentMemorySize !== memoryBefore
        ? {
            offset: Math.min(memoryBefore * 2, currentMemorySize * 2), // Start of change
            sizeBefore: memoryBefore,
            sizeAfter: currentMemorySize,
            data: ms.memory.dump,
          }
        : undefined;

    const snapshot: ExecutionSnapshot = {
      stepNumber: this._steps,
      pc: ms.pc,
      opcode: currentOpcode.name,

      gasRemaining: currentGas,
      gasUsed,

      stackBefore,
      stackAfter,
      stackDelta,

      memoryChanges,
      storageChanges: this._getStorageChanges(ms),

      returnData: ms.returnData.length > 0 ? ms.returnData.toString('hex') : undefined,
      logs: ms.logs.length > 0 ? [...ms.logs] : undefined,
    };

    // Update previous state for next iteration
    this._previousState = {
      stack: [...currentStack],
      gasAvailable: currentGas,
      memorySize: currentMemorySize,
      storageKeys: new Set(), // Would need to track storage keys
    };

    return snapshot;
  }

  /**
   * NEW: Calculate stack delta for visualization
   */
  private _calculateStackDelta(before: string[], after: string[], opcode: string): { pushed: string[]; popped: string[] } {
    // Get stack effects for the opcode
    const { pops, pushes } = this._getOpcodeStackEffects(opcode);

    // Calculate popped items (taken from top of before stack)
    const popped = before.slice(0, pops);

    // Calculate pushed items (new items on top of after stack)
    const pushed = after.slice(0, pushes);

    return {
      pushed,
      popped,
    };
  }

  /**
   * Get stack effects (pops/pushes) for a given opcode
   */
  private _getOpcodeStackEffects(opcode: string): { pops: number; pushes: number } {
    // Define stack effects for all opcodes
    const stackEffects: Record<string, { pops: number; pushes: number }> = {
      // Arithmetic operations (pop 2, push 1)
      ADD: { pops: 2, pushes: 1 },
      MUL: { pops: 2, pushes: 1 },
      SUB: { pops: 2, pushes: 1 },
      DIV: { pops: 2, pushes: 1 },
      SDIV: { pops: 2, pushes: 1 },
      MOD: { pops: 2, pushes: 1 },
      SMOD: { pops: 2, pushes: 1 },
      EXP: { pops: 2, pushes: 1 },
      SIGNEXTEND: { pops: 2, pushes: 1 },

      // Arithmetic operations (pop 3, push 1)
      ADDMOD: { pops: 3, pushes: 1 },
      MULMOD: { pops: 3, pushes: 1 },

      // Comparison operations (pop 2, push 1)
      LT: { pops: 2, pushes: 1 },
      GT: { pops: 2, pushes: 1 },
      SLT: { pops: 2, pushes: 1 },
      SGT: { pops: 2, pushes: 1 },
      EQ: { pops: 2, pushes: 1 },

      // Comparison operations (pop 1, push 1)
      ISZERO: { pops: 1, pushes: 1 },

      // Bitwise operations (pop 2, push 1)
      AND: { pops: 2, pushes: 1 },
      OR: { pops: 2, pushes: 1 },
      XOR: { pops: 2, pushes: 1 },
      BYTE: { pops: 2, pushes: 1 },
      SHL: { pops: 2, pushes: 1 },
      SHR: { pops: 2, pushes: 1 },
      SAR: { pops: 2, pushes: 1 },

      // Bitwise operations (pop 1, push 1)
      NOT: { pops: 1, pushes: 1 },

      // Keccak (pop 2, push 1)
      SHA3: { pops: 2, pushes: 1 },

      // Environmental info (pop 0, push 1)
      ADDRESS: { pops: 0, pushes: 1 },
      ORIGIN: { pops: 0, pushes: 1 },
      CALLER: { pops: 0, pushes: 1 },
      CALLVALUE: { pops: 0, pushes: 1 },
      CALLDATASIZE: { pops: 0, pushes: 1 },
      CODESIZE: { pops: 0, pushes: 1 },
      GASPRICE: { pops: 0, pushes: 1 },
      RETURNDATASIZE: { pops: 0, pushes: 1 },
      SELFBALANCE: { pops: 0, pushes: 1 },
      BASEFEE: { pops: 0, pushes: 1 },

      // Environmental info (pop 1, push 1)
      BALANCE: { pops: 1, pushes: 1 },
      CALLDATALOAD: { pops: 1, pushes: 1 },
      EXTCODESIZE: { pops: 1, pushes: 1 },
      EXTCODEHASH: { pops: 1, pushes: 1 },

      // Environmental operations (pop 3, push 0)
      CALLDATACOPY: { pops: 3, pushes: 0 },
      CODECOPY: { pops: 3, pushes: 0 },
      RETURNDATACOPY: { pops: 3, pushes: 0 },

      // Environmental operations (pop 4, push 0)
      EXTCODECOPY: { pops: 4, pushes: 0 },

      // Block info (pop 0, push 1)
      BLOCKHASH: { pops: 1, pushes: 1 },
      COINBASE: { pops: 0, pushes: 1 },
      TIMESTAMP: { pops: 0, pushes: 1 },
      NUMBER: { pops: 0, pushes: 1 },
      DIFFICULTY: { pops: 0, pushes: 1 },
      GASLIMIT: { pops: 0, pushes: 1 },
      CHAINID: { pops: 0, pushes: 1 },

      // Stack operations
      POP: { pops: 1, pushes: 0 },
      PC: { pops: 0, pushes: 1 },
      MSIZE: { pops: 0, pushes: 1 },
      GAS: { pops: 0, pushes: 1 },
      JUMPDEST: { pops: 0, pushes: 0 },

      // Memory operations
      MLOAD: { pops: 1, pushes: 1 },
      MSTORE: { pops: 2, pushes: 0 },
      MSTORE8: { pops: 2, pushes: 0 },

      // Storage operations
      SLOAD: { pops: 1, pushes: 1 },
      SSTORE: { pops: 2, pushes: 0 },

      // Control flow
      JUMP: { pops: 1, pushes: 0 },
      JUMPI: { pops: 2, pushes: 0 },
      STOP: { pops: 0, pushes: 0 },

      // System operations
      RETURN: { pops: 2, pushes: 0 },
      REVERT: { pops: 2, pushes: 0 },
      SELFDESTRUCT: { pops: 1, pushes: 0 },
      INVALID: { pops: 0, pushes: 0 },

      // Call operations
      CALL: { pops: 7, pushes: 1 },
      DELEGATECALL: { pops: 6, pushes: 1 },
      STATICCALL: { pops: 6, pushes: 1 },
      CREATE: { pops: 3, pushes: 1 },
    };

    // Handle PUSH opcodes (PUSH1 through PUSH32)
    if (opcode.startsWith('PUSH')) {
      return { pops: 0, pushes: 1 };
    }

    // Handle DUP opcodes (DUP1 through DUP16)
    if (opcode.startsWith('DUP')) {
      return { pops: 0, pushes: 1 }; // Duplicates existing item
    }

    // Handle SWAP opcodes (SWAP1 through SWAP16)
    if (opcode.startsWith('SWAP')) {
      return { pops: 0, pushes: 0 }; // Swaps positions, no net change
    }

    // Handle LOG opcodes (LOG0 through LOG4)
    if (opcode.startsWith('LOG')) {
      const logNum = parseInt(opcode.slice(3)) || 0;
      return { pops: 2 + logNum, pushes: 0 }; // 2 + number of topics
    }

    // Return default or lookup from table
    return stackEffects[opcode] || { pops: 0, pushes: 0 };
  }

  /**
   * NEW: Get storage changes (simplified - would need before/after state)
   */
  private _getStorageChanges(ms: MachineState):
    | Array<{
        key: string;
        valueBefore: string;
        valueAfter: string;
      }>
    | undefined {
    // Check if we have storage state to compare
    if (!ms.storage.dump) {
      return undefined;
    }

    // For now, we return the current storage state as "changes"
    // In a full implementation, you'd want to track the previous state
    // and compare it with the current state to detect actual changes
    const changes: Array<{
      key: string;
      valueBefore: string;
      valueAfter: string;
    }> = [];

    // Parse storage dump if it exists
    try {
      // Storage dump format varies - this is a simplified approach
      // You'd need to adapt this based on your actual storage format
      if (typeof ms.storage.dump === 'string' && ms.storage.dump !== 'Empty') {
        // Assuming storage dump contains key-value pairs
        // This would need to be adapted to your actual storage format
        const storageEntries = ms.storage.dump.split('\n').filter((entry) => entry.trim());

        for (const entry of storageEntries) {
          // Parse storage entries (format may vary)
          const match = entry.match(/(\w+):\s*(\w+)/);
          if (match) {
            const [, key, value] = match;
            changes.push({
              key,
              valueBefore: '0x0', // Would need to track previous state
              valueAfter: value,
            });
          }
        }
      }
    } catch {
      // If parsing fails, return undefined
      return undefined;
    }

    return changes.length > 0 ? changes : undefined;
  }

  /**
   * NEW: Get the complete execution trace for visualization
   */
  getExecutionTrace(): ExecutionTrace {
    if (!this._trackExecution || !this._initialState) {
      throw new Error('Execution tracking not enabled or no initial state');
    }

    return {
      snapshots: this._executionTrace,
      initialState: {
        code: this._initialState.codeString,
        txData: {} as TxData, // You'd pass this from your EVM
        block: {} as Block, // You'd pass this from your EVM
        state: {}, // You'd pass this from your EVM
      },
      finalState: {
        success: true, // You'd determine this from execution result
        gasUsed: 0n, // Calculate from total gas used
        returnData: '',
        logs: [],
        modifiedStorage: {},
      },
      stats: {
        totalSteps: this._steps,
        uniqueInstructionsHit: new Set(this._executionTrace.map((s) => s.pc)).size,
        maxStackDepth: Math.max(...this._executionTrace.map((s) => s.stackBefore.length)),
        maxMemorySize: 0, // Calculate from snapshots
        loopIterations: this._calculateLoopIterations(),
      },
    };
  }

  /**
   * NEW: Calculate loop iterations for complexity analysis
   */
  private _calculateLoopIterations(): Record<number, number> {
    const pcCounts: Record<number, number> = {};

    for (const snapshot of this._executionTrace) {
      pcCounts[snapshot.pc] = (pcCounts[snapshot.pc] || 0) + 1;
    }

    // Filter to only instructions hit more than once (potential loops)
    return Object.fromEntries(Object.entries(pcCounts).filter(([, count]) => count > 1));
  }

  /**
   * NEW: Create a simplified execution summary for quick visualization
   */
  getExecutionSummary(): {
    totalSteps: number;
    uniqueInstructions: number;
    jumpTargets: number[];
    maxStackDepth: number;
    gasEstimate: bigint;
  } {
    const uniquePCs = new Set(this._executionTrace.map((s) => s.pc));
    const jumpTargets = this._executionTrace.filter((s) => s.opcode === 'JUMPDEST').map((s) => s.pc);

    return {
      totalSteps: this._steps,
      uniqueInstructions: uniquePCs.size,
      jumpTargets,
      maxStackDepth: Math.max(...this._executionTrace.map((s) => s.stackBefore.length)),
      gasEstimate: this._executionTrace.reduce((total, s) => total + s.gasRemaining, 0n),
    };
  }

  /**
   * NEW: Export execution data for visualization tools
   */
  exportForVisualization(): {
    trace: ExecutionTrace;
    summary: ReturnType<Logger['getExecutionSummary']>;
    rawLogs: string;
  } {
    return {
      trace: this.getExecutionTrace(),
      summary: this.getExecutionSummary(),
      rawLogs: this.output,
    };
  }

  /**
   * Logs an error that occurred during execution
   * @param err - Error message or object
   */
  error(err: string) {
    this._output.push(`******************** ERROR ********************`);
    this._output.push(``);
    this._output.push(`Runtime Error encountered: ${err}`);
    this._output.push(``);

    // NEW: Add error to current execution snapshot if tracking
    if (this._trackExecution && this._executionTrace.length > 0) {
      const lastSnapshot = this._executionTrace[this._executionTrace.length - 1];
      lastSnapshot.error = err;
    }
  }

  /**
   * Logs a notification message (e.g., subcall start/end)
   * @param message - Notification message to log
   */
  notify(message: string) {
    this._output.push(`******************** NOTIFICATION ********************`);
    this._output.push(``);
    this._output.push(`${message}`);
    this._output.push(``);
  }

  /**
   * Gets the complete log output as a formatted string
   * @returns All logged messages joined with newlines
   */
  get output() {
    return this._output.join('\n');
  }

  /**
   * Gets the current step count
   */
  get stepCount() {
    return this._steps;
  }

  /**
   * NEW: Reset logger state for new execution
   */
  reset() {
    this._steps = 0;
    this._output = [];
    this._executionTrace = [];
    this._initialState = undefined;
    this._previousState = undefined;
  }

  /**
   * Saves the log output to a file in the logs directory
   * @param filename - Optional custom filename (defaults to timestamp-based name)
   * @returns Path to the saved file, or empty string if save failed
   */
  saveToFile(filename?: string): string {
    try {
      if (!filename) filename = `execution-${Date.now()}`;

      if (!fs.existsSync(path.join(__dirname, '../logs'))) fs.mkdirSync(path.join(__dirname, '../logs'));

      const filepath = path.join(__dirname, `../logs/${filename}.log`);
      fs.writeFileSync(filepath, this.output);
      return filepath;
    } catch (err) {
      console.error('Error while saving logs to file: ', err);
      return '';
    }
  }

  /**
   * NEW: Save execution trace as JSON for visualization tools
   */
  saveTraceToFile(filename?: string): string {
    if (!this._trackExecution) {
      throw new Error('Execution tracking not enabled');
    }

    try {
      if (!filename) filename = `trace-${Date.now()}`;

      if (!fs.existsSync(path.join(__dirname, '../logs'))) fs.mkdirSync(path.join(__dirname, '../logs'));

      const filepath = path.join(__dirname, `../logs/${filename}.json`);
      const traceData = this.exportForVisualization();

      fs.writeFileSync(filepath, JSON.stringify(traceData, null, 2));
      return filepath;
    } catch (err) {
      console.error('Error while saving trace to file: ', err);
      return '';
    }
  }
}
