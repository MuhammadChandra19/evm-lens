/**
 * Example usage of EVMAdapter in components
 * This file demonstrates how to use the EVMAdapter in your React components
 */

import { useEVMAdapter } from "@/hooks/use-evm-adapter";
import { CreateNewEVMPayload } from "@/service/evm-adapter/types";
import { Address } from "@ethereumjs/util";

// Example: Deploy Contract Component
export const DeployContractExample = () => {
  const evmAdapter = useEVMAdapter();

  const handleDeployContract = async () => {
    const payload: CreateNewEVMPayload = {
      id: 1,
      projectName: "My Token",
      contractAddress: "0x1234567890123456789012345678901234567890",
      constructorBytecode: "0x608060405234801561001057600080fd5b50...",
      abi: [], // Your ABI here
      ownerAddress: "0x0987654321098765432109876543210987654321",
      decimal: 18,
      totalSupply: 1000000,
      initialOwnerBalance: 1000n,
    };

    const result = await evmAdapter.deployContract(payload, 1);

    if (result.success) {
      console.log("Contract deployed successfully:", result.data);
    } else {
      console.error("Deployment failed:", result.error);
    }
  };

  return <button onClick={handleDeployContract}>Deploy Contract</button>;
};

// Example: Create Account Component
export const CreateAccountExample = () => {
  const evmAdapter = useEVMAdapter();

  const handleCreateAccount = async () => {
    const result = await evmAdapter.createAccount(
      "0x1111111111111111111111111111111111111111",
      1, // playgroundId
    );

    if (result.success) {
      console.log("Account created:", result.data);
    } else {
      console.error("Account creation failed:", result.error);
    }
  };

  return <button onClick={handleCreateAccount}>Create Account</button>;
};

// Example: Fund Account Component
export const FundAccountExample = () => {
  const evmAdapter = useEVMAdapter();

  const handleFundAccount = async () => {
    const address = new Address(
      Buffer.from("1111111111111111111111111111111111111111", "hex"),
    );
    const amount = 1000000000000000000n; // 1 ETH in wei

    const result = await evmAdapter.fundAccount(address, amount, 1);

    if (result.success) {
      console.log("Account funded:", result.data);
    } else {
      console.error("Funding failed:", result.error);
    }
  };

  return <button onClick={handleFundAccount}>Fund Account</button>;
};

// Example: Call Function Component
export const CallFunctionExample = () => {
  const evmAdapter = useEVMAdapter();

  const handleCallFunction = async () => {
    const txData = {
      executorAddress: new Address(
        Buffer.from("0987654321098765432109876543210987654321", "hex"),
      ),
      func: {
        name: "transfer",
        type: "function",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
      },
      type: "function" as const,
      args: [
        "0x1111111111111111111111111111111111111111",
        "1000000000000000000",
      ],
      gasLimit: 100000,
      ethAmount: 0n,
    };

    const result = await evmAdapter.callFunction(txData, 1);

    if (result.success) {
      console.log("Function called successfully:", result.data);
    } else {
      console.error("Function call failed:", result.error);
    }
  };

  return <button onClick={handleCallFunction}>Call Transfer Function</button>;
};
