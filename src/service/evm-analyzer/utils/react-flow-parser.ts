// src/service/evm-analyzer/utils/react-flow-parser.ts

import { ExecutionStep } from '../types';

export interface NodeClickData {
  pc: number;
  opcode: string;
  stepIndex: number;
  memory: Uint8Array;
  stack: bigint[];
  storage: [string, string][]; // PrefixedHexString pairs
  gasLeft: bigint;
  gasRefund: bigint;
  depth: number;
}

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
    // ✅ Click event data
    clickData: NodeClickData;
    onClick?: (data: NodeClickData) => void;
  };
  style?: {
    backgroundColor?: string;
    border?: string;
    borderWidth?: number;
    borderRadius?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    boxShadow?: string;
    cursor?: string;
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
  labelStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
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
  private onNodeClick?: (data: NodeClickData) => void;

  constructor(onNodeClick?: (data: NodeClickData) => void) {
    this.onNodeClick = onNodeClick;
  }

  parseSteps(steps: ExecutionStep[]): FlowData {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    let jumpCount = 0;
    let maxStackDepth = 0;
    let storageOperations = 0;

    // First pass: count visits to each PC
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

      // Create node with click data
      const node = this.createNode(step, i);
      nodes.push(node);

      // Create edge to next step
      if (nextStep) {
        const edge = this.createEdge(step, nextStep, i);
        if (edge) {
          edges.push(edge);
          if (step.opcode.name === 'JUMP' || step.opcode.name === 'JUMPI') {
            jumpCount++;
          }
        }
      }
    }

    const revisitedNodes = Array.from(this.visitCounts.values()).filter((count) => count > 1).length;
    const totalGasUsed = steps.length > 0 ? (steps[0].gasLeft - steps[steps.length - 1].gasLeft).toString() : '0';

    return {
      nodes,
      edges,
      metadata: {
        totalSteps: steps.length,
        totalGasUsed,
        jumpCount,
        revisitedNodes,
        maxStackDepth,
        storageOperations,
      },
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

    // ✅ Prepare click data
    const clickData: NodeClickData = {
      pc: step.pc,
      opcode: step.opcode.name,
      stepIndex,
      memory: step.memory,
      stack: step.stack,
      storage: step.storage,
      gasLeft: step.gasLeft,
      gasRefund: step.gasRefund,
      depth: step.depth,
    };

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
        storageChanges: step.storage.length,
        clickData, // ✅ Include click data
        onClick: this.onNodeClick, // ✅ Include click handler
      },
      style: this.getNodeStyle(step.opcode.name, isRevisited, visitCount),
    };
  }

  private createEdge(currentStep: ExecutionStep, nextStep: ExecutionStep, stepIndex: number): FlowEdge | null {
    const edgeId = `edge-${stepIndex}`;
    const sourceId = `step-${stepIndex}`;
    const targetId = `step-${stepIndex + 1}`;

    const edgeType = this.getEdgeType(currentStep, nextStep);
    const style = this.getEdgeStyle(currentStep, nextStep);

    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: edgeType,
      style,
      animated: currentStep.opcode.name === 'JUMP' || currentStep.opcode.name === 'JUMPI',
      label: this.getEdgeLabel(currentStep, nextStep),
      labelStyle: this.getEdgeLabelStyle(currentStep),
    };
  }

  private getNodePosition(pc: number, stepIndex: number): { x: number; y: number } {
    const nodesPerRow = 8;
    const nodeWidth = 200;
    const nodeHeight = 140;

    const x = (stepIndex % nodesPerRow) * nodeWidth;
    const y = Math.floor(stepIndex / nodesPerRow) * nodeHeight;

    return { x, y };
  }

  private getNodeType(opcode: string): FlowNode['type'] {
    switch (opcode) {
      case 'JUMP':
      case 'JUMPI':
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
    const visitIndicator = visitCount > 1 ? ` ×${visitCount}` : '';
    const stackTop = step.stack.length > 0 ? `\n${this.formatStackValue(step.stack[step.stack.length - 1])}` : '';

    return `${step.opcode.name}${visitIndicator}\nPC:${step.pc}${stackTop}`;
  }

  private formatStackValue(value: bigint): string {
    const hex = value.toString(16);
    if (hex.length <= 8) {
      return `0x${hex}`;
    }
    return `0x${hex.slice(0, 6)}...`;
  }

  private getNodeStyle(opcode: string, isRevisited: boolean, visitCount: number) {
    let backgroundColor = '#ffffff';
    let borderColor = '#e1e5e9';
    let textColor = '#2d3436';
    let borderWidth = 1;
    let boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    // Color styling (same as before)
    switch (opcode) {
      case 'JUMP':
        backgroundColor = '#ff7675';
        borderColor = '#d63031';
        textColor = '#ffffff';
        boxShadow = '0 4px 8px rgba(214, 48, 49, 0.3)';
        break;
      case 'JUMPI':
        backgroundColor = '#fdcb6e';
        borderColor = '#e17055';
        textColor = '#2d3436';
        boxShadow = '0 4px 8px rgba(225, 112, 85, 0.3)';
        break;
      case 'JUMPDEST':
        backgroundColor = '#00b894';
        borderColor = '#00a085';
        textColor = '#ffffff';
        boxShadow = '0 4px 8px rgba(0, 184, 148, 0.3)';
        break;
      case 'SSTORE':
        backgroundColor = '#ffeaa7';
        borderColor = '#fdcb6e';
        textColor = '#2d3436';
        boxShadow = '0 3px 6px rgba(253, 203, 110, 0.3)';
        break;
      case 'SLOAD':
        backgroundColor = '#fd79a8';
        borderColor = '#e84393';
        textColor = '#ffffff';
        boxShadow = '0 3px 6px rgba(232, 67, 147, 0.3)';
        break;
      case 'RETURN':
      case 'STOP':
      case 'REVERT':
        backgroundColor = '#e17055';
        borderColor = '#d63031';
        textColor = '#ffffff';
        boxShadow = '0 4px 12px rgba(214, 48, 49, 0.4)';
        break;
      default:
        backgroundColor = '#f8f9fa';
        borderColor = '#dee2e6';
        textColor = '#495057';
        boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
    }

    // Enhanced styling for revisited nodes
    if (isRevisited) {
      borderWidth = Math.min(visitCount + 1, 4);
      boxShadow = `0 0 0 ${borderWidth}px rgba(255, 71, 87, 0.3), ${boxShadow}`;
    }

    return {
      backgroundColor,
      border: `${borderWidth}px solid ${borderColor}`,
      borderWidth,
      borderRadius: '8px',
      color: textColor,
      fontSize: '12px',
      fontWeight: isRevisited ? 'bold' : 'normal',
      padding: '8px 12px',
      boxShadow,
      minWidth: '120px',
      textAlign: 'center' as const,
      cursor: 'pointer', // ✅ Show it's clickable
    };
  }

  private getEdgeType(currentStep: ExecutionStep, nextStep: ExecutionStep): FlowEdge['type'] {
    if (currentStep.opcode.name === 'JUMP' || currentStep.opcode.name === 'JUMPI') {
      return 'jump';
    }

    const targetVisitCount = this.visitCounts.get(nextStep.pc) || 1;
    if (targetVisitCount > 1) {
      return 'revisit';
    }

    return 'step';
  }

  private getEdgeStyle(currentStep: ExecutionStep, nextStep: ExecutionStep) {
    let stroke = '#a8e6cf';
    let strokeWidth = 2;
    let strokeDasharray = '';

    switch (currentStep.opcode.name) {
      case 'JUMP':
        stroke = '#ff6b6b';
        strokeWidth = 3;
        break;
      case 'JUMPI':
        stroke = '#fdcb6e';
        strokeWidth = 3;
        strokeDasharray = '8,4';
        break;
      default:
        { const targetVisitCount = this.visitCounts.get(nextStep.pc) || 1;
        if (targetVisitCount > 1) {
          stroke = '#ff4757';
          strokeWidth = Math.min(targetVisitCount, 4);
          strokeDasharray = '6,3';
        } }
    }

    return {
      stroke,
      strokeWidth,
      strokeDasharray,
    };
  }

  private getEdgeLabel(currentStep: ExecutionStep, nextStep: ExecutionStep): string {
    if (currentStep.opcode.name === 'JUMP') {
      return `→ ${nextStep.pc}`;
    }

    if (currentStep.opcode.name === 'JUMPI') {
      const condition = currentStep.stack.length > 0 ? currentStep.stack[currentStep.stack.length - 1] : 0n;
      return condition !== 0n ? `✓ ${nextStep.pc}` : `✗ ${nextStep.pc}`;
    }

    const targetVisitCount = this.visitCounts.get(nextStep.pc) || 1;
    if (targetVisitCount > 1) {
      return `#${targetVisitCount}`;
    }

    return '';
  }

  private getEdgeLabelStyle(currentStep: ExecutionStep) {
    let color = '#636e72';
    const fontSize = '10px';
    let fontWeight = 'normal';

    switch (currentStep.opcode.name) {
      case 'JUMP':
        color = '#d63031';
        fontWeight = 'bold';
        break;
      case 'JUMPI':
        color = '#e17055';
        fontWeight = 'bold';
        break;
      default:
        color = '#636e72';
    }

    return {
      fontSize,
      fontWeight,
      color,
    };
  }
}

// ✅ Updated factory function with click handler
export const parseEVMStepsToFlow = (steps: ExecutionStep[], onNodeClick?: (data: NodeClickData) => void): FlowData => {
  const parser = new EVMFlowParser(onNodeClick);
  return parser.parseSteps(steps);
};
