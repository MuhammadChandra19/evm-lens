// import DeployContractForm from './forms/DeployContract';
import { SearchCode } from "lucide-react";
import ContractEVMSetup from "./forms/ContractEVMSetup";
// import useSubmitContract from './use-submit-contract';

const SubmitContract = () => {
  // const { handleSubmit } = useSubmitContract();
  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4">
      <div className="min-h-screen p-6 pb-32">
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <SearchCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EVM Lens</h1>
                <p className="text-sm text-gray-500">
                  Learn smart contracts by deploying and exploring
                </p>
              </div>
            </div>
            {/* <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Tutorial
              </Button>
              <Button variant="outline" size="sm">Examples</Button>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Local Node Ready
              </Badge>
            </div> */}
          </div>
        </div>
        <ContractEVMSetup />
      </div>
    </div>
  );
};

export default SubmitContract;
