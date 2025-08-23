import * as z from 'zod';

const schema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  contractAddress: z.string().min(1, 'Contract address is required'),
  ownerAddress: z.string().min(1, 'Owner address is required'),
  initialOwnerBalance: z
    .string()
    .min(1, 'Initial balance is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Initial balance must be a positive number',
    }),
  totalSupply: z
    .string()
    .min(1, 'Total supply is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Total supply must be a positive number',
    }),
  decimals: z
    .string()
    .min(1, 'Decimals is required')
});

type ContractConfigurationSchema = z.infer<typeof schema>;

export { schema, type ContractConfigurationSchema };