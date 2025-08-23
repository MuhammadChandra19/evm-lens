import { AbiValidator } from "@/service/evm-analyzer/abi";
import useEVMStore from "@/store/evm";
import { useCallback, useMemo } from "react";
import { MenuAction, MenuItem, MenuItemChild } from "./types";
import { BookText, PencilLine, Zap } from "lucide-react";
import usePlaygroundStore from "@/store/playground";
import { ActiveFunction } from "@/store/playground/types";

const useFunctionList = () => {
  const abi = useEVMStore((store) => store.abi);
  const setActiveFunction = usePlaygroundStore(
    (store) => store.setActiveFunction,
  );

  const handleClickFunction = useCallback(
    (action: MenuAction, func: ActiveFunction) => {
      setActiveFunction(func);
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
      onClick: (action) =>
        handleClickFunction(action, {
          func: f,
          type: "function",
        }),
      type: "function",
    }));

    const writeFunctionsMenu: MenuItemChild[] = writeFunctions.map((f) => ({
      id: f.name,
      title: f.name,
      onClick: (action) =>
        handleClickFunction(action, {
          func: f,
          type: "function",
        }),
      type: "function",
    }));

    const eventsMenu: MenuItemChild[] = events.map((f) => ({
      id: f.name,
      title: f.name,
      onClick: (action) =>
        handleClickFunction(action, {
          func: f,
          type: "event",
        }),
      type: "event",
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
