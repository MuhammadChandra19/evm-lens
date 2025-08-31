import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContractEVMSchema, contractEVMSchema } from './schema';
import { DEFAULT_DATA } from './data';
import { toast } from 'sonner';
import { AbiValidator } from '@/service/evm-analyzer/abi';
import { Abi } from '@/service/evm-analyzer/abi/types';
import { useNavigate } from 'react-router';
import { useApp } from '@/hooks/use-app';
import { useEVMAdapter } from '@/hooks/use-evm-adapter';

const useDeployContract = () => {
  const navigate = useNavigate();
  const { repository } = useApp();
  const evmAdapter = useEVMAdapter();
  const method = useForm<ContractEVMSchema>({
    resolver: zodResolver(contractEVMSchema),
    defaultValues: DEFAULT_DATA,
  });

  const validateAbi = (abiStr: string): Abi | undefined => {
    try {
      const abiJson = JSON.parse(abiStr);
      const abi = new AbiValidator(abiJson);

      return abi.getAbi();
    } catch (e) {
      method.setError('bytecodeAndAbi.contractAbi', {
        message: 'invalid abi',
      });
      console.error(e);
    }
  };

  const handleDeploycontract = async (payload: ContractEVMSchema) => {
    try {
      const id = new Date().getTime();

      // playgroundId is now passed as parameter to EVM adapter methods

      const abi = validateAbi(payload.bytecodeAndAbi.contractAbi);
      if (!abi) {
        toast.error('failed to create new EVM', {
          description: 'Invalid Abi',
        });
        return;
      }

      const res = await evmAdapter.deployContract(
        {
          id,
          abi,
          contractAddress: payload.contractConfiguration.contractAddress,
          constructorBytecode: payload.bytecodeAndAbi.constructorBytecode,
          ownerAddress: payload.contractConfiguration.ownerAddress,
          decimal: parseInt(payload.contractConfiguration.decimals),
          initialOwnerBalance: BigInt(payload.contractConfiguration.initialOwnerBalance),
          totalSupply: parseInt(payload.contractConfiguration.totalSupply),
          projectName: payload.contractConfiguration.projectName,
        },
        id // playgroundId
      );

      if (!res.success) {
        toast.error('failed to create new EVM', {
          description: res.error || 'Contract deployment failed',
        });

        return;
      }

      const playground = await repository.playground.create({
        name: payload.contractConfiguration.projectName,
        id,
        icon: payload.contractConfiguration.projectName.charAt(0).toUpperCase(),
      });

      if (playground) {
        toast.success('Contract Deployed');
        navigate(`/playground/${id}`);
        return;
      }

      toast.success('Failed to create playground');
    } catch (e) {
      console.error(e);
      toast.error('failed to create new EVM');
    }
  };

  return {
    method,
    handleDeploycontract,
  };
};

export default useDeployContract;
