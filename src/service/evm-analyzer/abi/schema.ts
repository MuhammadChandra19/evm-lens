import { z } from 'zod';
import { AbiParameter } from './types';

const AbiParameterSchema: z.ZodType<AbiParameter> = z.lazy(() =>
  z.object({
    name: z.string().optional(),
    type: z.string(),
    internalType: z.string().optional(),
    indexed: z.boolean().optional(),
    components: z.array(AbiParameterSchema).optional(),
  })
);


// State mutability enum
const StateMutabilitySchema = z.enum([
  'pure',
  'view',
  'nonpayable',
  'payable'
]);

// ABI entry type enum
const AbiTypeSchema = z.enum([
  'function',
  'constructor',
  'event',
  'error',
  'fallback',
  'receive'
]);

// Base ABI entry schema
const BaseAbiEntrySchema = z.object({
  type: AbiTypeSchema,
  name: z.string().optional(),
  anonymous: z.boolean().optional(),
});

// Function ABI entry
const FunctionAbiSchema = BaseAbiEntrySchema.extend({
  type: z.literal('function'),
  name: z.string(),
  inputs: z.array(AbiParameterSchema),
  outputs: z.array(AbiParameterSchema),
  stateMutability: StateMutabilitySchema,
});

// Constructor ABI entry
const ConstructorAbiSchema = BaseAbiEntrySchema.extend({
  type: z.literal('constructor'),
  inputs: z.array(AbiParameterSchema),
  stateMutability: StateMutabilitySchema,
});

// Event ABI entry
const EventAbiSchema = BaseAbiEntrySchema.extend({
  type: z.literal('event'),
  name: z.string(),
  inputs: z.array(AbiParameterSchema),
  anonymous: z.boolean().optional(),
});

// Error ABI entry
const ErrorAbiSchema = BaseAbiEntrySchema.extend({
  type: z.literal('error'),
  name: z.string(),
  inputs: z.array(AbiParameterSchema),
});

// Fallback/Receive ABI entry
const FallbackReceiveAbiSchema = BaseAbiEntrySchema.extend({
  type: z.union([z.literal('fallback'), z.literal('receive')]),
  stateMutability: StateMutabilitySchema,
});

// Complete ABI entry union
export const AbiEntrySchema = z.union([
  FunctionAbiSchema,
  ConstructorAbiSchema,
  EventAbiSchema,
  ErrorAbiSchema,
  FallbackReceiveAbiSchema,
]);

// Full ABI schema (array of entries)
export const AbiSchema = z.array(AbiEntrySchema);

// Specific schemas for different entry types
export const FunctionSchema = FunctionAbiSchema;
export const EventSchema = EventAbiSchema;
export const ConstructorSchema = ConstructorAbiSchema;

export const AbiType = AbiTypeSchema;

// Helper schemas for common validations
export const PayableFunctionSchema = FunctionSchema.refine(
  (fn) => fn.stateMutability === 'payable',
  { message: "Function must be payable" }
);

export const ViewFunctionSchema = FunctionSchema.refine(
  (fn) => fn.stateMutability === 'view' || fn.stateMutability === 'pure',
  { message: "Function must be view or pure" }
);

