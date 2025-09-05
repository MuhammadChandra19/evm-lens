// src/pages/main/components/Playground/components/execution-flow/index.tsx

import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatedSVGEdge } from "./animated-edges";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Play, Zap } from "lucide-react";
import { NodeClickData } from "@/service/evm-analyzer/utils/react-flow-parser";
import { ResultHistory } from "@/store/app/types";
type Props = {
  lastExecutionResult: ResultHistory;
};
const ExecutionFlow = ({ lastExecutionResult }: Props) => {
  const [selectedNodeData, setSelectedNodeData] =
    useState<NodeClickData | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    lastExecutionResult!.executionFlow.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    lastExecutionResult!.executionFlow.edges,
  );

  // Update nodes and edges when lastExecutionResult changes
  useEffect(() => {
    if (lastExecutionResult?.executionFlow) {
      setNodes(lastExecutionResult.executionFlow.nodes);
      setEdges(lastExecutionResult.executionFlow.edges);
      // Reset selected node when execution result changes
      setSelectedNodeData(null);
    }
  }, [lastExecutionResult, setNodes, setEdges]);

  const edgeTypes = {
    animatedSvg: AnimatedSVGEdge,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = (_event: React.MouseEvent, node: any) => {
    if (node.data.onClick && node.data.clickData) {
      setSelectedNodeData(node.data.clickData);
      node.data.onClick(node.data.clickData);
    }
  };

  const formatMemory = (memory: Uint8Array): string => {
    if (memory.length === 0) return "Empty";
    const hex = Buffer.from(memory).toString("hex");
    return hex.match(/.{1,32}/g)?.join("\n") || hex;
  };

  const formatStack = (stack: bigint[]): { value: string; index: number }[] => {
    return stack.map((value, index) => ({
      value: value.toString(16),
      index: stack.length - 1 - index,
    }));
  };

  const activeNodeData = useMemo(() => {
    if (selectedNodeData) {
      return selectedNodeData;
    }

    return undefined;
  }, [selectedNodeData]);

  return (
    <div className="w-full col-span-9 flex flex-col gap-3 h-full">
      {/* Compact Header */}
      <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50/30 rounded-lg">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Play className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-green-900">
            Execution Flow Complete
          </h3>
          <p className="text-sm text-green-700">
            Function executed successfully - explore the execution graph below
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {lastExecutionResult.hasOutput && (
            <Badge variant="outline" className="text-xs">
              Result: {lastExecutionResult.result}
            </Badge>
          )}
          <Badge variant="secondary">
            <Zap className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        </div>
      </div>

      {/* Execution State Details - Collapsible */}
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">Execution State Details</h4>
            {activeNodeData && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {activeNodeData.opcode}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Step #{activeNodeData.stepIndex + 1}
                </Badge>
              </div>
            )}
          </div>
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="p-4">
              {activeNodeData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Opcode:</span>
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {activeNodeData.opcode}
                      </code>
                    </div>
                    <div className="text-xs text-gray-500">
                      PC: {activeNodeData.pc} | Gas:{" "}
                      {activeNodeData.gasLeft.toString()} | Refund:{" "}
                      {activeNodeData.gasRefund.toString()} | Depth:{" "}
                      {activeNodeData.depth}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stack Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-sm">Stack</h5>
                        <Badge variant="secondary" className="text-xs">
                          {activeNodeData.stack.length}
                        </Badge>
                      </div>
                      {activeNodeData.stack.length > 0 ? (
                        <div className="bg-slate-50 rounded p-2 font-mono text-xs space-y-1 max-h-32 overflow-auto">
                          {formatStack(activeNodeData.stack).map(
                            ({ value, index }) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-slate-500">
                                  [{index}]:
                                </span>
                                <span className="text-blue-600">0x{value}</span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Empty
                        </div>
                      )}
                    </div>

                    {/* Memory Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-sm">Memory</h5>
                        <Badge variant="secondary" className="text-xs">
                          {activeNodeData.memory.length}b
                        </Badge>
                      </div>
                      <div className="bg-slate-50 rounded p-2 font-mono text-xs max-h-32 overflow-auto">
                        <pre className="whitespace-pre-wrap text-green-600">
                          {formatMemory(activeNodeData.memory)}
                        </pre>
                      </div>
                    </div>

                    {/* Storage Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-sm">Storage</h5>
                        <Badge variant="secondary" className="text-xs">
                          {activeNodeData.storage.length}
                        </Badge>
                      </div>
                      {activeNodeData.storage.length > 0 ? (
                        <div className="bg-slate-50 rounded p-2 space-y-1 max-h-32 overflow-auto">
                          {activeNodeData.storage.map(([key, value], index) => (
                            <div key={index} className="font-mono text-xs">
                              <div className="text-slate-500">
                                Key:{" "}
                                <span className="text-purple-600">{key}</span>
                              </div>
                              <div className="text-slate-500">
                                Val:{" "}
                                <span className="text-purple-600">{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No changes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  Click any node in the execution flow to view its state details
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Execution Flow Visualization */}
      <Card className="border border-gray-200 flex-1">
        <CardContent className="p-0 h-full">
          <div className="w-full h-full overflow-hidden">
            {lastExecutionResult && (
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutionFlow;
