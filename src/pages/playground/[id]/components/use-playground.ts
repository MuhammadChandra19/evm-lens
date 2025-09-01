import { useApp } from "@/hooks/use-app";
import { extractUint256 } from "@/lib/utils";
import { FunctionCallForm } from "@/service/evm-analyzer/abi/schema-validator";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import { parseEVMStepsToFlow } from "@/service/evm-analyzer/utils/react-flow-parser";
import usePlaygroundStore from "@/store/playground";
import { useMemo } from "react";
import { toast } from "sonner";
import { useCurrentPlayground } from "../use-current-playground";
import useAppStore from "@/store/app";

const usePlayground = () => {
  const { getConfig, accounts, playgroundId } = useCurrentPlayground();
  const { ownerAddress, decimals } = getConfig();
  const { evmAdapter } = useApp();
  const saveExecutionResult = useAppStore((store) => store.saveExecutionResult);
  const activeFunction = usePlaygroundStore((store) => store.activeFunction);

  const lastExecutionResult = usePlaygroundStore((store) => {
    if (!store.activeFunction) return undefined;
    return store.getFunctionLastResult(store.activeFunction.func.name!);
  });

  const ownerAccount = useMemo(
    () => accounts.get(ownerAddress.toString()),
    [ownerAddress, accounts],
  );

  const cleanupArgs = (data: FunctionCallForm) => {
    const args: string[] = [];
    Object.keys(data).forEach((k) => {
      if (k !== "ethAmount") {
        args.push(data[k]);
      }
    });

    return args;
  };

  const functionHasOutput = () => {
    if (activeFunction!.type !== "function") {
      return false;
    }
    if ((activeFunction?.func as AbiFunction).outputs.length > 0) {
      return true;
    }

    return false;
  };
  const handleExecute = async (data: FunctionCallForm) => {
    try {
      const res = await evmAdapter.callFunction({
        playgroundId,
        args: cleanupArgs(data),
        ethAmount: BigInt(data["ethAmount"] || "0") * BigInt(10 ** decimals),
        executorAddress: ownerAddress,
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

      const flowData = parseEVMStepsToFlow(res?.data?.steps || []);
      saveExecutionResult({
        playgroundId,
        executedAt: Date.now().toString(),
        executionFlow: flowData,
        functionDefinitions: activeFunction!,
        functionName: activeFunction!.func.name || "",
        hasOutput: functionHasOutput(),
        result: extractUint256(res.data.returnValue).toString(),
      });
    } catch (e) {
      toast.error("Failed to execute function");
      console.error(e);
    }
  };

  return {
    activeFunction,
    lastExecutionResult,
    ownerAccount,
    handleExecute,
  };
};

export default usePlayground;
