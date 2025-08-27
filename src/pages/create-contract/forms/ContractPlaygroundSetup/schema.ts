import * as z from "zod";
import { schema as contratConfigurationSchema } from "./ContractConfiguration/schema";
import { schema as bytecodeAndAbiSchema } from "./BytecodeAndABI/schema";
const contractEVMSchema = z.object({
  contractConfiguration: contratConfigurationSchema,
  bytecodeAndAbi: bytecodeAndAbiSchema,
});

export { contractEVMSchema };

export type ContractEVMSchema = z.infer<typeof contractEVMSchema>;
