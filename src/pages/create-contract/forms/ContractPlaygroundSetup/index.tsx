import { FormProvider } from "react-hook-form";
import useDeployContract from "./useDeployContract";
import { Button } from "@/components/ui/button";
import { Play, Save, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ContractConfiguration from "./ContractConfiguration";
import BytecodeAndABI from "./BytecodeAndABI";
import { ContractEVMSchema } from "./schema";
import { useRef } from "react";

const ContractEVMSetup = () => {
  const { method, handleDeploycontract } = useDeployContract();
  const submitActionRef = useRef<"publish" | "save">("publish");

  const handleFormSubmit = (data: ContractEVMSchema) => {
    if (submitActionRef.current === "save") {
      console.log(data);
    } else {
      handleDeploycontract(data);
    }
  };

  return (
    <FormProvider {...method}>
      <form onSubmit={method.handleSubmit(handleFormSubmit)}>
        <div className="max-w-6xl mx-auto space-y-4">
          {/* ✅ Compact Header */}
          <Card className="border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-5 h-5 text-blue-600" />
                Smart Contract EVM Setup
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure contract parameters and deploy to your local
                blockchain
              </p>
            </CardHeader>
          </Card>

          {/* ✅ Compact Form Sections */}
          <div className="space-y-3">
            <ContractConfiguration />
            <BytecodeAndABI />
          </div>
        </div>

        {/* ✅ Compact Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-sm border-t border-gray-200 shadow-sm z-50">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              <Button
                type="submit"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => (submitActionRef.current = "publish")}
              >
                <Play className="w-4 h-4 mr-2" />
                Deploy & Explore
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400 px-4"
                onClick={() => {
                  submitActionRef.current = "save";
                  method.handleSubmit(handleFormSubmit)();
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Config
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ContractEVMSetup;
