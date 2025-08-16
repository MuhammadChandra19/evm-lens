import EVMAnalyzer from "@/service/evm-analyzer";
import { useEffect, useRef } from "react";


const useService = () => {
  const evmRef = useRef<EVMAnalyzer | null>(null);

  useEffect(() => {
    (async () => {
      const evm = await EVMAnalyzer.create();
      evmRef.current = evm;
    })();
  }, []);

  return {
    // EVM basics
    evm: evmRef.current,
  };
};

export default useService;
