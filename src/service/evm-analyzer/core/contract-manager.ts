import { Address } from "@ethereumjs/util";
import { parsers } from "../../evm/opcodes/utils";
import { EVMManager } from "./evm-manager";
import { StateManagerService } from "./state-manager";
import { ExecutionTracer } from "./execution-tracer";
import { BytecodeAnalyzer } from "../utils/bytecode-analyzer";
import {
  DeploymentResult,
  CallResult,
  TxData,
  TraceOptions,
  ExecutionStep,
  ContractAnalysis,
  ContractInfo,
} from "../types";

export class ContractManager {
  constructor(
    private evmManager: EVMManager,
    private stateManager: StateManagerService,
  ) {}

  async deployContract(
    fromAddress: string,
    bytecode: string,
    contractAddress: string,
    options: TraceOptions = {},
  ): Promise<DeploymentResult & { analysis: ContractAnalysis }> {
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

      // Create addresses
      const fromAddr = new Address(
        Buffer.from(
          fromAddress.startsWith("0x") ? fromAddress.slice(2) : fromAddress,
          "hex",
        ),
      );
      const toAddr = new Address(
        Buffer.from(
          contractAddress.startsWith("0x")
            ? contractAddress.slice(2)
            : contractAddress,
          "hex",
        ),
      );

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

      // Analyze the deployed bytecode (runtime code)
      const analysis = BytecodeAnalyzer.analyzeBytecode(
        "0x" + Buffer.from(runtimeBytecode).toString("hex"),
      );

      return {
        contractAddress,
        gasUsed: result.execResult.executionGasUsed,
        success: !result.execResult.exceptionError,
        returnValue: parsers.hexStringToUint8Array(runtimeBytecode),
        analysis,
        steps: tracer.getSteps(),
      };
    } catch (error) {
      evm.events.off("step", stepHandler);
      throw error;
    }
  }

  async deployContractToAddress(
    address: string,
    runtimeBytecode: string,
  ): Promise<{ analysis: ContractAnalysis }> {
    await this.stateManager.createAccount(address);
    await this.stateManager.setCode(
      address,
      parsers.hexStringToUint8Array(runtimeBytecode),
    );

    // Analyze the deployed contract
    const analysis = BytecodeAnalyzer.analyzeBytecode(runtimeBytecode);

    return { analysis };
  }

  async analyzeContract(
    address: string,
  ): Promise<ContractInfo & { analysis: ContractAnalysis }> {
    const code = await this.stateManager.getCode(address);
    const accountInfo = await this.stateManager.getAccountInfo(address);

    if (!code || code.length === 0) {
      throw new Error("No contract code found at address");
    }

    const bytecodeHex = "0x" + Buffer.from(code).toString("hex");
    const analysis = BytecodeAnalyzer.analyzeBytecode(bytecodeHex);

    return {
      address,
      code,
      codeSize: code.length,
      balance: accountInfo?.balance || 0n,
      nonce: accountInfo?.nonce || 0n,
      analysis,
    };
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
      const fromAddr = new Address(
        Buffer.from(
          txData.from.startsWith("0x") ? txData.from.slice(2) : txData.from,
          "hex",
        ),
      );
      let toAddr: Address | undefined;
      if (txData.to) {
        toAddr = new Address(
          Buffer.from(
            txData.to.startsWith("0x") ? txData.to.slice(2) : txData.to,
            "hex",
          ),
        );
      }

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
      evm.events.off("step", stepHandler);
      throw error;
    }
  }

  // Helper method to get function info by selector
  getFunctionBySelector(analysis: ContractAnalysis, selector: string) {
    return analysis.functions.find(
      (f) => f.selector.toLowerCase() === selector.toLowerCase(),
    );
  }

  // Helper method to detect token type
  detectTokenStandard(
    analysis: ContractAnalysis,
  ): "ERC20" | "ERC721" | "ERC1155" | "Unknown" {
    const functionNames = analysis.functions.map((f) => f.name);

    // Check for ERC20
    const erc20Functions = [
      "transfer",
      "transferFrom",
      "approve",
      "totalSupply",
      "balanceOf",
      "allowance",
    ];
    const hasErc20 = erc20Functions.every((fn) => functionNames.includes(fn));

    if (hasErc20) return "ERC20";

    // Check for ERC721
    const erc721Functions = [
      "safeTransferFrom",
      "transferFrom",
      "approve",
      "setApprovalForAll",
    ];
    const hasErc721 = erc721Functions.some((fn) => functionNames.includes(fn));

    if (hasErc721) return "ERC721";

    // Check for ERC1155
    if (
      functionNames.includes("safeTransferFrom") &&
      functionNames.includes("safeBatchTransferFrom")
    ) {
      return "ERC1155";
    }

    return "Unknown";
  }
}
