import { InterpreterStep } from '@ethereumjs/evm';
import { ExecutionStep, TraceOptions } from '../types';

export class ExecutionTracer {
  private steps: ExecutionStep[] = [];
  private options: TraceOptions;

  constructor(options: TraceOptions = {}) {
    this.options = {
      includeMemory: true,
      includeStack: true,
      includeStorage: true,
      maxSteps: 10000,
      breakOnError: true,
      ...options,
    };
  }

  createStepHandler() {
    return (snapshot: InterpreterStep) => {
      if (this.options.maxSteps && this.steps.length >= this.options.maxSteps) {
        return;
      }

      const step: ExecutionStep = {
        opcode: snapshot.opcode,
        pc: snapshot.pc,
        gasLeft: snapshot.gasLeft,
        gasRefund: snapshot.gasRefund,
        depth: snapshot.depth,
        memory: this.options.includeMemory ? snapshot.memory : new Uint8Array(0),
        stack: this.options.includeStack ? [...snapshot.stack] : [],
        storage: this.options.includeStorage ? snapshot.storage || [] : [],
      };

      this.steps.push(step);
    };
  }

  getSteps(): ExecutionStep[] {
    return [...this.steps];
  }

  reset(): void {
    this.steps = [];
  }

  getStepCount(): number {
    return this.steps.length;
  }

  getStepByIndex(index: number): ExecutionStep | undefined {
    return this.steps[index];
  }

  getStepsInRange(start: number, end: number): ExecutionStep[] {
    return this.steps.slice(start, end);
  }
}
