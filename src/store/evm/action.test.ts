/* eslint-disable */
// @ts-nocheck
// Disable all ESLint rules and TypeScript checking for test file to avoid Jest mock type conflicts
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import * as actions from "./action";
import { EVMState } from "./types";
import { ContractMetadata } from "@/service/evm-analyzer/types";
import { Address } from "@ethereumjs/util";
import EVMAnalyzer from "@/service/evm-analyzer";

// Mock EVM Analyzer
jest.mock("@/service/evm-analyzer");

// MockedEVMAnalyzer for potential future use
// const MockedEVMAnalyzer = EVMAnalyzer as jest.MockedClass<typeof EVMAnalyzer>;

// Global mock objects for set and get functions
const mockState: EVMState = {
  constructorBytecode: "0x608060405234801561001057600080fd5b50",
  abi: {} as ContractMetadata,
  totalSupply: BigInt(1000000),
  decimals: 18,
  contractAddress: {
    toString: () => "0x742d35cc6ab4c3c8b9f4c6d5e7f8a9b0c1d2e3f4",
  } as any,
  ownerAddress: {
    toString: () => "0x1234567890123456789012345678901234567890",
  } as any,
  functions: new Map([
    ["balanceOf", { name: "balanceOf", selector: "0x70a08231" } as any],
    ["transfer", { name: "transfer", selector: "0xa9059cbb" } as any],
    ["approve", { name: "approve", selector: "0x095ea7b3" } as any],
    ["addLiquidity", { name: "addLiquidity", selector: "0xe8e33700" } as any],
    [
      "swapEthForTokens",
      { name: "swapEthForTokens", selector: "0x7ff36ab5" } as any,
    ],
    [
      "swapTokensForEth",
      { name: "swapTokensForEth", selector: "0x18cbafe5" } as any,
    ],
    ["tokenReserve", { name: "tokenReserve", selector: "0x3e0a322d" } as any],
    ["ethReserve", { name: "ethReserve", selector: "0x4e91db08" } as any],
    [
      "getEthAmountForTokens",
      { name: "getEthAmountForTokens", selector: "0x95b68fe7" } as any,
    ],
    [
      "getTokenAmountForEth",
      { name: "getTokenAmountForEth", selector: "0x95b68fe8" } as any,
    ],
  ]),
  evm: {
    createAccount: jest.fn(),
    deployContractToAddress: jest.fn(),
    fundAccount: jest.fn(),
    callContract: jest.fn(),
    deployContract: jest.fn(),
    stateManagerService: {
      stateManager: {
        putStorage: jest.fn(),
      },
    },
  } as any,
};

const mockSet = jest.fn() as any;
const mockGet = jest.fn(() => mockState) as any;

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockReturnValue(mockState);
});

describe("Action", () => {
  describe("createNewEVM", () => {
    test("should successfully create a new EVM with valid payload", async () => {
      const payload = {
        contractAddress: "0x742d35cc6ab4c3c8b9f4c6d5e7f8a9b0c1d2e3f4",
        constructorBytecode: "0x608060405234801561001057600080fd5b50",
        abi: {} as ContractMetadata,
        ownerAddress: "0x1234567890123456789012345678901234567890",
        totalSupply: BigInt(1000000),
        decimals: 18,
      };

      (mockState.evm!.createAccount as jest.Mock).mockResolvedValue({
        toString: () => "0x742d35cc6ab4c3c8b9f4c6d5e7f8a9b0c1d2e3f4",
      });
      (mockState.evm!.deployContractToAddress as jest.Mock).mockResolvedValue(
        {},
      );

      const result = await actions.createNewEVM(payload, mockSet, mockGet);

      expect(result.success).toBe(true);
      expect(result.error).toBe(null);
      expect(mockState.evm!.createAccount).toHaveBeenCalledWith(
        payload.contractAddress,
      );
      expect(mockSet).toHaveBeenCalled();
    });

    test("should return error when EVM is not initialized", async () => {
      const payload = {
        contractAddress: "0x742d35cc6ab4c3c8b9f4c6d5e7f8a9b0c1d2e3f4",
        constructorBytecode: "0x608060405234801561001057600080fd5b50",
        abi: {} as ContractMetadata,
        ownerAddress: "0x1234567890123456789012345678901234567890",
        totalSupply: BigInt(1000000),
        decimals: 18,
      };

      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.createNewEVM(payload, mockSet, mockGet);

      expect(result.success).toBe(false);
      expect(result.error).toBe("EVM not initialized");
    });

    test("should handle deployment errors gracefully", async () => {
      const payload = {
        contractAddress: "0x742d35cc6ab4c3c8b9f4c6d5e7f8a9b0c1d2e3f4",
        constructorBytecode: "0x608060405234801561001057600080fd5b50",
        abi: {} as ContractMetadata,
        ownerAddress: "0x1234567890123456789012345678901234567890",
        totalSupply: BigInt(1000000),
        decimals: 18,
      };

      (mockState.evm!.createAccount as jest.Mock).mockRejectedValue(
        new Error("Deployment failed"),
      );

      const result = await actions.createNewEVM(payload, mockSet, mockGet);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe("createAccount", () => {
    test("should successfully create an account", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const expectedAddress = {
        toString: () => "0x1234567890123456789012345678901234567890",
      };

      (mockState.evm!.createAccount as jest.Mock).mockResolvedValue(
        expectedAddress,
      );

      const result = await actions.createAccount(address, mockGet);

      expect(result).toEqual(expectedAddress);
      expect(mockState.evm!.createAccount).toHaveBeenCalledWith(address);
    });

    test("should return null when EVM is not initialized", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.createAccount(address, mockGet);

      expect(result).toBe(null);
    });
  });

  describe("fundAccount", () => {
    test("should successfully fund an account", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const balance = BigInt("1000000000000000000");

      (mockState.evm!.fundAccount as jest.Mock).mockResolvedValue({});

      const result = await actions.fundAccount(address, balance, mockGet);

      expect(result.success).toBe(true);
      expect(result.error).toBe(null);
      expect(mockState.evm!.fundAccount).toHaveBeenCalledWith(address, balance);
    });

    test("should return error when EVM is not initialized", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const balance = BigInt("1000000000000000000");

      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.fundAccount(address, balance, mockGet);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("should handle funding errors gracefully", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const balance = BigInt("1000000000000000000");

      (mockState.evm!.fundAccount as jest.Mock).mockRejectedValue(
        new Error("Funding failed"),
      );

      const result = await actions.fundAccount(address, balance, mockGet);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe("getTokenBalance", () => {
    test("should successfully get token balance", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      const mockCallResult = {
        returnValue: new Uint8Array(32).fill(0),
      };
      // Set the last byte to 1 to represent balance of 1
      mockCallResult.returnValue[31] = 1;

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue(
        mockCallResult,
      );

      const result = await actions.getTokenBalance(userAddress, mockGet);

      expect(result).toBe(BigInt(1));
      expect(mockState.evm!.callContract).toHaveBeenCalled();
    });

    test("should return zero when EVM is not initialized", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.getTokenBalance(userAddress, mockGet);

      expect(result).toBe(BigInt(0));
    });

    test("should return zero when contract address is not set", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      mockGet.mockReturnValue({ ...mockState, contractAddress: undefined });

      const result = await actions.getTokenBalance(userAddress, mockGet);

      expect(result).toBe(BigInt(0));
    });

    test("should return zero when functions map is not available", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      mockGet.mockReturnValue({ ...mockState, functions: undefined });

      const result = await actions.getTokenBalance(userAddress, mockGet);

      expect(result).toBe(BigInt(0));
    });

    test("should return zero when balanceOf function is not found", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const functionsWithoutBalance = new Map(mockState.functions);
      functionsWithoutBalance.delete("balanceOf");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutBalance,
      });

      const result = await actions.getTokenBalance(userAddress, mockGet);

      expect(result).toBe(BigInt(0));
    });
  });

  describe("transferTokens", () => {
    test("should successfully transfer tokens", async () => {
      const fromAddress = "0x1234567890123456789012345678901234567890";
      const toAddress = "0x0987654321098765432109876543210987654321";
      const amount = BigInt("1000000000000000000");

      const mockResult = { success: true };
      (mockState.evm!.callContract as jest.Mock).mockResolvedValue(mockResult);

      const result = await actions.transferTokens(
        fromAddress,
        toAddress,
        amount,
        mockGet,
      );

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.callContract).toHaveBeenCalled();
    });

    test("should return null when EVM is not initialized", async () => {
      const fromAddress = "0x1234567890123456789012345678901234567890";
      const toAddress = "0x0987654321098765432109876543210987654321";
      const amount = BigInt("1000000000000000000");

      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.transferTokens(
        fromAddress,
        toAddress,
        amount,
        mockGet,
      );

      expect(result).toBe(null);
    });

    test("should return null when contract address is not set", async () => {
      const fromAddress = "0x1234567890123456789012345678901234567890";
      const toAddress = "0x0987654321098765432109876543210987654321";
      const amount = BigInt("1000000000000000000");

      mockGet.mockReturnValue({ ...mockState, contractAddress: undefined });

      const result = await actions.transferTokens(
        fromAddress,
        toAddress,
        amount,
        mockGet,
      );

      expect(result).toBe(null);
    });

    test("should return null when transfer function is not found", async () => {
      const fromAddress = "0x1234567890123456789012345678901234567890";
      const toAddress = "0x0987654321098765432109876543210987654321";
      const amount = BigInt("1000000000000000000");

      const functionsWithoutTransfer = new Map(mockState.functions);
      functionsWithoutTransfer.delete("transfer");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutTransfer,
      });

      const result = await actions.transferTokens(
        fromAddress,
        toAddress,
        amount,
        mockGet,
      );

      expect(result).toBe(null);
    });
  });

  describe("deployContract", () => {
    test("should successfully deploy contract", async () => {
      const bytecode = "0x608060405234801561001057600080fd5b50";
      const mockResult = {
        contractAddress: "0x1234567890123456789012345678901234567890",
      };

      (mockState.evm!.deployContract as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await actions.deployContract(bytecode, mockGet);

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.deployContract).toHaveBeenCalledWith(bytecode);
    });

    test("should return null when EVM is not initialized", async () => {
      const bytecode = "0x608060405234801561001057600080fd5b50";
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.deployContract(bytecode, mockGet);

      expect(result).toBe(null);
    });
  });

  describe("deployContractToAddress", () => {
    test("should successfully deploy contract to specific address", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const bytecode = "0x608060405234801561001057600080fd5b50";
      const mockResult = { success: true };

      (mockState.evm!.deployContractToAddress as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await actions.deployContractToAddress(
        address,
        bytecode,
        mockGet,
      );

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.deployContractToAddress).toHaveBeenCalledWith(
        address,
        bytecode,
      );
    });

    test("should return null when EVM is not initialized", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const bytecode = "0x608060405234801561001057600080fd5b50";
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.deployContractToAddress(
        address,
        bytecode,
        mockGet,
      );

      expect(result).toBe(null);
    });
  });

  describe("callContract", () => {
    test("should successfully call contract", async () => {
      const txData = {
        from: "0x1234567890123456789012345678901234567890",
        to: "0x0987654321098765432109876543210987654321",
        value: BigInt(0),
        data: "0x70a08231",
        gasLimit: BigInt(100000),
      };
      const mockResult = { success: true };

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue(mockResult);

      const result = await actions.callContract(txData, mockGet);

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.callContract).toHaveBeenCalledWith(txData);
    });

    test("should return null when EVM is not initialized", async () => {
      const txData = {
        from: "0x1234567890123456789012345678901234567890",
        to: "0x0987654321098765432109876543210987654321",
        value: BigInt(0),
        data: "0x70a08231",
        gasLimit: BigInt(100000),
      };
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.callContract(txData, mockGet);

      expect(result).toBe(null);
    });
  });

  describe("approveTokens", () => {
    test("should successfully approve tokens", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const spenderAddress = "0x0987654321098765432109876543210987654321";
      const amount = BigInt("1000000000000000000");
      const mockResult = { success: true };

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue(mockResult);

      const result = await actions.approveTokens(
        userAddress,
        spenderAddress,
        amount,
        mockGet,
      );

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.callContract).toHaveBeenCalled();
    });

    test("should return null when EVM is not initialized", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const spenderAddress = "0x0987654321098765432109876543210987654321";
      const amount = BigInt("1000000000000000000");

      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.approveTokens(
        userAddress,
        spenderAddress,
        amount,
        mockGet,
      );

      expect(result).toBe(null);
    });

    test("should return null when approve function is not found", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const spenderAddress = "0x0987654321098765432109876543210987654321";
      const amount = BigInt("1000000000000000000");

      const functionsWithoutApprove = new Map(mockState.functions);
      functionsWithoutApprove.delete("approve");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutApprove,
      });

      const result = await actions.approveTokens(
        userAddress,
        spenderAddress,
        amount,
        mockGet,
      );

      expect(result).toBe(null);
    });
  });

  describe("addLiquidity", () => {
    test("should successfully add liquidity", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const tokenAmount = BigInt("1000000000000000000");
      const ethAmount = BigInt("1000000000000000000");
      const mockResult = { success: true };

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue(mockResult);

      const result = await actions.addLiquidity(
        userAddress,
        tokenAmount,
        ethAmount,
        mockGet,
      );

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.callContract).toHaveBeenCalledTimes(2); // approve + addLiquidity
    });

    test("should return null when EVM is not initialized", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const tokenAmount = BigInt("1000000000000000000");
      const ethAmount = BigInt("1000000000000000000");

      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.addLiquidity(
        userAddress,
        tokenAmount,
        ethAmount,
        mockGet,
      );

      expect(result).toBe(null);
    });

    test("should return null when addLiquidity function is not found", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const tokenAmount = BigInt("1000000000000000000");
      const ethAmount = BigInt("1000000000000000000");

      const functionsWithoutAddLiquidity = new Map(mockState.functions);
      functionsWithoutAddLiquidity.delete("addLiquidity");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutAddLiquidity,
      });

      const result = await actions.addLiquidity(
        userAddress,
        tokenAmount,
        ethAmount,
        mockGet,
      );

      expect(result).toBe(null);
    });
  });

  describe("swapEthForTokens", () => {
    test("should successfully swap ETH for tokens", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const ethAmount = BigInt("1000000000000000000");
      const mockResult = { success: true };

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue(mockResult);

      const result = await actions.swapEthForTokens(
        userAddress,
        ethAmount,
        mockGet,
      );

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.callContract).toHaveBeenCalled();
    });

    test("should return null when EVM is not initialized", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const ethAmount = BigInt("1000000000000000000");

      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.swapEthForTokens(
        userAddress,
        ethAmount,
        mockGet,
      );

      expect(result).toBe(null);
    });

    test("should return null when swapEthForTokens function is not found", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const ethAmount = BigInt("1000000000000000000");

      const functionsWithoutSwap = new Map(mockState.functions);
      functionsWithoutSwap.delete("swapEthForTokens");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutSwap,
      });

      const result = await actions.swapEthForTokens(
        userAddress,
        ethAmount,
        mockGet,
      );

      expect(result).toBe(null);
    });
  });

  describe("swapTokensForEth", () => {
    test("should successfully swap tokens for ETH", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const tokenAmount = BigInt("1000000000000000000");
      const mockResult = { success: true };

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue(mockResult);

      const result = await actions.swapTokensForEth(
        userAddress,
        tokenAmount,
        mockGet,
      );

      expect(result).toEqual(mockResult);
      expect(mockState.evm!.callContract).toHaveBeenCalled();
    });

    test("should return null when EVM is not initialized", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const tokenAmount = BigInt("1000000000000000000");

      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.swapTokensForEth(
        userAddress,
        tokenAmount,
        mockGet,
      );

      expect(result).toBe(null);
    });

    test("should return null when swapTokensForEth function is not found", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const tokenAmount = BigInt("1000000000000000000");

      const functionsWithoutSwap = new Map(mockState.functions);
      functionsWithoutSwap.delete("swapTokensForEth");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutSwap,
      });

      const result = await actions.swapTokensForEth(
        userAddress,
        tokenAmount,
        mockGet,
      );

      expect(result).toBe(null);
    });
  });

  describe("getReserves", () => {
    test("should successfully get reserves", async () => {
      const mockTokenReserve = new Uint8Array(32).fill(0);
      mockTokenReserve[31] = 100; // 100 tokens
      const mockEthReserve = new Uint8Array(32).fill(0);
      mockEthReserve[31] = 50; // 50 ETH

      const mockTokenResult = { returnValue: mockTokenReserve };
      const mockEthResult = { returnValue: mockEthReserve };

      (mockState.evm!.callContract as jest.Mock)
        .mockResolvedValueOnce(mockTokenResult)
        .mockResolvedValueOnce(mockEthResult);

      const result = await actions.getReserves(mockGet);

      expect(result.tokenReserve).toBe(BigInt(100));
      expect(result.ethReserve).toBe(BigInt(50));
      expect(mockState.evm!.callContract).toHaveBeenCalledTimes(2);
    });

    test("should return zero reserves when EVM is not initialized", async () => {
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.getReserves(mockGet);

      expect(result.tokenReserve).toBe(BigInt(0));
      expect(result.ethReserve).toBe(BigInt(0));
    });

    test("should return zero reserves when reserve functions are not found", async () => {
      const functionsWithoutReserves = new Map(mockState.functions);
      functionsWithoutReserves.delete("tokenReserve");
      functionsWithoutReserves.delete("ethReserve");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutReserves,
      });

      const result = await actions.getReserves(mockGet);

      expect(result.tokenReserve).toBe(BigInt(0));
      expect(result.ethReserve).toBe(BigInt(0));
    });
  });

  describe("getTokenPrice", () => {
    test("should successfully calculate token price", async () => {
      const mockTokenReserve = new Uint8Array(32).fill(0);
      mockTokenReserve[31] = 100; // 100 tokens
      const mockEthReserve = new Uint8Array(32).fill(0);
      mockEthReserve[31] = 50; // 50 ETH

      const mockTokenResult = { returnValue: mockTokenReserve };
      const mockEthResult = { returnValue: mockEthReserve };

      (mockState.evm!.callContract as jest.Mock)
        .mockResolvedValueOnce(mockTokenResult)
        .mockResolvedValueOnce(mockEthResult);

      const result = await actions.getTokenPrice(mockGet);

      expect(result).toBeGreaterThan(0);
    });

    test("should return zero when reserves are zero", async () => {
      const mockZeroResult = { returnValue: new Uint8Array(32).fill(0) };

      (mockState.evm!.callContract as jest.Mock)
        .mockResolvedValueOnce(mockZeroResult)
        .mockResolvedValueOnce(mockZeroResult);

      const result = await actions.getTokenPrice(mockGet);

      expect(result).toBe(0);
    });
  });

  describe("getEthAmountForTokens", () => {
    test("should successfully get ETH amount for tokens", async () => {
      const tokenAmount = BigInt("1000000000000000000");
      const mockResult = new Uint8Array(32).fill(0);
      mockResult[31] = 50; // 50 ETH

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue({
        returnValue: mockResult,
      });

      const result = await actions.getEthAmountForTokens(tokenAmount, mockGet);

      expect(result).toBe(BigInt(50));
      expect(mockState.evm!.callContract).toHaveBeenCalled();
    });

    test("should return zero when EVM is not initialized", async () => {
      const tokenAmount = BigInt("1000000000000000000");
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.getEthAmountForTokens(tokenAmount, mockGet);

      expect(result).toBe(BigInt(0));
    });

    test("should return zero when getEthAmountForTokens function is not found", async () => {
      const tokenAmount = BigInt("1000000000000000000");
      const functionsWithoutGetEth = new Map(mockState.functions);
      functionsWithoutGetEth.delete("getEthAmountForTokens");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutGetEth,
      });

      const result = await actions.getEthAmountForTokens(tokenAmount, mockGet);

      expect(result).toBe(BigInt(0));
    });
  });

  describe("getTokenAmountForEth", () => {
    test("should successfully get token amount for ETH", async () => {
      const ethAmount = BigInt("1000000000000000000");
      const mockResult = new Uint8Array(32).fill(0);
      mockResult[31] = 100; // 100 tokens

      (mockState.evm!.callContract as jest.Mock).mockResolvedValue({
        returnValue: mockResult,
      });

      const result = await actions.getTokenAmountForEth(ethAmount, mockGet);

      expect(result).toBe(BigInt(100));
      expect(mockState.evm!.callContract).toHaveBeenCalled();
    });

    test("should return zero when EVM is not initialized", async () => {
      const ethAmount = BigInt("1000000000000000000");
      mockGet.mockReturnValue({ ...mockState, evm: undefined });

      const result = await actions.getTokenAmountForEth(ethAmount, mockGet);

      expect(result).toBe(BigInt(0));
    });

    test("should return zero when getTokenAmountForEth function is not found", async () => {
      const ethAmount = BigInt("1000000000000000000");
      const functionsWithoutGetToken = new Map(mockState.functions);
      functionsWithoutGetToken.delete("getTokenAmountForEth");
      mockGet.mockReturnValue({
        ...mockState,
        functions: functionsWithoutGetToken,
      });

      const result = await actions.getTokenAmountForEth(ethAmount, mockGet);

      expect(result).toBe(BigInt(0));
    });
  });
});
