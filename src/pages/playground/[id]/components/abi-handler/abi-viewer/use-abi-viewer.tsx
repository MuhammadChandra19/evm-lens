import { useCurrentPlayground } from "../../../use-current-playground-context";

const useAbiViewer = () => {
  const { activeFunction } = useCurrentPlayground();

  return {
    activeFunction,
  };
};

export default useAbiViewer;
