import * as z from 'zod';

const schema = z.object({
  contractAddress: z.string().min(1),
  constructorBytecode: z.string().min(1),
  contractMetadata: z.string().min(1),
  ownerAddress: z.string().min(1),
  totalSupply: z
    .string()
    .min(1, 'Total supply is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Total supply must be a positive number',
    }),
});

type DeployContractSchema = z.infer<typeof schema>;

export { schema, type DeployContractSchema };
