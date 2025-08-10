import { buildBlock, buildState, buildTxData } from './utils';
import { CALL, CALL_OR_CREATE, MAX_256_BITS, STATIC_DISALLOWED } from './constants';
import runners from './opcodes/runners';
import ERRORS from './errors';

import GlobalState from './globalState';
import Logger from './logger';

import Stack from './machine-state/stack';
import Memory from './machine-state/memory';
import Storage from './machine-state/storage';

import type { EVMOpts, EvmRuntimeParams } from './types';
import type { MachineState } from './machine-state/types';
import { CallOrCreateRunner, SimpleRunner } from './opcodes/types';
import { extractFunctionSelectors } from '../../lib/utils/bytecode';

export default class EVM {
  private readonly debug: boolean;
  private readonly saveLogs: boolean;
  private readonly logger: Logger;
  private _depth: number;

  /**
   * Initializes a new EVM instance with configuration options
   * @param options - Configuration options for the EVM including debug and logging settings
   */
  constructor(options: EVMOpts) {
    this.debug = options.debug ?? false;
    this.saveLogs = options.saveLogs ?? false;
    this.logger = new Logger();
    this._depth = 0;
  }

  /**
   * Starts EVM execution with the provided runtime parameters
   * Initializes machine state and begins bytecode execution
   * @param params - Runtime parameters including bytecode, state, transaction data, and block info
   * @returns Promise resolving to execution result with success status, stack, return data, and logs
   */
  public async start(params: Partial<EvmRuntimeParams>) {
    if (!params._code) throw new Error(ERRORS.NO_CODE_PROVIDED);

    // build default state objects if not provided in params
    if (!params._globalState) params._globalState = buildState();
    if (!params._txData) params._txData = buildTxData();
    if (!params._block) params._block = buildBlock();

    const ms: MachineState = {
      globalState: new GlobalState(params._globalState),
      storage: new Storage(),
      memory: new Memory(),
      stack: new Stack(),
      returnData: Buffer.alloc(0),
      gasAvailable: MAX_256_BITS - 1n, // todo
      txData: params._txData,
      block: params._block,
      code: params._code,
      static: false,
      logs: [],
      pc: 0,
      codeString: params._codeString || '',
    };

    this.logger.start(params._code, params._asm);

    return await this.run(ms);
  }

  /**
   * Executes bytecode instructions sequentially until completion or error
   * Handles both main execution and subcalls with proper depth tracking
   * @param ms - Machine state containing all execution context
   * @param isSubCall - Whether this is a subcall (CALL, CREATE, etc.) or main execution
   * @returns Promise resolving to execution result
   */
  public async run(ms: MachineState, isSubCall = false) {
    let success = false;
    let reverted = false;

    if (isSubCall) {
      this._depth++;
      this.logger.notify(`Starting subcall. Depth: ${this._depth}`);
    }

    // execute opcodes sequentially
    while (ms.pc < ms.code.length) {
      try {
        this.logger.step(ms);
        const opcode = ms.code[ms.pc];

        if (ms.static) {
          // throw if opcode is not allowed in static context
          if (STATIC_DISALLOWED.includes(opcode)) throw new Error(ERRORS.REVERT);
          if (opcode === CALL && ms.txData.value !== 0n) throw new Error(ERRORS.REVERT);
        }

        await this.execute(ms);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.logger.error(err);

        if (err.message === ERRORS.REVERT) reverted = true;
        if (err.message === ERRORS.STOP) success = true;

        break;
      }
    }

    if (isSubCall) {
      if (this._depth === 0) throw new Error(ERRORS.INVALID_CALL_DEPTH);
      this._depth--;

      if (!reverted) {
        this.logger.notify(`Subcall completed without REVERT. Depth: ${this._depth}`);
        success = true;
      }
    }

    if (this.debug) console.log(this.logger.output);
    if (this.saveLogs) this.logger.saveToFile();

    const selectors = extractFunctionSelectors(ms.codeString);

    const result = {
      success,
      stack: ms.stack.dump,
      return: ms.returnData.toString('hex'),
      logs: ms.logs,
      globalState: ms.globalState,
      selectors,
    };

    return result;
  }

  /**
   * Execute a single opcode and update the machine state
   * Handles both simple opcodes and special CALL/CREATE instructions
   * @param ms - Machine state to execute against
   */
  private async execute(ms: MachineState): Promise<void> {
    const opcode = ms.code[ms.pc];
    const runner = runners[opcode]?.runner;
    if (!runner) throw new Error(ERRORS.OPCODE_NOT_IMPLEMENTED);

    // Handle special cases for CALL and CREATE instructions
    if (CALL_OR_CREATE.includes(opcode)) await (runner as CallOrCreateRunner)(ms, this);
    else await (runner as SimpleRunner)(ms);

    ms.pc++;
  }
}
