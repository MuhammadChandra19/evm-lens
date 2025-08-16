import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContractPlaygroundSchema, contractPlaygroundSchema } from "./schema"
import { DEFAULT_DATA } from './data';

const useDeployContract = () => {
  const method = useForm<ContractPlaygroundSchema>({
    resolver: zodResolver(contractPlaygroundSchema),
    defaultValues: DEFAULT_DATA
  })

  return {
    method
  }
}

export default useDeployContract;
