import { Address } from "@ethereumjs/util";
import useEVMStore from "@/store/evm";
import usePlaygroundStore from "@/store/playground";
import { FunctionCallForm } from "@/store/playground/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseEVMStepsToFlow } from "@/service/evm-analyzer/utils/react-flow-parser";

const useAbiHandler = () => {
  const [executing, setExecuting] = useState(false);
  const activeFunction = usePlaygroundStore((store) => store.activeFunction);
  const saveExecutionResult = usePlaygroundStore((store) => store.saveResult);

  const accounts = useEVMStore((store) => store.accounts);
  const callFunction = useEVMStore((store) => store.callFunction);

  const cleanupArgs = (data: FunctionCallForm) => {
    const args: string[] = [];
    data.inputs.forEach((k) => {
      args.push(`${k.value}`);
    });

    return args;
  };

  const handleExecute = async (
    data: FunctionCallForm,
    executor: Address,
    ethAmount: string,
  ) => {
    try {
      setExecuting(true);
      const res = await callFunction({
        args: cleanupArgs(data),
        ethAmount: BigInt(ethAmount),
        executorAddres: executor,
        func: activeFunction!.func,
        gasLimit: 3000000,
        type: activeFunction!.type,
      });

      if (!res) {
        toast.error("Failed to execute function");
        return;
      }

      if (res.error) {
        toast.error("Failed to execute function", {
          description: res.error,
        });
      }

      const flowData = parseEVMStepsToFlow(res?.steps);
      saveExecutionResult({
        executedAt: Date.now().toString(),
        executionFlow: flowData,
        functionDefinitions: activeFunction!,
        functionName: activeFunction?.func.name || "",
        id: Date.now().toString(),
      });
    } catch (e) {
      toast.error("Failed to execute function");
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  const accountList = useMemo(() => Object.values(accounts!).map(v => v), [accounts])

  return {
    activeFunction,
    handleExecute,
    executing,
    accountList,
  };
};

export default useAbiHandler;
