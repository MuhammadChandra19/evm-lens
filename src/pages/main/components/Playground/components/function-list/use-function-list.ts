import { AbiValidator } from "@/service/evm-analyzer/abi";
import useEVMStore from "@/store/evm";
import { useCallback, useMemo } from "react";
import { MenuAction, MenuItem, MenuItemChild } from "./types";
import { BookText, PencilLine, Zap } from "lucide-react";
import usePlaygroundStore from "@/store/playground";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import { ABIFunction } from "@/service/evm-analyzer";

const useFunctionList = () => {
  const abi = useEVMStore((store) => store.abi);
  const setActiveFunction = usePlaygroundStore(
    (store) => store.setActiveFunction,
  );

  const handleClickFunction = useCallback(
    (action: MenuAction, abiFunction: AbiFunction) => {
      console.log(action, abiFunction);
      setActiveFunction(abiFunction);
    },
    [setActiveFunction],
  );

  const functions = useMemo(() => {
    const abiValidator = new AbiValidator(abi);
    const readFunctions = abiValidator.getReadFunctions();
    const writeFunctions = abiValidator.getWriteFunctions();
    const events = abiValidator.getEvents();

    const readFunctionsMenu: MenuItemChild[] = readFunctions.map((f) => ({
      id: f.name,
      title: f.name,
      onClick: (action) => handleClickFunction(action, f),
    }));

    const writeFunctionsMenu: MenuItemChild[] = writeFunctions.map((f) => ({
      id: f.name,
      title: f.name,
      onClick: (action) => handleClickFunction(action, f),
    }));

    const eventsMenu: MenuItemChild[] = events.map((f) => ({
      id: f.name,
      title: f.name,
      onClick: (action) =>
        handleClickFunction(action, f as unknown as ABIFunction),
    }));

    return [
      {
        icon: BookText,
        title: "Read Functions",
        isActive: false,
        items: readFunctionsMenu,
      },
      {
        icon: PencilLine,
        title: "Write Functions",
        isActive: false,
        items: writeFunctionsMenu,
      },
      {
        icon: Zap,
        title: "Events",
        isActive: false,
        items: eventsMenu,
      },
    ] as MenuItem[];
  }, [abi, handleClickFunction]);

  return {
    functions,
  };
};

export default useFunctionList;
