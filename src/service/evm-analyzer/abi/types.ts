import { z } from 'zod';
import { AbiEntrySchema, AbiSchema, AbiType, ConstructorSchema, EventSchema, FunctionSchema } from './schema';
export type AbiParameter = {
  name?: string;
  type: string;
  internalType?: string;
  indexed?: boolean;
  components?: AbiParameter[];
};

// Type inference
export type Abi = z.infer<typeof AbiSchema>;
export type AbiEntry = z.infer<typeof AbiEntrySchema>;
export type AbiFunction = z.infer<typeof FunctionSchema>;
export type AbiType = z.infer<typeof AbiType>;
export type AbiEvent = z.infer<typeof EventSchema>;
export type AbiConstructor = z.infer<typeof ConstructorSchema>;
