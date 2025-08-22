import { FunctionCallForm } from '@/service/evm-analyzer/abi/schema-validator';
import { parseEVMStepsToFlow } from '@/service/evm-analyzer/utils/react-flow-parser';
import useEVMStore from '@/store/evm';
import usePlaygroundStore from "@/store/playground";
import { useMemo } from "react";
import { toast } from 'sonner';

const usePlayground = () => {
  const activeFunction = usePlaygroundStore((store) => store.activeFunction);
  const ownerAddress = useEVMStore(store => store.ownerAddress!)
  const callFunction = useEVMStore(store => store.callFunction)
  const saveExecutionResult = usePlaygroundStore(store => store.saveResult)

  const accounts = useEVMStore(store => store.accounts!)

    const lastExecutionResult = usePlaygroundStore((store) => {
    if (!store.activeFunction) return undefined;
    return store.getFunctionLastResult(store.activeFunction.name!);
  });


  const ownerAccount = useMemo(() => accounts[ownerAddress.toString()], [ownerAddress, accounts])

  const handleExecute = async (data: FunctionCallForm) => {
    try {
      const res = await callFunction(ownerAddress, activeFunction!, Object.values(data), 300000)
      if(res?.success) {
        const flowData = parseEVMStepsToFlow(res?.steps)
        saveExecutionResult({
          executedAt: Date.now().toString(),
          executionFlow: flowData,
          functionDefinitions: activeFunction!,
          functionName: activeFunction?.name || "",
          id: Date.now().toString()
        })
      } else {
        toast.error("Failed to execute function")
      }

    } catch(e) {
      toast.error("Failed to execute function")
      console.error(e)
    }
  }

  return {
    activeFunction,
    lastExecutionResult,
    ownerAccount,
    handleExecute
  };
};

export default usePlayground;
