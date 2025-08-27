import { SearchCode } from "lucide-react";
import ContractEVMSetup from "./forms/ContractPlaygroundSetup";

const CreateContract = () => {
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
          </div>
        </div>
        <ContractEVMSetup />
      </div>
    </div>
  );
};

export default CreateContract;
