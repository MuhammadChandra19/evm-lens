import {
  AbiEvent,
  AbiFunction,
  AbiParameter,
  AbiType,
} from "@/service/evm-analyzer/abi/types";
import { FlowData } from "@/service/evm-analyzer/utils/react-flow-parser";

export type ActiveFunction = {
  func: AbiFunction | AbiEvent;
  type: AbiType;
};
export type PlaygroundState = {
  playgroundName?: string;
  activeFunction?: ActiveFunction;
  history: ResultHistory[];
};

export type PlaygroundAction = {
  setPlaygroundName: (name: string) => void;
  setActiveFunction: (func: ActiveFunction) => void;
  saveResult: (history: ResultHistory) => void;
  getFunctionLastResult: (functionName: string) => ResultHistory | undefined;
  getFunctionResultHistory: (functionName: string) => ResultHistory[];
};

export type FunctionCallForm = {
  inputs: FunctionCallFormInput[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FunctionCallFormInput = AbiParameter & { value: string };

export type PlaygroundStore = PlaygroundState & PlaygroundAction;

export type ResultHistory = {
  id: string;
  functionName: string;
  functionDefinitions: ActiveFunction;
  executedAt: string;
  executionFlow: FlowData;
  hasOutput: boolean;
  result: string;
};
