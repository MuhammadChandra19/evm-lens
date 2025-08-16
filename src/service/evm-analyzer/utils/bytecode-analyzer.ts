import { keccak256 } from "ethereum-cryptography/keccak";
import {
  FunctionInfo,
  EventInfo,
  ContractAnalysis,
  ABIItem,
  ABIFunction,
  ABIEvent,
  ABIConstructor,
  ContractMetadata,
  EnhancedContractAnalysis,
} from "../types";

export class BytecodeAnalyzer {
  // Common ERC-20 function selectors
  private static readonly KNOWN_SELECTORS: Record<string, FunctionInfo> = {
    "0x06fdde03": {
      selector: "0x06fdde03",
      signature: "name()",
      name: "name",
      inputs: [],
      outputs: [{ name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    "0x95d89b41": {
      selector: "0x95d89b41",
      signature: "symbol()",
      name: "symbol",
      inputs: [],
      outputs: [{ name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    "0x313ce567": {
      selector: "0x313ce567",
      signature: "decimals()",
      name: "decimals",
      inputs: [],
      outputs: [{ name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    "0x18160ddd": {
      selector: "0x18160ddd",
      signature: "totalSupply()",
      name: "totalSupply",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    "0x70a08231": {
      selector: "0x70a08231",
      signature: "balanceOf(address)",
      name: "balanceOf",
      inputs: [{ name: "account", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    "0xa9059cbb": {
      selector: "0xa9059cbb",
      signature: "transfer(address,uint256)",
      name: "transfer",
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    "0x23b872dd": {
      selector: "0x23b872dd",
      signature: "transferFrom(address,address,uint256)",
      name: "transferFrom",
      inputs: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    "0x095ea7b3": {
      selector: "0x095ea7b3",
      signature: "approve(address,uint256)",
      name: "approve",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    "0xdd62ed3e": {
      selector: "0xdd62ed3e",
      signature: "allowance(address,address)",
      name: "allowance",
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
      ],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    "0x40c10f19": {
      selector: "0x40c10f19",
      signature: "mint(address,uint256)",
      name: "mint",
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    "0x42966c68": {
      selector: "0x42966c68",
      signature: "burn(uint256)",
      name: "burn",
      inputs: [{ name: "amount", type: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  };

  // Common event signatures
  private static readonly KNOWN_EVENTS: Record<string, EventInfo> = {
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
      hash: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      signature: "Transfer(address,address,uint256)",
      name: "Transfer",
      inputs: [
        { name: "from", type: "address", indexed: true },
        { name: "to", type: "address", indexed: true },
        { name: "value", type: "uint256", indexed: false },
      ],
    },
    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
      hash: "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
      signature: "Approval(address,address,uint256)",
      name: "Approval",
      inputs: [
        { name: "owner", type: "address", indexed: true },
        { name: "spender", type: "address", indexed: true },
        { name: "value", type: "uint256", indexed: false },
      ],
    },
  };

  static analyzeBytecode(bytecode: string): ContractAnalysis {
    const cleanBytecode = bytecode.startsWith("0x")
      ? bytecode.slice(2)
      : bytecode;
    const functions: FunctionInfo[] = [];
    const events: EventInfo[] = [];

    // Extract function selectors from bytecode
    const selectors = this.extractFunctionSelectors(cleanBytecode);

    // Match selectors with known functions
    for (const selector of selectors) {
      const known = this.KNOWN_SELECTORS[selector];
      if (known) {
        functions.push(known);
      } else {
        // Unknown function
        functions.push({
          selector,
          name: `unknown_${selector.slice(2, 10)}`,
          type: "function",
          inputs: [],
          outputs: [],
        });
      }
    }

    // Extract event signatures
    const eventSigs = this.extractEventSignatures(cleanBytecode);
    for (const sig of eventSigs) {
      const known = this.KNOWN_EVENTS[sig];
      if (known) {
        events.push(known);
      }
    }

    return {
      functions,
      events,
      constructor: this.detectConstructor(cleanBytecode),
      fallback: this.detectFallback(cleanBytecode),
      receive: this.detectReceive(cleanBytecode),
    };
  }

  private static extractFunctionSelectors(bytecode: string): string[] {
    const selectors = new Set<string>();

    // Look for PUSH4 followed by function selector patterns
    // Pattern: 63xxxxxxxx (PUSH4 with 4-byte selector)
    const push4Pattern = /63([0-9a-fA-F]{8})/g;
    let match;

    while ((match = push4Pattern.exec(bytecode)) !== null) {
      const selector = "0x" + match[1].toLowerCase();
      selectors.add(selector);
    }

    // Also look for direct comparisons with selectors
    // Pattern: 80630xxxxxxxx14 (DUP1 PUSH4 selector EQ)
    const directPattern = /80630([0-9a-fA-F]{8})14/g;
    while ((match = directPattern.exec(bytecode)) !== null) {
      const selector = "0x" + match[1].toLowerCase();
      selectors.add(selector);
    }

    return Array.from(selectors);
  }

  private static extractEventSignatures(bytecode: string): string[] {
    const signatures = new Set<string>();

    // Look for LOG opcodes followed by topic hashes
    // Events typically use LOG1, LOG2, LOG3, LOG4 (opcodes a1, a2, a3, a4)
    const logPattern = /7f([0-9a-fA-F]{64})/g;
    let match;

    while ((match = logPattern.exec(bytecode)) !== null) {
      const sig = "0x" + match[1].toLowerCase();
      signatures.add(sig);
    }

    return Array.from(signatures);
  }

  private static detectConstructor(bytecode: string): FunctionInfo | undefined {
    // Constructor is typically at the beginning of the bytecode
    if (bytecode.length > 100) {
      return {
        selector: "0x",
        name: "constructor",
        type: "constructor",
        inputs: [],
        outputs: [],
      };
    }
    return undefined;
  }

  private static detectFallback(bytecode: string): FunctionInfo | undefined {
    // Look for fallback function patterns (usually at the end)
    if (bytecode.includes("fd")) {
      // REVERT opcode often in fallback
      return {
        selector: "0x",
        name: "fallback",
        type: "fallback",
        inputs: [],
        outputs: [],
      };
    }
    return undefined;
  }

  private static detectReceive(bytecode: string): FunctionInfo | undefined {
    // Look for receive function patterns
    if (bytecode.includes("34")) {
      // CALLVALUE opcode
      return {
        selector: "0x",
        name: "receive",
        type: "receive",
        inputs: [],
        outputs: [],
      };
    }
    return undefined;
  }

  // Generate function selector from signature
  static generateSelector(signature: string): string {
    const hash = keccak256(Buffer.from(signature, "utf8"));
    return "0x" + Buffer.from(hash.slice(0, 4)).toString("hex");
  }

  // Try to reverse engineer function signature from selector
  static guessFunctionSignature(selector: string): string {
    const known = this.KNOWN_SELECTORS[selector.toLowerCase()];
    return known?.signature || `unknown_${selector.slice(2)}()`;
  }

  /**
   * Analyze contract using ABI metadata (more accurate than bytecode analysis)
   */
  static analyzeFromABI(abi: ABIItem[]): ContractAnalysis {
    const functions: FunctionInfo[] = [];
    const events: EventInfo[] = [];
    let constructor: FunctionInfo | undefined;

    for (const item of abi) {
      if (item.type === "function") {
        const signature = this.generateFunctionSignature(item);
        const selector = this.generateSelector(signature);

        functions.push({
          selector,
          signature,
          name: item.name,
          inputs: item.inputs.map((input) => ({
            name: input.name,
            type: input.type,
            internalType: input.internalType,
          })),
          outputs: item.outputs.map((output) => ({
            name: output.name,
            type: output.type,
            internalType: output.internalType,
          })),
          stateMutability: item.stateMutability,
          type: "function",
        });
      } else if (item.type === "event") {
        const signature = this.generateEventSignature(item);
        const hash = this.generateEventHash(signature);

        events.push({
          signature,
          name: item.name,
          hash,
          inputs: item.inputs.map((input) => ({
            name: input.name,
            type: input.type,
            indexed: input.indexed || false,
            internalType: input.internalType,
          })),
        });
      } else if (item.type === "constructor") {
        constructor = {
          selector: "0x",
          signature: this.generateConstructorSignature(item),
          name: "constructor",
          inputs: item.inputs.map((input) => ({
            name: input.name,
            type: input.type,
            internalType: input.internalType,
          })),
          outputs: [],
          stateMutability: item.stateMutability,
          type: "constructor",
        };
      }
    }

    return {
      functions,
      events,
      constructor,
      fallback: undefined,
      receive: undefined,
    };
  }

  /**
   * Enhanced analysis that combines ABI data with bytecode analysis
   */
  static analyzeWithMetadata(
    bytecode: string,
    metadata?: ContractMetadata,
  ): EnhancedContractAnalysis {
    let analysis: ContractAnalysis;
    let abiDerived = false;

    if (metadata?.output?.abi) {
      // Use ABI for accurate analysis
      analysis = this.analyzeFromABI(metadata.output.abi);
      abiDerived = true;

      // Still check bytecode for fallback/receive functions
      const bytecodeAnalysis = this.analyzeBytecode(bytecode);
      analysis.fallback = bytecodeAnalysis.fallback;
      analysis.receive = bytecodeAnalysis.receive;
    } else {
      // Fall back to bytecode analysis
      analysis = this.analyzeBytecode(bytecode);
    }

    return {
      ...analysis,
      metadata,
      abiDerived,
    };
  }

  // Helper methods for generating signatures
  private static generateFunctionSignature(func: ABIFunction): string {
    const inputs = func.inputs.map((input) => input.type).join(",");
    return `${func.name}(${inputs})`;
  }

  private static generateEventSignature(event: ABIEvent): string {
    const inputs = event.inputs.map((input) => input.type).join(",");
    return `${event.name}(${inputs})`;
  }

  private static generateConstructorSignature(
    constructor: ABIConstructor,
  ): string {
    const inputs = constructor.inputs.map((input) => input.type).join(",");
    return `constructor(${inputs})`;
  }

  private static generateEventHash(signature: string): string {
    const hash = keccak256(Buffer.from(signature, "utf8"));
    return "0x" + Buffer.from(hash).toString("hex");
  }
}
