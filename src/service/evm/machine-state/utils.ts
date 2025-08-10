import Memory from "./memory"
import Stack from "./stack"

import type { MachineState } from "./types"

/**
 * Creates a fresh execution context with new stack, memory, and reset program counter
 * Used when creating subcalls (CALL, CREATE, etc.) that need isolated execution state
 * @returns Partial machine state with fresh stack, memory, and PC set to 0
 */
export function freshExecutionContext(): Partial<MachineState> {
  return {
    stack: new Stack(),
    memory: new Memory(),
    pc: 0,
  }
}
