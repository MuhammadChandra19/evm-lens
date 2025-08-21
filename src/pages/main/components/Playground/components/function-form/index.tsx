import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import useFunctionForm from "./use-function-form";
import { FormProvider } from "react-hook-form";
import FunctionInput from "./fuction-input";
import { FunctionCallForm } from "@/service/evm-analyzer/abi/schema-validator";

type Props = {
  abiFunction: AbiFunction;
};
const FunctionForm = ({ abiFunction }: Props) => {
  const { method } = useFunctionForm(abiFunction);

  const handleSubmit = (data: FunctionCallForm) => {
    console.log(data);
  };

  return (
    <FormProvider {...method}>
      <form
        className="w-full grid grid-cols-2 gap-4"
        onSubmit={method.handleSubmit(handleSubmit)}
      >
        <Card className="@container/card col-span-1">
          <CardHeader>
            <CardTitle>Function</CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:block">
                Funtion: {abiFunction.name}
              </span>
              <span className="@[540px]/card:hidden">{abiFunction.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-2 sm:px-6 sm:pt-2">
            <FunctionInput abiFunction={abiFunction} />
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};
export default FunctionForm;
