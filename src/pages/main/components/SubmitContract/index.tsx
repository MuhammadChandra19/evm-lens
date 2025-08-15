// import DeployContractForm from './forms/DeployContract';
import ContractPlaygroundSetup from './forms/DeployContractV2';
// import useSubmitContract from './use-submit-contract';

const SubmitContract = () => {
  // const { handleSubmit } = useSubmitContract();
  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4">
      <ContractPlaygroundSetup  />
    </div>
  )
}

export default SubmitContract;
