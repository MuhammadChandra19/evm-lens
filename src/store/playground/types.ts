import EVMAnalyzer from '@/service/evm-analyzer';
import { ContractMetadata, FunctionInfo } from '@/service/evm-analyzer/types';
import { Address } from '@ethereumjs/util';

export type PlaygroundState = {
  contractAddress?: Address;
  constructorBytecode: string;
  abi: ContractMetadata;
  functions?: Map<string | undefined, FunctionInfo>;
  ownerAddress?: Address;
  totalSupply: bigint;
  decimals: number;
  evm?: EVMAnalyzer
};

export type CreateNewPlaygroundPayload = {
  contractAddress: string;
  constructorBytecode: string;
  abi: ContractMetadata;
  ownerAddress: string;
  totalSupply: bigint;
  decimals: number;
}

export type PlaygroundAction = {
  createInitialState: (state: PlaygroundState) => void;
  createNewPlayground: (payload: CreateNewPlaygroundPayload) => Promise<{
    success: boolean;
    error: unknown;
  }>,
  createAccount: (address: string) => Promise<Address | null>
};

export type PlaygroundStore = PlaygroundState & PlaygroundAction
