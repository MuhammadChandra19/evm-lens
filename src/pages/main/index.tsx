import SubmitContract from "./components/SubmitContract";
import { useMemo } from "react";
import Playground from "./components/Playground";
import useEVMStore from "@/store/evm";

const MainPage = () => {
  const evm = useEVMStore((store) => store.evm);
  const ownerAddress = useEVMStore((store) => store.ownerAddress)
  const isReadyToPlay = useMemo(() => (evm !== null || evm !== undefined) && ownerAddress !== undefined, [evm, ownerAddress]);

  return isReadyToPlay ? <Playground /> : <SubmitContract />;
};

export default MainPage;
