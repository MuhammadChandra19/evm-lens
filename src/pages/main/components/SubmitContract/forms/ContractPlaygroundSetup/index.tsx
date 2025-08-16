import { FormProvider } from "react-hook-form";
import useDeployContract from "./useDeployContract";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ContractConfiguration from "./ContractConfiguration";
import BytecodeAndABI from "./BytecodeAndABI";
import { ContractPlaygroundSchema } from "./schema";
import { useRef } from "react";

const ContractPlaygroundSetup = () => {
  const { method, handleDeploycontract } = useDeployContract();
  const submitActionRef = useRef<"publish" | "save">("publish");
  const handleFormSubmit = (data: ContractPlaygroundSchema) => {
    if (submitActionRef.current === "save") {
      console.log(data);
    } else {
      handleDeploycontract(data);
    }
  };
  return (
    <FormProvider {...method}>
      <form onSubmit={method.handleSubmit(handleFormSubmit)}>
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                🎯 Smart Contract Playground Setup
              </h2>
              <p className="text-blue-100 text-lg">
                Configure your contract parameters and deploy to your local
                blockchain!
              </p>
            </CardContent>
          </Card>
          <ContractConfiguration />
          <BytecodeAndABI />
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg z-50">
          <div className="max-w-6xl mx-auto p-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="w-5 h-5 mr-2" />
                🚀 Deploy & Explore Contract
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="border-gray-300 hover:border-gray-400"
              >
                💾 Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ContractPlaygroundSetup;
