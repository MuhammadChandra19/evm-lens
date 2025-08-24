import usePlaygroundStore from '@/store/playground';

const useAbiViewer = () => {
  const activeFunction = usePlaygroundStore((store) => store.activeFunction);

  return {
    activeFunction
  }
}

export default useAbiViewer;
