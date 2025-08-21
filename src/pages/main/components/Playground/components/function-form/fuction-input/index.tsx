import { useFormContext } from "react-hook-form";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FunctionCallForm } from "@/service/evm-analyzer/abi/schema-validator";

type Props = {
  abiFunction: AbiFunction;
};
const FunctionInput = ({ abiFunction }: Props) => {
  const { control } = useFormContext<FunctionCallForm>();

  return (
    <div className="flex flex-col gap-2">
      {abiFunction.inputs.map((input, idx) => {
        const fieldName = input.name || `param_${idx}`;
        return (
          <div key={idx} className="w-full">
            <FormField
              control={control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{input.name}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={getPlaceholderForType(
                        input.type,
                        input.name,
                      )}
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
      })}
      <Button
        type="submit"
        size="lg"
        className="w-full cursor-pointer"
        variant="outline"
      >
        {" "}
        ⚡️ Execute
      </Button>
    </div>
  );
};

// Helper function for placeholders
function getPlaceholderForType(abiType: string, name?: string): string {
  if (abiType.match(/^u?int(\d+)?$/)) {
    return `Enter ${name || "number"} (e.g., 1000)`;
  }
  if (abiType === "address") {
    return `Enter ${name || "address"} (e.g., 0x742d35Cc...)`;
  }
  if (abiType === "bool") {
    return `Enter ${name || "boolean"} (true/false)`;
  }
  if (abiType.match(/^bytes(\d+)?$/)) {
    return `Enter ${name || "bytes"} (e.g., 0x1234...)`;
  }
  return `Enter ${name || "value"}`;
}

export default FunctionInput;
