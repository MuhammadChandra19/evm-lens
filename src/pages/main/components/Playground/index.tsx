import Layout from "./components/layout";
import usePlayground from "./use-playground";
import ExecutionFlow from "./components/execution-flow";
import AbiHandler from './components/abi-handler';

const Playground = () => {
  const { lastExecutionResult } = usePlayground();

  return (
    <Layout>
      <AbiHandler />
      {lastExecutionResult && <ExecutionFlow />}
    </Layout>
  );
};

export default Playground;
