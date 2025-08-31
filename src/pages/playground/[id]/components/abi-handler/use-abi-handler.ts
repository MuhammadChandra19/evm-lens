import { Address } from '@ethereumjs/util';
import { FunctionCallForm } from '@/service/evm-analyzer/abi/schema-validator';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { parseEVMStepsToFlow } from '@/service/evm-analyzer/utils/react-flow-parser';
import { AbiFunction } from '@/service/evm-analyzer/abi/types';
import { extractUint256 } from '@/lib/utils';
import { parsers } from '@/service/evm/opcodes/utils';
import { useEVMAdapter } from '@/hooks/use-evm-adapter';
import { useCurrentPlayground } from '@/hooks/use-current-playground';

const useAbiHandler = () => {
  const evmAdapter = useEVMAdapter();
  const [executing, setExecuting] = useState(false);

  // Get current playground data (including UI state)
  const { tokenBalances, playgroundConfig, activeFunction, saveExecutionResult } = useCurrentPlayground();

  const cleanupArgs = (data: FunctionCallForm) => {
    const args: string[] = [];
    Object.values(data).forEach((value) => {
      args.push(value);
    });

    return args;
  };

  const handleExecute = async (data: FunctionCallForm, executor: Address, ethAmount: string) => {
    try {
      setExecuting(true);
      // Get current playground ID from current playground config
      const playgroundId = playgroundConfig?.id;

      if (!playgroundId) {
        toast.error('No playground ID found');
        return;
      }

      const res = await evmAdapter.callFunction(
        {
          args: cleanupArgs(data),
          ethAmount: BigInt(ethAmount),
          executorAddress: executor,
          func: activeFunction!.func,
          gasLimit: 3000000,
          type: activeFunction!.type,
        },
        playgroundId
      );

      if (!res.success) {
        toast.error('Failed to execute function', {
          description: res.error || 'Function execution failed',
        });
        return;
      }

      console.log('🔍 Execution result:', res.data?.returnValue);

      const flowData = parseEVMStepsToFlow(res.data?.steps || [], (v) => console.log(v));

      // Extract and format the return value properly
      let formattedResult = '0';
      if (res.data?.returnValue && hasOutput()) {
        try {
          const returnValueBytes = parsers.hexStringToUint8Array(res.data.returnValue);
          const extractedValue = extractUint256(returnValueBytes);
          formattedResult = extractedValue.toString();
        } catch (error) {
          console.warn('Failed to extract uint256 from return value:', error);
          formattedResult = res.data.returnValue || '0';
        }
      }

      saveExecutionResult({
        executedAt: Date.now().toString(),
        executionFlow: flowData,
        functionDefinitions: activeFunction!,
        functionName: activeFunction?.func.name || '',
        id: Date.now().toString(),
        hasOutput: hasOutput(),
        result: formattedResult,
      });
    } catch (e) {
      toast.error('Failed to execute function');
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  const hasOutput = () => activeFunction?.type === 'function' && (activeFunction.func as AbiFunction).outputs.length > 0;

  const accountList = useMemo(() => {
    // Convert token balances to account-like objects
    return Array.from(tokenBalances.values()).map((balance) => ({
      address: new Address(Buffer.from(balance.accountAddress.slice(2), 'hex')),
      balance: balance.balance,
      isContract: false,
    }));
  }, [tokenBalances]);

  return {
    activeFunction,
    handleExecute,
    executing,
    accountList,
  };
};

export default useAbiHandler;
