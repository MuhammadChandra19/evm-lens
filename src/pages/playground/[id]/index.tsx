import Layout from "./components/layout";
import ExecutionFlow from "./components/execution-flow";
import ExecutionPlaceholder from "./components/execution-flow/execution-placeholder";
import AbiHandler from "./components/abi-handler";
import { useCurrentPlayground } from "@/hooks/use-current-playground";

const Playground = () => {
  const { activeFunction, getFunctionLastResult } = useCurrentPlayground();

  const lastExecutionResult = activeFunction
    ? getFunctionLastResult(activeFunction.func.name!)
    : undefined;

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-4 h-full">
        <AbiHandler />
        {lastExecutionResult ? (
          <ExecutionFlow lastExecutionResult={lastExecutionResult} />
        ) : (
          <ExecutionPlaceholder />
        )}
      </div>
    </Layout>
  );
};

export default Playground;
