import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractPlaygroundSchema, contractPlaygroundSchema } from "./schema";
import { DEFAULT_DATA } from "./data";
import usePlaygroundStore from "@/store/playground";
import { toast } from "sonner";
import { ErrorPlayground } from "@/store/playground/errors";

const useDeployContract = () => {
  const deployContract = usePlaygroundStore(
    (store) => store.createNewPlayground,
  );
  const method = useForm<ContractPlaygroundSchema>({
    resolver: zodResolver(contractPlaygroundSchema),
    defaultValues: DEFAULT_DATA,
  });

  const handleDeploycontract = async (payload: ContractPlaygroundSchema) => {
    try {
      const res = await deployContract({
        abi: JSON.parse(payload.bytecodeAndAbi.contractAbi),
        constructorBytecode: payload.bytecodeAndAbi.constructorBytecode,
        contractAddress: payload.contractConfiguration.contractAddress,
        decimals: parseInt(payload.contractConfiguration.decimals, 10),
        ownerAddress: payload.contractConfiguration.ownerAddress,
        totalSupply: BigInt(payload.contractConfiguration.decimals),
      });

      if (res.success) {
        console.log(res);
        return;
      }

      toast.error("failed to create new playground", {
        description: res.error as ErrorPlayground,
      });
    } catch (e) {
      console.error(e);
      toast.error("failed to create new playground");
    }
  };

  return {
    method,
    handleDeploycontract,
  };
};

export default useDeployContract;
