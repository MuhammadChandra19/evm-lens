import z from "zod";
import { AbiParameter } from "./types";

const createValidatorForType = (abiType: string): z.ZodString => {
  // Handle uint/int types
  if (abiType.match(/^u?int(\d+)?$/)) {
    return z.string().refine(
      (val) => {
        if (!val) return false;
        const num = Number(val);
        return !isNaN(num) && num >= 0 && Number.isInteger(num);
      },
      {
        message: `Must be a valid ${abiType} (non-negative integer)`,
      },
    );
  }

  // Handle address type
  if (abiType === "address") {
    return z.string().refine(
      (val) => {
        return /^0x[a-fA-F0-9]{40}$/.test(val);
      },
      {
        message:
          "Must be a valid Ethereum address (0x followed by 40 hex characters)",
      },
    );
  }

  // Handle boolean type
  if (abiType === "bool") {
    return z.string().refine(
      (val) => {
        return val === "true" || val === "false" || val === "1" || val === "0";
      },
      {
        message: "Must be 'true', 'false', '1', or '0'",
      },
    );
  }

  // Handle bytes types
  if (abiType.match(/^bytes(\d+)?$/)) {
    return z.string().refine(
      (val) => {
        if (!val.startsWith("0x")) return false;
        const hexPart = val.slice(2);
        return /^[a-fA-F0-9]*$/.test(hexPart);
      },
      {
        message: `Must be valid ${abiType} (hex string starting with 0x)`,
      },
    );
  }

  // Handle string type
  if (abiType === "string") {
    return z.string();
  }

  // Handle array types (simplified - you might want to expand this)
  if (abiType.includes("[]")) {
    return z.string().refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed);
        } catch {
          // Also allow comma-separated values
          return val.includes(",") || val.trim().length > 0;
        }
      },
      {
        message: `Must be a valid array (JSON array or comma-separated values)`,
      },
    );
  }

  // Default fallback
  return z.string();
};

// Function to create dynamic schema based on ABI inputs
export const createFunctionCallSchema = (inputs: AbiParameter[]) => {
  const schemaShape: Record<string, z.ZodString> = {};

  inputs.forEach((input, index) => {
    const fieldName = input.name || `param_${index}`;
    schemaShape[fieldName] = createValidatorForType(input.type);
  });

  return z.object(schemaShape);
};

// export const createFlexibleFunctionCallSchema = (inputs: AbiParameter[]) => {
//   return z.record(z.string()).superRefine((data, ctx) => {
//     inputs.forEach((input, index) => {
//       const fieldName = input.name || `param_${index}`;
//       const value = data[fieldName];

//       if (value === undefined || value === '') {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           path: [fieldName],
//           message: `${fieldName} is required`
//         });
//         return;
//       }

//       // Validate based on type
//       const validator = createValidatorForType(input.type);
//       const result = validator.safeParse(value);

//       if (!result.success) {
//         result.error.issues.forEach(issue => {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: [fieldName],
//             message: issue.message
//           });
//         });
//       }
//     });
//   });
// };

// For your current usage pattern, here's a helper to create the schema
export const FunctionCallSchemaFactory = {
  create: (inputs: AbiParameter[]) => createFunctionCallSchemaTyped(inputs),
  // createFlexible: (inputs: AbiParameter[]) => createFlexibleFunctionCallSchema(inputs),
  createOriginal: (inputs: AbiParameter[]) => createFunctionCallSchema(inputs),
};

// Types
export type FunctionCallForm = Record<string, string>;

// Create a helper to infer the exact type from the schema
export type InferFunctionCallForm<T extends AbiParameter[]> = {
  [K in T[number] as K["name"] extends string
    ? K["name"]
    : `param_${number}`]: string;
};

// Export the schema creation function with proper typing
export const createFunctionCallSchemaTyped = <T extends AbiParameter[]>(
  inputs: T,
) => {
  const schemaShape: Record<string, z.ZodString> = {};

  inputs.forEach((input, index) => {
    const fieldName = input.name || `param_${index}`;
    schemaShape[fieldName] = createValidatorForType(input.type);
  });

  return z.object(schemaShape) as z.ZodType<Record<string, string>>;
};
