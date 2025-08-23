import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractEVMSchema, contractEVMSchema } from "./schema";
import { DEFAULT_DATA } from "./data";
import useEVMStore from "@/store/evm";
import { toast } from "sonner";
import { ERRORS } from "@/store/evm/errors";
import { AbiValidator } from "@/service/evm-analyzer/abi";
import { Abi } from "@/service/evm-analyzer/abi/types";

const useDeployContract = () => {
  const deployContract = useEVMStore((store) => store.deployContractToEVM);
  const method = useForm<ContractEVMSchema>({
    resolver: zodResolver(contractEVMSchema),
    defaultValues: DEFAULT_DATA,
  });

  const validateAbi = (abiStr: string): Abi | undefined => {
    try {
      const abiJson = JSON.parse(abiStr);
      const abi = new AbiValidator(abiJson);

      return abi.getAbi();
    } catch (e) {
      method.setError("bytecodeAndAbi.contractAbi", {
        message: "invalid abi",
      });
      console.error(e);
    }
  };

  const handleDeploycontract = async (payload: ContractEVMSchema) => {
    try {
      const abi = validateAbi(payload.bytecodeAndAbi.contractAbi);
      if (!abi) {
        toast.error("failed to create new EVM", {
          description: "Invalid Abi",
        });
        return;
      }

      const res = await deployContract({
        abi,
        contractAddress: payload.contractConfiguration.contractAddress,
        constructorBytecode: payload.bytecodeAndAbi.constructorBytecode,
        ownerAddress: payload.contractConfiguration.ownerAddress,
        decimal: parseInt(payload.contractConfiguration.decimals),
        initialOwnerBalance: BigInt(
          payload.contractConfiguration.initialOwnerBalance,
        ),
        totalSupply: parseInt(payload.contractConfiguration.totalSupply),
        projectName: payload.contractConfiguration.projectName,
      });

      if (!res || !res.success) {
        toast.error("failed to create new EVM", {
          description: ERRORS.EVM_NOT_INITIALIZED,
        });

        return;
      }

      if (res.success) {
        console.log(res);
        return;
      }
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
