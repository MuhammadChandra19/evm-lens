import { AbiValidator } from "@/service/evm-analyzer/abi";
import { useCallback, useMemo } from "react";
import { MenuAction, MenuItem, MenuItemChild } from "./types";
import { BookText, PencilLine, Zap } from "lucide-react";
import usePlaygroundStore from "@/store/playground";
import { ActiveFunction } from "@/store/playground/types";
import { useCurrentPlayground } from "../../../use-current-playground";

const useFunctionList = () => {
  const { getConfig } = useCurrentPlayground();
  const { abi } = getConfig();
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
        isActive: true,
        items: readFunctionsMenu,
      },
      {
        icon: PencilLine,
        title: "Write Functions",
        isActive: true,
        items: writeFunctionsMenu,
      },
      {
        icon: Zap,
        title: "Events",
        isActive: true,
        items: eventsMenu,
      },
    ] as MenuItem[];
  }, [abi, handleClickFunction]);

  return {
    functions,
  };
};

export default useFunctionList;
