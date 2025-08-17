import * as z from "zod";

const schema = z.object({
  contractAddress: z.string().min(1),
  ownerAddress: z.string().min(1),
});

type ContractConfigurationSchema = z.infer<typeof schema>;

export { schema, type ContractConfigurationSchema };
