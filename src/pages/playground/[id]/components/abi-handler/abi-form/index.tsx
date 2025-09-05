import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useAbiForm from "./use-abi-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AbiForm = () => {
  const {
    activeFunction,
    form,
    handleChange,
    errors,
    handleSubmit,
    accountList,
    handleSelectAccount,
    ethError,
    ethAmount,
    setEthAmount,
    isPayable,
  } = useAbiForm();

  return (
    <Card className="flex flex-col h-fit">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Function</CardTitle>
        <CardDescription>
          <span>Function: {activeFunction!.func.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <div className="flex flex-col gap-4">
          <Select onValueChange={handleSelectAccount}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accountList.map((v) => (
                <SelectItem
                  key={v.address.toString()}
                  value={v.address.toString()}
                >
                  <div className="w-full flex gap-2">
                    <span>{v.address.toString()} - </span>
                    <span>{Number(v.balance || 0n) / 1e18} ETH</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeFunction!.func.inputs.map((input, idx) => {
            return (
              <div key={idx} className="w-full space-y-2">
                <Label>{input.name}</Label>
                <Input
                  placeholder={getPlaceholderForType(input.type, input.name)}
                  name={input.name}
                  value={form[idx]?.value || ""}
                  onChange={(e) => handleChange(idx, e.target.value)}
                />
                {errors && errors[idx] !== "" && (
                  <p className="text-sm text-red-500">{errors[idx]}</p>
                )}
              </div>
            );
          })}
          {isPayable && (
            <div className="w-full space-y-2">
              <Label>Eth Amount</Label>
              <Input
                placeholder={getPlaceholderForType("uint", "ETH")}
                name="ethAmount"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
              />
              {ethError && <p className="text-sm text-red-500">{ethError}</p>}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-shrink-0 mt-auto">
        <Button
          size="lg"
          className="w-full cursor-pointer"
          variant="outline"
          onClick={handleSubmit}
        >
          ⚡️ Execute
        </Button>
      </CardFooter>
    </Card>
  );
};

function getPlaceholderForType(abiType: string, name?: string): string {
  if (abiType.match(/^u?int(\d+)?$/)) {
    return `Enter ${name || "number"} (e.g., 1000)`;
  }
  if (abiType === "address") {
    return `Enter ${name || "address"} (e.g., 0x742d35Cc...)`;
  }
  if (abiType === "bool") {
    return `Enter ${name || "boolean"} (true/false)`;
  }
  if (abiType.match(/^bytes(\d+)?$/)) {
    return `Enter ${name || "bytes"} (e.g., 0x1234...)`;
  }
  return `Enter ${name || "value"}`;
}

export default AbiForm;
