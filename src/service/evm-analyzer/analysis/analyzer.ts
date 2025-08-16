import { ExecutionStep, AnalysisResult } from "../types";

export class ExecutionAnalyzer {
  static analyze(steps: ExecutionStep[]): AnalysisResult {
    const opcodeFrequency: Record<string, number> = {};
    let maxStackDepth = 0;
    let memoryAccesses = 0;
    let storageAccesses = 0;
    const jumps: Array<{ from: number; to: number }> = [];
    const errors: string[] = [];
    let totalGasUsed = 0n;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const opcodeName = step.opcode.name;

      // Count opcode frequency
      opcodeFrequency[opcodeName] = (opcodeFrequency[opcodeName] || 0) + 1;

      // Track max stack depth
      maxStackDepth = Math.max(maxStackDepth, step.stack.length);

      // Count memory accesses
      if (this.isMemoryOpcode(opcodeName)) {
        memoryAccesses++;
      }

      // Count storage accesses
      if (this.isStorageOpcode(opcodeName)) {
        storageAccesses++;
      }

      // Track jumps
      if (opcodeName === "JUMP" || opcodeName === "JUMPI") {
        const target = step.stack[step.stack.length - 1];
        jumps.push({ from: step.pc, to: Number(target) });
      }

      // Calculate gas used
      if (i === 0) {
        totalGasUsed = step.gasLeft;
      } else if (i === steps.length - 1) {
        totalGasUsed = totalGasUsed - step.gasLeft;
      }
    }

    return {
      totalGasUsed,
      opcodeFrequency,
      maxStackDepth,
      memoryAccesses,
      storageAccesses,
      jumps,
      errors,
      steps,
    };
  }

  private static isMemoryOpcode(opcode: string): boolean {
    return [
      "MLOAD",
      "MSTORE",
      "MSTORE8",
      "CALLDATACOPY",
      "CODECOPY",
      "RETURNDATACOPY",
    ].includes(opcode);
  }

  private static isStorageOpcode(opcode: string): boolean {
    return ["SLOAD", "SSTORE"].includes(opcode);
  }

  static getGasEfficiency(steps: ExecutionStep[]): number {
    if (steps.length === 0) return 0;

    const totalGas = steps[0].gasLeft - steps[steps.length - 1].gasLeft;
    const effectiveOpcodes = steps.filter(
      (s) => !["JUMPDEST", "POP"].includes(s.opcode.name),
    ).length;

    return effectiveOpcodes / Number(totalGas);
  }
}
