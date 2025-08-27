import Layout from "./components/layout";
import ExecutionFlow from "./components/execution-flow";
import AbiHandler from "./components/abi-handler";
import usePlaygroundStore from "@/store/playground";

const Playground = () => {
  const lastExecutionResult = usePlaygroundStore((store) => {
    if (!store.activeFunction) return undefined;
    return store.getFunctionLastResult(store.activeFunction.func.name!);
  });

  
  return (
    <Layout>
      <AbiHandler />
      {lastExecutionResult && (
        <ExecutionFlow lastExecutionResult={lastExecutionResult} />
      )}
    </Layout>
  );
};

export default Playground;
