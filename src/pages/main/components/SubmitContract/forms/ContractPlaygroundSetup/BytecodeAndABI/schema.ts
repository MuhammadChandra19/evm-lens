import * as z from "zod";

const schema = z.object({
  constructorBytecode: z.string().min(1),
  contractAbi: z.string().min(1),
});

type BytecodeAndABISchema = z.infer<typeof schema>;

export { schema, type BytecodeAndABISchema };
