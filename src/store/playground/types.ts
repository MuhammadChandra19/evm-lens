import { ContractMetadata } from '@/service/evm-analyzer/types';

export type PlaygroundState = {
  contractAddress: string;
  constructorBytecode: string;
  contractMetadata: ContractMetadata;
  ownerAddress: string;
  totalSupply: bigint;
};

export type PlaygroundAction = {
  createInitialState: (state: PlaygroundState) => void;
};
