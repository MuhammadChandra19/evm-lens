import { ExecutionStep } from '../types';

export interface FlowNode {
  id: string;
  type: 'instruction' | 'jump' | 'jumpdest' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    opcode: string;
    pc: number;
    gasLeft: string;
    stackTop?: string;
    visitCount: number;
    isRevisited: boolean;
    memorySize: number;
    storageChanges: number;
  };
  style?: {
    backgroundColor?: string;
    border?: string;
    borderWidth?: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'step' | 'jump' | 'revisit';
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  label?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  metadata: {
    totalSteps: number;
    totalGasUsed: string;
    jumpCount: number;
    revisitedNodes: number;
    maxStackDepth: number;
    storageOperations: number;
  };
}

export class EVMFlowParser {
  private visitCounts: Map<number, number> = new Map();
  private nodePositions: Map<number, { x: number; y: number }> = new Map();
  // private edgeId = 0;

  parseSteps(steps: ExecutionStep[]): FlowData {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    let jumpCount = 0;
    let maxStackDepth = 0;
    let storageOperations = 0;
    
    // First pass: count visits to each PC and gather metadata
    this.countVisits(steps);
    
    // Second pass: create nodes and edges
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const nextStep = steps[i + 1];
      
      // Track metadata
      maxStackDepth = Math.max(maxStackDepth, step.stack.length);
      if (step.opcode.name === 'SSTORE' || step.opcode.name === 'SLOAD') {
        storageOperations++;
      }
      
      // Create node
      const node = this.createNode(step, i);
      nodes.push(node);
      
      // Create edge to next step
      if (nextStep) {
        const edge = this.createEdge(step, nextStep, i);
        if (edge) {
          edges.push(edge);
          if (step.opcode.name === 'JUMP') {
            jumpCount++;
          }
        }
      }
    }

    const revisitedNodes = Array.from(this.visitCounts.values()).filter(count => count > 1).length;
    const totalGasUsed = steps.length > 0 ? 
      (steps[0].gasLeft - steps[steps.length - 1].gasLeft).toString() : '0';
    
    return {
      nodes,
      edges,
      metadata: {
        totalSteps: steps.length,
        totalGasUsed,
        jumpCount,
        revisitedNodes,
        maxStackDepth,
        storageOperations
      }
    };
  }

  private countVisits(steps: ExecutionStep[]): void {
    for (const step of steps) {
      const count = this.visitCounts.get(step.pc) || 0;
      this.visitCounts.set(step.pc, count + 1);
    }
  }

  private createNode(step: ExecutionStep, stepIndex: number): FlowNode {
    const visitCount = this.visitCounts.get(step.pc) || 1;
    const isRevisited = visitCount > 1;
    const position = this.getNodePosition(step.pc, stepIndex);

    // Node styling based on opcode type and visit count
    const style = this.getNodeStyle(step.opcode.name, isRevisited, visitCount);

    return {
      id: `step-${stepIndex}`,
      type: this.getNodeType(step.opcode.name),
      position,
      data: {
        label: this.getNodeLabel(step, visitCount),
        opcode: step.opcode.name,
        pc: step.pc,
        gasLeft: step.gasLeft.toString(),
        stackTop: step.stack.length > 0 ? step.stack[step.stack.length - 1].toString() : undefined,
        visitCount,
        isRevisited,
        memorySize: step.memory.length,
        storageChanges: step.storage.length
      },
      style
    };
  }

  private createEdge(currentStep: ExecutionStep, nextStep: ExecutionStep, stepIndex: number): FlowEdge | null {
    const edgeId = `edge-${stepIndex}`;
    const sourceId = `step-${stepIndex}`;
    const targetId = `step-${stepIndex + 1}`;

    // Determine edge type and styling
    const edgeType = this.getEdgeType(currentStep, nextStep);
    const style = this.getEdgeStyle(currentStep, nextStep);

    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: edgeType,
      style,
      animated: currentStep.opcode.name === 'JUMP',
      label: this.getEdgeLabel(currentStep, nextStep)
    };
  }

  private getNodePosition(pc: number, stepIndex: number): { x: number; y: number } {
    // Create a more logical flow layout
    const nodesPerRow = 8;
    const nodeWidth = 180;
    const nodeHeight = 120;
    
    let x = (stepIndex % nodesPerRow) * nodeWidth;
    let y = Math.floor(stepIndex / nodesPerRow) * nodeHeight;
    
    // Adjust for jump destinations to create cleaner flow
    if (this.visitCounts.get(pc)! > 1) {
      // Slightly offset revisited nodes
      x += 20;
      y += 10;
    }
    
    const position = { x, y };
    this.nodePositions.set(pc, position);
    return position;
  }

  private getNodeType(opcode: string): FlowNode['type'] {
    switch (opcode) {
      case 'JUMP':
        return 'jump';
      case 'JUMPDEST':
        return 'jumpdest';
      case 'STOP':
      case 'RETURN':
      case 'REVERT':
        return 'end';
      default:
        return 'instruction';
    }
  }

  private getNodeLabel(step: ExecutionStep, visitCount: number): string {
    const visitIndicator = visitCount > 1 ? ` (×${visitCount})` : '';
    const stackTop = step.stack.length > 0 ? 
      `\nStack: ${step.stack[step.stack.length - 1].toString()}` : '';
    const memInfo = step.memory.length > 0 ? `\nMem: ${step.memory.length}b` : '';
    const storageInfo = step.storage.length > 0 ? `\nStorage: ${step.storage.length}` : '';
    
    return `${step.opcode.name}${visitIndicator}\nPC: ${step.pc}${stackTop}${memInfo}${storageInfo}`;
  }

  private getNodeStyle(opcode: string, isRevisited: boolean, visitCount: number) {
    let backgroundColor = '#f0f0f0';
    let border = '1px solid #999';
    let borderWidth = 1;

    // Color by opcode type
    switch (opcode) {
      case 'JUMP':
        backgroundColor = '#ff6b6b';
        break;
      case 'JUMPDEST':
        backgroundColor = '#4ecdc4';
        break;
      case 'PUSH1':
      case 'PUSH2':
      case 'PUSH4':
      case 'PUSH32':
        backgroundColor = '#95e1d3';
        break;
      case 'SSTORE':
        backgroundColor = '#fce38a';
        break;
      case 'SLOAD':
        backgroundColor = '#f38ba8';
        break;
      case 'MSTORE':
      case 'MLOAD':
        backgroundColor = '#a8e6cf';
        break;
      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
        backgroundColor = '#dcedc1';
        break;
      case 'DUP1':
      case 'DUP2':
      case 'SWAP1':
      case 'SWAP2':
        backgroundColor = '#ffd3a5';
        break;
      default:
        backgroundColor = '#e3f2fd';
    }

    // Modify style for revisited nodes
    if (isRevisited) {
      border = `${Math.min(visitCount + 1, 5)}px solid #ff4757`;
      borderWidth = Math.min(visitCount + 1, 5);
      // Darken color based on visit count
      backgroundColor = this.adjustColorBrightness(backgroundColor, -15 * Math.min(visitCount - 1, 4));
    }

    return {
      backgroundColor,
      border,
      borderWidth
    };
  }

  private getEdgeType(currentStep: ExecutionStep, nextStep: ExecutionStep): FlowEdge['type'] {
    if (currentStep.opcode.name === 'JUMP') {
      return 'jump';
    }
    
    // Check if this is a revisit (going to a previously visited PC)
    const targetVisitCount = this.visitCounts.get(nextStep.pc) || 1;
    if (targetVisitCount > 1) {
      return 'revisit';
    }
    
    return 'step';
  }

  private getEdgeStyle(currentStep: ExecutionStep, nextStep: ExecutionStep) {
    let stroke = '#999';
    let strokeWidth = 2;
    let strokeDasharray = '';

    switch (currentStep.opcode.name) {
      case 'JUMP':
        stroke = '#ff6b6b';
        strokeWidth = 3;
        break;
      case 'JUMPI':
        stroke = '#ff9f43';
        strokeWidth = 3;
        strokeDasharray = '3,3';
        break;
      default:
        // Check if target is revisited
        { const targetVisitCount = this.visitCounts.get(nextStep.pc) || 1;
        if (targetVisitCount > 1) {
          stroke = '#ff4757';
          strokeWidth = Math.min(targetVisitCount, 4);
          strokeDasharray = '5,5'; // Dashed line for revisits
        } }
    }

    return {
      stroke,
      strokeWidth,
      strokeDasharray
    };
  }

  private getEdgeLabel(currentStep: ExecutionStep, nextStep: ExecutionStep): string {
    if (currentStep.opcode.name === 'JUMP') {
      return `→ ${nextStep.pc}`;
    }
    
    if (currentStep.opcode.name === 'JUMPI') {
      const condition = currentStep.stack.length > 0 ? currentStep.stack[currentStep.stack.length - 1] : 0n;
      return condition !== 0n ? `✓ → ${nextStep.pc}` : `✗ → ${nextStep.pc}`;
    }
    
    const targetVisitCount = this.visitCounts.get(nextStep.pc) || 1;
    if (targetVisitCount > 1) {
      return `revisit #${targetVisitCount}`;
    }
    
    return '';
  }

  private adjustColorBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}

// Usage function
export const parseEVMStepsToFlow = (steps: ExecutionStep[]): FlowData => {
  const parser = new EVMFlowParser();
  return parser.parseSteps(steps);
};
