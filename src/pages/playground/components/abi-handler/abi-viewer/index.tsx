import { Card, CardContent } from "@/components/ui/card";
import ReactJsonView from "@microlink/react-json-view";
import useAbiViewer from "./use-abi-viewer";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";

const AbiViewer = () => {
  const { activeFunction } = useAbiViewer();
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-grow overflow-auto">
        <ReactJsonView
          src={{
            type: activeFunction?.func.type,
            name: activeFunction?.func.name,
            anonymous: activeFunction?.func.anonymous || false,
            stateMutability:
              activeFunction?.type === "function"
                ? (activeFunction.func as AbiFunction).stateMutability
                : "",
            inputs: activeFunction?.func.inputs,
            ...(activeFunction?.type === "function"
              ? { outputs: (activeFunction.func as AbiFunction).outputs }
              : []),
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AbiViewer;
