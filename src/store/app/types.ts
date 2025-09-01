import type { AccountInfo } from "@/service/evm-analyzer";
import type {
  Abi,
  AbiEvent,
  AbiFunction,
  AbiType,
} from "@/service/evm-analyzer/abi/types";
import type { FlowData } from "@/service/evm-analyzer/utils/react-flow-parser";
import type { Address } from "@ethereumjs/util";

export type ActiveFunction = {
  func: AbiFunction | AbiEvent;
  type: AbiType;
};

// Playground configuration
export type PlaygroundConfig = {
  id: number;
  name: string;
  contractAddress: Address;
  ownerAddress: Address;
  decimals: number;
  totalSupply: bigint;
  abi: Abi;
  isActive?: boolean;
};

export type PlaygroundState = {
  playgroundName?: string;
  activeFunction?: ActiveFunction;
};

export type ResultHistory = {
  playgroundId: number;
  functionName: string;
  functionDefinitions: ActiveFunction;
  executedAt: string;
  executionFlow: FlowData;
  hasOutput: boolean;
  result: string;
};

export type AppState = {
  configs: Map<number, PlaygroundConfig>;

  accounts: Map<string, AccountInfo>;

  playground: Map<number, PlaygroundState>;
  history: ResultHistory[];
};

export type AppAction = {
  createNewPlayground: (config: PlaygroundConfig) => void;
  getPlaygroundConfig: (id: number) => PlaygroundConfig;

  getAccounts: () => Map<string, AccountInfo>;

  saveExecutionResult: (history: ResultHistory) => void;

  getFunctionLastResult: (
    id: number,
    functionName: string,
  ) => ResultHistory | undefined;
  getFunctionResultHistory: (
    id: number,
    functionName: string,
  ) => ResultHistory[];

  getAllPlayground: () => PlaygroundConfig[];

  setAccounts: (accounts: [string, AccountInfo][]) => void;
};

export type AppStore = AppState & AppAction;
