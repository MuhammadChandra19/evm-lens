import * as z from "zod";
import { schema as contratConfigurationSchema } from "./ContractConfiguration/schema";
import { schema as bytecodeAndAbiSchema } from "./BytecodeAndABI/schema";
const contractPlaygroundSchema = z.object({
  contractConfiguration: contratConfigurationSchema,
  bytecodeAndAbi: bytecodeAndAbiSchema,
});

export { contractPlaygroundSchema };

export type ContractPlaygroundSchema = z.infer<typeof contractPlaygroundSchema>;
