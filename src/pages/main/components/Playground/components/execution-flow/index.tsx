import { Background, Controls, ReactFlow } from "@xyflow/react"
import usePlayground from '../../use-playground';
import '@xyflow/react/dist/style.css';

const ExecutionFlow = () => {
  const { lastExecutionResult } = usePlayground()

  return (
    <div className="w-full h-[600px]">
      {
        !lastExecutionResult ? (
          <></>
        ) : (
          <ReactFlow 
            nodes={lastExecutionResult.executionFlow.nodes}
            edges={lastExecutionResult.executionFlow.edges}
            fitView
            attributionPosition="top-right"
          >
            <Background />
            <Controls />
          </ReactFlow>
        )
      }
    </div>
  )
}
export default ExecutionFlow;
