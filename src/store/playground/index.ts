import { create } from 'zustand';
import { PlaygroundState, CreateNewPlaygroundPayload, PlaygroundStore } from './types';
import { ContractMetadata } from '@/service/evm-analyzer/types';
import * as actions from "./action"

const initialState: PlaygroundState = {
  constructorBytecode: '',
  abi: {} as ContractMetadata,
  totalSupply: BigInt(0),
  decimals: 18,
}



const usePlaygroundStore = create<PlaygroundStore>((set, get) => ({
  ...initialState,
  createInitialState: (state: PlaygroundState) => set(state),
  createNewPlayground: async (playground: CreateNewPlaygroundPayload) => {
    return actions.createNewPlayground(playground, set, get)
  },
  createAccount: async (address: string) => {
    return actions.createAccount(address, get)
  }
}));

export default usePlaygroundStore;
