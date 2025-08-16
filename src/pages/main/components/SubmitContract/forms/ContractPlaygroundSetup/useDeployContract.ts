import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractEVMSchema, contractEVMSchema } from "./schema";
import { DEFAULT_DATA } from "./data";
import useEVMStore from "@/store/evm";
import { toast } from "sonner";
import { ErrorEVM } from "@/store/evm/errors";

const useDeployContract = () => {
  const deployContract = useEVMStore(
    (store) => store.createNewEVM,
  );
  const method = useForm<ContractEVMSchema>({
    resolver: zodResolver(contractEVMSchema),
    defaultValues: DEFAULT_DATA,
  });

  const handleDeploycontract = async (payload: ContractEVMSchema) => {
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

      toast.error("failed to create new EVM", {
        description: res.error as ErrorEVM,
      });
    } catch (e) {
      console.error(e);
      toast.error("failed to create new EVM");
    }
  };

  return {
    method,
    handleDeploycontract,
  };
};

export default useDeployContract;
