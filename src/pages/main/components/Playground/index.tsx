import Layout from "./components/layout";
import usePlayground from "./use-playground";
import FunctionForm from "./components/function-form";
import ExecutionFlow from "./components/execution-flow";

const Playground = () => {
  const { lastExecutionResult } = usePlayground();

  return (
    <Layout>
      <FunctionForm />
      {lastExecutionResult && <ExecutionFlow />}
    </Layout>
  );
};

export default Playground;
