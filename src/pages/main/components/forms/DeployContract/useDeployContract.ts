import { DeployContractSchema, schema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useDeployContract = () => {
  const method = useForm<DeployContractSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractAddress: '',
      constructorBytecode: '',
      contractMetadata: '',
      ownerAddress: '',
      totalSupply: '',
    },
  });

  return {
    method,
  };
};
