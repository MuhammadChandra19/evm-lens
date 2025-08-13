import { create } from 'zustand';
import { PlaygroundState, PlaygroundAction } from './types';
import { ContractMetadata } from '@/service/evm-analyzer/types';

const usePlaygroundStore = create<PlaygroundState & PlaygroundAction>((set) => ({
  contractAddress: '',
  constructorBytecode: '',
  contractMetadata: {} as ContractMetadata,
  ownerAddress: '',
  totalSupply: BigInt(0),
  createInitialState: (state) => set(state),
}));

export default usePlaygroundStore;
