import { Address } from "@ethereumjs/util";
import { parsers } from "../../evm/opcodes/utils";
import { EVMManager } from "./evm-manager";
import { StateManagerService } from "./state-manager";
import { ExecutionTracer } from "./execution-tracer";
import {
  DeploymentResult,
  CallResult,
  TxData,
  TraceOptions,
  ExecutionStep,
} from "../types";

export class ContractManager {
  constructor(
    private evmManager: EVMManager,
    private stateManager: StateManagerService,
  ) {}

  /**
   * Deploy a contract to the EVM
   * @param fromAddress - The deployer address
   * @param bytecode - The contract bytecode (including constructor)
   * @param contractAddress - The target contract address
   * @param options - Tracing options
   * @returns Deployment result
   */
  async deployContract(
    fromAddress: Address,
    bytecode: string,
    contractAddress: Address,
    options: TraceOptions = {},
  ): Promise<DeploymentResult> {
    const tracer = new ExecutionTracer(options);
    const stepHandler = tracer.createStepHandler();
    const evm = this.evmManager.getEVM();

    evm.events.on("step", stepHandler);

    try {
      // Create the contract account first
      await this.stateManager.createAccount(contractAddress);

      // Set the full bytecode (including constructor) to the contract address temporarily
      await this.stateManager.setCode(
        contractAddress,
        parsers.hexStringToUint8Array(bytecode),
      );

      // Use addresses directly
      const fromAddr = fromAddress;
      const toAddr = contractAddress;

      // Execute constructor by calling the contract with empty data (constructor execution)
      const result = await evm.runCall({
        to: toAddr, // Target contract address
        caller: fromAddr,
        origin: fromAddr,
        value: 0n,
        data: new Uint8Array(0), // Empty data triggers constructor
        gasLimit: BigInt(3000000),
      });

      evm.events.off("step", stepHandler);

      // Extract runtime bytecode from the full bytecode (after constructor execution)
      // The runtime bytecode starts after the constructor code
      const runtimeStart = bytecode.indexOf("6080604052600436");
      const runtimeBytecode = bytecode.slice(runtimeStart);

      // Set the runtime bytecode to the contract address (replace constructor bytecode)
      await this.stateManager.setCode(
        contractAddress,
        parsers.hexStringToUint8Array(runtimeBytecode),
      );

      return {
        contractAddress: contractAddress,
        gasUsed: result.execResult.executionGasUsed,
        success: !result.execResult.exceptionError,
        returnValue: parsers.hexStringToUint8Array(runtimeBytecode),
        steps: tracer.getSteps(),
        executionResult: result.execResult
      };
    } catch (error) {
      evm.events.off("step", stepHandler);
      throw error;
    }
  }

  async callContract(
    txData: TxData,
    options: TraceOptions = {},
  ): Promise<CallResult & { steps: ExecutionStep[] }> {
    const tracer = new ExecutionTracer(options);
    const stepHandler = tracer.createStepHandler();
    const evm = this.evmManager.getEVM();

    evm.events.on("step", stepHandler);

    try {
      const fromAddr = txData.from;
      let toAddr: Address | undefined;
      if (txData.to) {
        toAddr = txData.to;
      }

      // console.log("parsers", parsers.hexStringToUint8Array(txData.data))

      const result = await evm.runCall({
        to: toAddr,
        caller: fromAddr,
        origin: fromAddr,
        value: txData.value,
        data: parsers.hexStringToUint8Array(txData.data),
        gasLimit: txData.gasLimit,
      });

      evm.events.off("step", stepHandler);
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
      console.error(error)
      evm.events.off("step", stepHandler);
      throw error;
    }
  }
}
