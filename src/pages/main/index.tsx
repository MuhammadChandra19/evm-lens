import SubmitContract from './components/SubmitContract';
import { useMemo } from 'react';
import Playground from './components/Playground';
import usePlaygroundStore from '@/store/playground';

const MainPage = () => {
  const evm = usePlaygroundStore(store => store.evm);
  const isReadyToPlay = useMemo(() => evm !== null || evm !== undefined , [evm]);

  return (
    isReadyToPlay ? <Playground /> : <SubmitContract />
  )
}

export default MainPage;