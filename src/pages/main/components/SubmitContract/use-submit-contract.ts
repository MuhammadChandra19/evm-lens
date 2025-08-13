import { useEvm } from '@/hooks/use-evm';
import { DeployContractSchema } from '../forms/DeployContract/schema';
import { toast } from 'sonner';

const useSubmitContract = () => {
  const { deployDEXContract } = useEvm();
  const handleSubmit = async (data: DeployContractSchema) => {
    console.log('Form submitted with data:', data);
    try {
      const result = await deployDEXContract(data.contractAddress, data.constructorBytecode, JSON.parse(data.contractMetadata), data.ownerAddress, BigInt(data.totalSupply));

      if (!result) {
        toast.error('Contract deployment failed');
        return;
      }

      if (result.success) {
        toast.success('Contract deployed successfully');
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
