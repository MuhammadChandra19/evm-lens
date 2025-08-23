// src/pages/main/components/Playground/components/execution-flow/index.tsx

import { Background, Controls, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react"
import usePlayground from '../../use-playground';
import '@xyflow/react/dist/style.css';
import { AnimatedSVGEdge } from './animated-edges';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NodeClickData } from '@/service/evm-analyzer/utils/react-flow-parser';

const ExecutionFlow = () => {
  const { lastExecutionResult } = usePlayground();
  const [selectedNodeData, setSelectedNodeData] = useState<NodeClickData | null>(null);

  const [nodes, , onNodesChange] = useNodesState(lastExecutionResult!.executionFlow.nodes);
  const [edges, , onEdgesChange] = useEdgesState(lastExecutionResult!.executionFlow.edges);

  const edgeTypes = {
    animatedSvg: AnimatedSVGEdge,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    if (node.data.onClick && node.data.clickData) {
      setSelectedNodeData(node.data.clickData);
      node.data.onClick(node.data.clickData);
    }
  };

  const formatMemory = (memory: Uint8Array): string => {
    if (memory.length === 0) return 'Empty';
    const hex = Buffer.from(memory).toString('hex');
    return hex.match(/.{1,32}/g)?.join('\n') || hex;
  };

  const formatStack = (stack: bigint[]): { value: string; index: number }[] => {
    return stack.map((value, index) => ({
      value: value.toString(16),
      index: stack.length - 1 - index
    }));
  };

  return (
    <div className="w-full space-y-4">
      {selectedNodeData ? (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{selectedNodeData.opcode}</h3>
                <Badge variant="outline" className="text-xs">PC:{selectedNodeData.pc}</Badge>
                <Badge variant="secondary" className="text-xs">#{selectedNodeData.stepIndex + 1}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Gas: {selectedNodeData.gasLeft.toString()} | 
                Refund: {selectedNodeData.gasRefund.toString()} | 
                Depth: {selectedNodeData.depth}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stack Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Stack</h4>
                  <Badge variant="secondary">{selectedNodeData.stack.length}</Badge>
                </div>
                {selectedNodeData.stack.length > 0 ? (
                  <div className="bg-slate-50 rounded p-3 font-mono text-xs space-y-1 max-h-40 overflow-auto">
                    {formatStack(selectedNodeData.stack).map(({ value, index }) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-slate-500">[{index}]:</span>
                        <span className="text-blue-600">0x{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Empty</div>
                )}
              </div>

              {/* Memory Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Memory</h4>
                  <Badge variant="secondary">{selectedNodeData.memory.length}b</Badge>
                </div>
                <div className="bg-slate-50 rounded p-3 font-mono text-xs max-h-40 overflow-auto">
                  <pre className="whitespace-pre-wrap text-green-600">
                    {formatMemory(selectedNodeData.memory)}
                  </pre>
                </div>
              </div>

              {/* Storage Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Storage</h4>
                  <Badge variant="secondary">{selectedNodeData.storage.length}</Badge>
                </div>
                {selectedNodeData.storage.length > 0 ? (
                  <div className="bg-slate-50 rounded p-3 space-y-2 max-h-40 overflow-auto">
                    {selectedNodeData.storage.map(([key, value], index) => (
                      <div key={index} className="font-mono text-xs">
                        <div className="text-slate-500">Key: <span className="text-purple-600">{key}</span></div>
                        <div className="text-slate-500">Val: <span className="text-purple-600">{value}</span></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No changes</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border rounded-lg p-4 text-center text-muted-foreground">
          Click any node to view its memory and stack state
        </div>
      )}

      <div className="w-full h-[600px] border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          onNodeClick={handleNodeClick}
          attributionPosition="top-right"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ExecutionFlow;
