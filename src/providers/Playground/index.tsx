import { Address } from "@ethereumjs/util";
import LoadingScreen from "@/components/loading-screen";
import { Playground } from "@/repository/playground/entity";
import { createContext, ReactNode, useMemo } from "react";
import {
  usePlaygroundList,
  usePlaygroundNavigation,
  useSnapshotReplay,
} from "./hooks";
import usePlaygroundAction from "./use-playground-action";
import {
  CreateNewEVMPayload,
  ExecutionResult,
  TxData,
} from "@/service/evm-adapter/types";
import { DeploymentResult } from "@/service/evm-analyzer";

interface PlaygroundProviderProps {
  children: ReactNode;
}

type PlaygroundProviderValue = {
  isLoading: boolean;
  setActivePlayground: (id: number) => Promise<void>;
  playgroundList: Playground[];
  createAccount: (
    playgroundId: number,
    address: string,
    shouldRecord?: boolean,
  ) => Promise<Address | null>;
  fundAccount: (
    playgroundId: number,
    address: Address,
    balance: bigint,
    shouldRecord?: boolean,
  ) => Promise<{
    success: boolean;
    error: unknown;
  }>;
  deployContractToEVM: (
    payload: CreateNewEVMPayload,
    shouldRecord?: boolean,
  ) => Promise<DeploymentResult | null>;
  callFunction: (
    txData: TxData,
    shouldRecord?: boolean,
  ) => Promise<ExecutionResult | undefined>;
  registerAccount: (playgroundId: number, address: Address) => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const PlaygroundProviderContext =
  createContext<PlaygroundProviderValue | null>(null);

const PlaygroundProvider = ({ children }: PlaygroundProviderProps) => {
  const {
    callFunction,
    createAccount,
    deployContractToEVM,
    fundAccount,
    registerAccount,
  } = usePlaygroundAction();
  const { isReplayingSnapshot } = useSnapshotReplay({
    callFunction,
    createAccount,
    deployContractToEVM,
    fundAccount,
    registerAccount,
  });
  const { playgroundList, isLoadingPlaygroundList } = usePlaygroundList();
  const { setActivePlayground } = usePlaygroundNavigation();

  const isLoading = useMemo(
    () => isReplayingSnapshot || isLoadingPlaygroundList,
    [isReplayingSnapshot, isLoadingPlaygroundList],
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PlaygroundProviderContext.Provider
      value={{
        isLoading,
        setActivePlayground,
        playgroundList,
        callFunction,
        createAccount,
        deployContractToEVM,
        fundAccount,
        registerAccount,
      }}
    >
      {children}
    </PlaygroundProviderContext.Provider>
  );
};

export default PlaygroundProvider;
