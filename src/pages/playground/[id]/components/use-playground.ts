import { useEVMAdapter } from '@/hooks/use-evm-adapter';
import { useCurrentPlayground } from '@/hooks/use-current-playground';
import { FunctionCallForm } from '@/service/evm-analyzer/abi/schema-validator';
import { AbiFunction } from '@/service/evm-analyzer/abi/types';
import { parseEVMStepsToFlow } from '@/service/evm-analyzer/utils/react-flow-parser';
import { extractUint256 } from '@/lib/utils';
import { parsers } from '@/service/evm/opcodes/utils';
import { useMemo } from 'react';
import { toast } from 'sonner';

const usePlayground = () => {
  const evmAdapter = useEVMAdapter();

  // Get current playground data (including UI state)
  const { decimals, ownerAddress, tokenBalances, playgroundConfig, activeFunction, saveExecutionResult, getFunctionLastResult } = useCurrentPlayground();

  // Note: We now get balance from token balances instead of EVM directly
  // This matches how the explorer accounts page works

  const lastExecutionResult = useMemo(() => {
    if (!activeFunction) return undefined;
    return getFunctionLastResult(activeFunction.func.name!);
  }, [activeFunction, getFunctionLastResult]);

  const ownerAccount = useMemo(() => {
    if (!ownerAddress) return undefined;

    // Get balance from token balances (like explorer does)
    // Token balances are stored as Map<"accountAddress-contractAddress", TokenBalance>
    // We need to sum all token balances for this account address
    let totalBalance = 0n;

    tokenBalances.forEach((tokenBalance) => {
      if (tokenBalance.accountAddress === ownerAddress.toString()) {
        totalBalance += tokenBalance.balance;
      }
    });

    console.log('🔍 Owner balance calculated:', {
      ownerAddress: ownerAddress.toString(),
      totalBalance: totalBalance.toString(),
      totalBalanceETH: (Number(totalBalance) / 1e18).toFixed(4),
    });

    return {
      address: ownerAddress,
      balance: totalBalance,
      isContract: false,
    };
  }, [ownerAddress, tokenBalances]);

  const cleanupArgs = (data: FunctionCallForm) => {
    const args: string[] = [];
    Object.keys(data).forEach((k) => {
      if (k !== 'ethAmount') {
        args.push(data[k]);
      }
    });

    return args;
  };

  const functionHasOutput = () => {
    if (activeFunction!.type !== 'function') {
      return false;
    }
    if ((activeFunction?.func as AbiFunction).outputs.length > 0) {
      return true;
    }

    return false;
  };
  const handleExecute = async (data: FunctionCallForm) => {
    try {
      // Get current playground ID from URL params
      const playgroundId = playgroundConfig?.id;

      if (!ownerAddress || !playgroundId) {
        toast.error('Missing playground configuration');
        return;
      }

      const res = await evmAdapter.callFunction(
        {
          args: cleanupArgs(data),
          ethAmount: BigInt(data['ethAmount'] || '0') * BigInt(10 ** decimals),
          executorAddress: ownerAddress,
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

      const flowData = parseEVMStepsToFlow(res.data?.steps || []);

      // Extract and format the return value properly
      let formattedResult = '0';
      if (res.data?.returnValue && functionHasOutput()) {
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
        functionName: activeFunction!.func.name || '',
        id: Date.now().toString(),
        hasOutput: functionHasOutput(),
        result: formattedResult,
      });

      // Note: Token balances are automatically updated by the EVM adapter
      // No need to manually refresh since we're using token balances from the store
    } catch (e) {
      toast.error('Failed to execute function');
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
