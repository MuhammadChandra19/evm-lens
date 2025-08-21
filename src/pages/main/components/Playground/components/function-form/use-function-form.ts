import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import { useEffect } from "react";
import {
  FunctionCallForm,
  FunctionCallSchemaFactory,
} from "@/service/evm-analyzer/abi/schema-validator";

const useFunctionForm = (abiFunction: AbiFunction) => {
  const schema = FunctionCallSchemaFactory.create(abiFunction.inputs);
  const method = useForm<FunctionCallForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    reValidateMode: "onChange",
  });

  useEffect(() => {
    method.reset();
  }, [abiFunction.name]);

  return {
    method,
  };
};

export default useFunctionForm;
