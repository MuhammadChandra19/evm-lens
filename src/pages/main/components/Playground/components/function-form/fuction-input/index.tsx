import { FormProvider, useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FunctionCallForm,
  FunctionCallSchemaFactory,
} from "@/service/evm-analyzer/abi/schema-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import usePlayground from "../../../use-playground";
import { AbiParameter } from "@/service/evm-analyzer/abi/types";

const FunctionInput = () => {
  const { activeFunction: abiFunction, handleExecute } = usePlayground();
  const createFactory = () => {
    const result: AbiParameter[] = [];
    if (abiFunction!.inputs.length > 0) {
      result.push(...abiFunction!.inputs);
    }

    if (abiFunction!.stateMutability === "payable") {
      result.push({ name: "ethAmount", type: "uint256" });
    }

    console.log(result);

    return result;
  };
  const schema = FunctionCallSchemaFactory.create(createFactory());
  const method = useForm<FunctionCallForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    reValidateMode: "onChange",
  });

  const handleSubmit = (data: FunctionCallForm) => {
    console.log(data);
    try {
      handleExecute(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    method.reset();
  }, [abiFunction!.name]);

  return (
    <Card className="@container/card col-span-1">
      <CardHeader>
        <CardTitle>Function</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Funtion: {abiFunction!.name}
          </span>
          <span className="@[540px]/card:hidden">{abiFunction!.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-2">
        <FormProvider {...method}>
          <form
            onSubmit={method.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            {abiFunction!.inputs.map((input, idx) => {
              const fieldName = input.name || `param_${idx}`;
              return (
                <div key={idx} className="w-full">
                  <FormField
                    control={method.control}
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
            {abiFunction!.stateMutability === "payable" && (
              <div className="w-full">
                <FormField
                  control={method.control}
                  name="ethAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eth Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter eth amount (e.g., 1000)"
                          {...field}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full cursor-pointer"
              variant="outline"
            >
              {" "}
              ⚡️ Execute
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
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
