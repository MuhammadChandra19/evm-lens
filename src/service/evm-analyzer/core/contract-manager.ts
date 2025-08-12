import { Address } from '@ethereumjs/util';
import { parsers } from '../../evm/opcodes/utils';
import { EVMManager } from './evm-manager';
import { StateManagerService } from './state-manager';
import { ExecutionTracer } from './execution-tracer';
import { DeploymentResult, CallResult, TxData, TraceOptions, ExecutionStep } from '../types';

export class ContractManager {
  constructor(private evmManager: EVMManager, private stateManager: StateManagerService) {}

  async deployContract(bytecode: string, options: TraceOptions = {}): Promise<DeploymentResult> {
    const tracer = new ExecutionTracer(options);
    const stepHandler = tracer.createStepHandler();
    const evm = this.evmManager.getEVM();

    evm.events.on('step', stepHandler);

    try {
      const result = await evm.runCode({
        code: parsers.hexStringToUint8Array(bytecode),
      });

      evm.events.off('step', stepHandler);

      return {
        contractAddress: '', // Would need proper address generation
        gasUsed: result.executionGasUsed,
        success: !result.exceptionError,
        returnValue: result.returnValue,
      };
    } catch (error) {
      evm.events.off('step', stepHandler);
      throw error;
    }
  }

  async deployContractToAddress(address: string, runtimeBytecode: string): Promise<void> {
    await this.stateManager.createAccount(address);
    await this.stateManager.setCode(address, parsers.hexStringToUint8Array(runtimeBytecode));
  }

  async callContract(txData: TxData, options: TraceOptions = {}): Promise<CallResult & { steps: ExecutionStep[] }> {
    const tracer = new ExecutionTracer(options);
    const stepHandler = tracer.createStepHandler();
    const evm = this.evmManager.getEVM();

    evm.events.on('step', stepHandler);

    try {
      const fromAddr = new Address(Buffer.from(txData.from.startsWith('0x') ? txData.from.slice(2) : txData.from, 'hex'));
      const toAddr = new Address(Buffer.from(txData.to.startsWith('0x') ? txData.to.slice(2) : txData.to, 'hex'));

      const result = await evm.runCall({
        to: toAddr,
        caller: fromAddr,
        origin: fromAddr,
        value: txData.value,
        data: parsers.hexStringToUint8Array(txData.data),
        gasLimit: txData.gasLimit,
      });

      evm.events.off('step', stepHandler);

      return {
        success: !result.execResult.exceptionError,
        returnValue: result.execResult.returnValue,
        gasUsed: result.execResult.executionGasUsed,
        gasRefund: result.execResult.gasRefund || 0n,
        logs: result.execResult.logs || [],
        error: result.execResult.exceptionError?.error,
        steps: tracer.getSteps(),
      };
    } catch (error) {
      evm.events.off('step', stepHandler);
      throw error;
    }
  }
}
