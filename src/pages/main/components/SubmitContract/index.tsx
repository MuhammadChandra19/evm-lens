import DeployContractForm from '../forms/DeployContract';
import useSubmitContract from './use-submit-contract';

const SubmitContract = () => {
  const { handleSubmit } = useSubmitContract();
  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4">
      <DeployContractForm onSubmit={handleSubmit} />
    </div>
  )
}

export default SubmitContract;
