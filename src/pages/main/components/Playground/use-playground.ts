import usePlaygroundStore from "@/store/playground";
import { useMemo } from "react";

const usePlayground = () => {
  const activeFunction = usePlaygroundStore((store) => store.activeFunction);
  const getFunctionLastResult = usePlaygroundStore(
    (store) => store.getFunctionLastResult,
  );

  const lastExecutionResult = useMemo(() => {
    if (!activeFunction) return undefined;

    const lastResult = getFunctionLastResult(activeFunction!.name!);

    return lastResult;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFunction]);

  return {
    activeFunction,
    lastExecutionResult,
  };
};

export default usePlayground;
