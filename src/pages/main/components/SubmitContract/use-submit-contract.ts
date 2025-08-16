import { useEvm } from '@/hooks/use-evm';
import { DeployContractSchema } from './forms/DeployContract/schema';
import { toast } from 'sonner';
import usePlaygroundStore from '@/store/playground';

const useSubmitContract = () => {
  const { deployDEXContract } = useEvm();
  const createInitialState = usePlaygroundStore((state) => state.createInitialState);
  const handleSubmit = async (data: DeployContractSchema) => {
    try {
      const result = await deployDEXContract(data.contractAddress, data.constructorBytecode, JSON.parse(data.contractMetadata), data.ownerAddress, BigInt(data.totalSupply));

      if (!result) {
        toast.error('Contract deployment failed');
        return;
      }

      if (result.success) {
        toast.success('Contract deployed successfully');
        createInitialState({
          contractAddress: data.contractAddress,
          constructorBytecode: data.constructorBytecode,
          abi: JSON.parse(data.contractMetadata),
          ownerAddress: data.ownerAddress,
          totalSupply: BigInt(data.totalSupply),
        });
      } else {
        toast.error('Contract deployment failed');
      }
    } catch (e) {
      toast.error('Contract deployment failed', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  };

  return {
    handleSubmit,
  };
};

export default useSubmitContract;
