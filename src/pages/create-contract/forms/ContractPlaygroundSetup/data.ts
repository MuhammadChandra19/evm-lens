import tokenBytecode from "@/service/evm-analyzer/script/token";
import { ContractEVMSchema } from "./schema";
import abi from "@/service/evm-analyzer/script/test_abi.json";

const DEFAULT_DATA: ContractEVMSchema = {
  contractConfiguration: {
    contractAddress: "0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8",
    ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    decimals: "18",
    projectName: "Test token",
    totalSupply: "1000000",
    initialOwnerBalance: "10",
  },
  bytecodeAndAbi: {
    constructorBytecode: tokenBytecode,
    contractAbi: JSON.stringify(abi),
  },
};

export { DEFAULT_DATA };
