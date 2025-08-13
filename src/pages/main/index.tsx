import { useEvm } from '@/hooks/use-evm';
import SubmitContract from './components/SubmitContract';
import { useMemo } from 'react';
import Playground from './components/Playground';

const MainPage = () => {
  const { isInitialized, evm } = useEvm();
  const isReadyToPlay = useMemo(() => isInitialized && evm !== null, [isInitialized, evm]);

  return (
    isReadyToPlay ? <Playground /> : <SubmitContract />
  )
}

export default MainPage;