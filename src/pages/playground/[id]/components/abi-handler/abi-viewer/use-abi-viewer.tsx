import { useCurrentPlayground } from "@/hooks/use-current-playground";

const useAbiViewer = () => {
  const { activeFunction } = useCurrentPlayground();

  return {
    activeFunction,
  };
};

export default useAbiViewer;
