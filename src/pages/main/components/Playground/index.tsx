import Layout from "./components/layout";
import usePlayground from "./use-playground";
import FunctionForm from "./components/function-form";
import BalanceForm from './components/balance-form';
import ExecutionFlow from './components/execution-flow';

const Playground = () => {
  const { ownerAccount, lastExecutionResult } = usePlayground();

  return (
    <Layout>
      <div className="w-full p-4 flex gap-2 justify-between rounded-xl border shadow-sm items-center bg-gradient-to-bl from-slate-50 to-blue-50">
        <span>
          <div className="font-semibold">Owner Address</div>
          <div className="text-red-400 font-light text-sm">{ownerAccount.address.toString()}</div>
        </span>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <div className="font-semibold">Balance: </div>
            <div className="font-light text-blue-500 text-sm">{ownerAccount.balance} ETH</div>
          </div>
          <BalanceForm />
        </div>
      </div>
      <FunctionForm />
      { lastExecutionResult && <ExecutionFlow />}
    </Layout>
  );
};

export default Playground;
