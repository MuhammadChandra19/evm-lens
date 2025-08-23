import { FunctionCallForm } from "@/service/evm-analyzer/abi/schema-validator";
import { parseEVMStepsToFlow } from "@/service/evm-analyzer/utils/react-flow-parser";
import useEVMStore from "@/store/evm";
import usePlaygroundStore from "@/store/playground";
import { useMemo } from "react";
import { toast } from "sonner";

const usePlayground = () => {
  const activeFunction = usePlaygroundStore((store) => store.activeFunction);
  const decimals = useEVMStore((store) => store.decimals);
  const ownerAddress = useEVMStore((store) => store.ownerAddress!);
  const callFunction = useEVMStore((store) => store.callFunction);
  const saveExecutionResult = usePlaygroundStore((store) => store.saveResult);

  const accounts = useEVMStore((store) => store.accounts!);

  const lastExecutionResult = usePlaygroundStore((store) => {
    if (!store.activeFunction) return undefined;
    return store.getFunctionLastResult(store.activeFunction.func.name!);
  });

  const ownerAccount = useMemo(
    () => accounts[ownerAddress.toString()],
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

  const handleExecute = async (data: FunctionCallForm) => {
    try {
      const res = await callFunction({
        args: cleanupArgs(data),
        ethAmount: BigInt(data["ethAmount"] || "0") * BigInt(10 ** decimals),
        executorAddres: ownerAddress,
        func: activeFunction!.func,
        gasLimit: 3000000,
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
        functionName: activeFunction?.name || "",
        id: Date.now().toString(),
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
