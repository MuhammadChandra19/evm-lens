import Layout from "./components/layout";
import ExecutionFlow from "./components/execution-flow";
import ExecutionPlaceholder from "./components/execution-flow/execution-placeholder";
import AbiHandler from "./components/abi-handler";
import { useCurrentPlayground } from './use-current-playground';

const Playground = () => {
  const { lastExecutionResult } = useCurrentPlayground();

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
