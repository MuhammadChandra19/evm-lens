import { Address } from "@ethereumjs/util";
import usePlaygroundStore from "@/store/playground";
import { FunctionCallForm } from "@/store/playground/types";
import { useState } from "react";
import { toast } from "sonner";
import { parseEVMStepsToFlow } from "@/service/evm-analyzer/utils/react-flow-parser";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import { extractUint256 } from "@/lib/utils";
import { useApp } from "@/hooks/use-app";
import { useCurrentPlayground } from "../../use-current-playground";

const useAbiHandler = () => {
  const { playgroundId, accountList } = useCurrentPlayground();
  const { evmAdapter } = useApp();
  const [executing, setExecuting] = useState(false);
  const activeFunction = usePlaygroundStore((store) => store.activeFunction);
  const saveExecutionResult = usePlaygroundStore((store) => store.saveResult);

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
      const res = await evmAdapter.callFunction({
        args: cleanupArgs(data),
        ethAmount: BigInt(ethAmount),
        executorAddress: executor,
        func: activeFunction!.func,
        gasLimit: 3000000,
        type: activeFunction!.type,
        playgroundId,
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

      console.log(res)
      const flowData = parseEVMStepsToFlow(res.data.steps, (v) =>
        console.log(v),
      );
      saveExecutionResult({
        executedAt: Date.now().toString(),
        executionFlow: flowData,
        functionDefinitions: activeFunction!,
        functionName: activeFunction?.func.name || "",
        id: Date.now().toString(),
        hasOutput: hasOutput(),
        result: extractUint256(res.data.returnValue).toString(),
      });
    } catch (e) {
      toast.error("Failed to execute function");
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  const hasOutput = () =>
    activeFunction?.type === "function" &&
    (activeFunction.func as AbiFunction).outputs.length > 0;

  return {
    activeFunction,
    handleExecute,
    executing,
    accountList,
  };
};

export default useAbiHandler;
