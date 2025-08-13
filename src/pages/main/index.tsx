import EvmProviders from '@/providers/EvmProviders';
import SubmitContract from './components/SubmitContract';

const MainPage = () => {
  return (
    <EvmProviders>
      <SubmitContract />
    </EvmProviders>
  )
}

export default MainPage;