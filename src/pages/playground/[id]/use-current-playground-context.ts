import { useContext } from "react";
import {
  CurrentPlaygroundContext,
  CurrentPlaygroundContextValue,
} from "./CurrentPlaygroundProvider";

export const useCurrentPlayground = (): CurrentPlaygroundContextValue => {
  const context = useContext(CurrentPlaygroundContext);
  if (!context) {
    throw new Error(
      "useCurrentPlayground must be used within a CurrentPlaygroundProvider",
    );
  }
  return context;
};
