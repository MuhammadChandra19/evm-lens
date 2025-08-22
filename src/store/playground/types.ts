import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import { FlowData } from '@/service/evm-analyzer/utils/react-flow-parser';

export type PlaygroundState = {
  playgroundName?: string;
  activeFunction?: AbiFunction;
  history: ResultHistory[];
};

export type PlaygroundAction = {
  setPlaygroundName: (name: string) => void;
  setActiveFunction: (func: AbiFunction) => void;
  saveResult: (history: ResultHistory) => void;
  getFunctionLastResult: (functionName: string) => ResultHistory | undefined;
  getFunctionResultHistory: (functionName: string) => ResultHistory[];
};

export type PlaygroundStore = PlaygroundState & PlaygroundAction;

export type ResultHistory = {
  id: string;
  functionName: string;
  functionDefinitions: AbiFunction;
  executedAt: string;
  executionFlow: FlowData
};
