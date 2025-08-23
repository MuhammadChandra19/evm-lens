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
    return store.getFunctionLastResult(store.activeFunction.name!);
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
    const ethAmountWei =
      BigInt(data["ethAmount"] || "0") * BigInt(10 ** decimals);

    console.log("🔍 Debug execution:");
    console.log("ETH Amount input:", data["ethAmount"]);
    console.log("ETH Amount in wei:", ethAmountWei.toString());
    console.log("Owner balance:", ownerAccount?.balance.toString());
    console.log(
      "Owner balance in ETH:",
      Number(ownerAccount?.balance || 0n) / 1e18,
    );
    try {
      const res = await callFunction({
        args: cleanupArgs(data),
        ethAmount: BigInt(data["ethAmount"] || "0") * BigInt(10 ** decimals),
        executorAddres: ownerAddress,
        func: activeFunction!,
        gasLimit: 3000000,
      });
      console.log(res);
      if (!res) {
        toast.error("Failed to execute function");
        return;
      }

      if (res.error) {
        toast.error("Failed to execute function", {
          description: res.error,
        });
      }

      const flowData = parseEVMStepsToFlow(res?.steps, (data) =>
        console.log(data),
      );
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
