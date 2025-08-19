import { AbiSchema } from "./schema";
import { Abi, AbiEvent, AbiFunction } from "./types";

export class AbiValidator {
  private abi: Abi;

  constructor(abi: unknown) {
    this.abi = AbiSchema.parse(abi);
  }

  // Get all functions from the ABI
  getFunctions(): AbiFunction[] {
    return this.abi.filter(
      (entry): entry is AbiFunction => entry.type === "function",
    );
  }

  getWriteFunctions(): AbiFunction[] {
    return this.abi.filter(
      (entry): entry is AbiFunction => entry.type === "function" && entry.stateMutability !== "view"
    )
  }

  getReadFunctions(): AbiFunction[] {
    return this.abi.filter(
      (entry): entry is AbiFunction => entry.type === "function" && entry.stateMutability === "view"
    )
  }

  // Get all events from the ABI
  getEvents(): AbiEvent[] {
    return this.abi.filter(
      (entry): entry is AbiEvent => entry.type === "event",
    );
  }

  // Get a specific function by name
  getFunction(name: string): AbiFunction | undefined {
    return this.getFunctions().find((fn) => fn.name === name);
  }

  // Get a specific event by name
  getEvent(name: string): AbiEvent | undefined {
    return this.getEvents().find((event) => event.name === name);
  }

  // Validate function call parameters
  validateFunctionInputs(functionName: string, inputs: unknown[]): boolean {
    const func = this.getFunction(functionName);
    if (!func) return false;

    if (inputs.length !== func.inputs.length) return false;

    // Additional type checking could be implemented here
    // based on the parameter types
    return true;
  }

  // Get payable functions
  getPayableFunctions(): AbiFunction[] {
    return this.getFunctions().filter((fn) => fn.stateMutability === "payable");
  }

  // Get view/pure functions
  getViewFunctions(): AbiFunction[] {
    return this.getFunctions().filter(
      (fn) => fn.stateMutability === "view" || fn.stateMutability === "pure",
    );
  }

  // Get the raw validated ABI
  getAbi(): Abi {
    return this.abi;
  }
}
