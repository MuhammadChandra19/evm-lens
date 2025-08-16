import { useFormContext } from "react-hook-form";
import { ContractConfigurationSchema } from "./schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Dice6, Wallet } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateRandomAddress } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ContractConfiguration = () => {
  const { control, setValue } = useFormContext<{
    contractConfiguration: ContractConfigurationSchema;
  }>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Contract Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            📍 Contract Address (where it will be deployed)
          </label>
          <div className="grid grid-cols-12 gap-4 mt-2">
            <div className="col-span-8 w-full">
              <FormField
                control={control}
                name="contractConfiguration.contractAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="col-span-4"
              onClick={() => {
                setValue(
                  "contractConfiguration.contractAddress",
                  generateRandomAddress(),
                );
              }}
            >
              <Dice6 className="w-4 h-4 mr-2" />
              Generate Random
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            👤 Owner Address
          </label>
          <div className="grid grid-cols-12 gap-4 mt-2">
            <div className="w-full col-span-8">
              <FormField
                control={control}
                name="contractConfiguration.ownerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="col-span-4"
              onClick={() => {
                setValue(
                  "contractConfiguration.ownerAddress",
                  generateRandomAddress(),
                );
              }}
            >
              <Dice6 className="w-4 h-4 mr-2" />
              Generate Random
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="w-full col-span-8">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Total Supply (for ERC20 tokens)
            </label>
            <FormField
              control={control}
              name="contractConfiguration.totalSupply"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} className="mt-2" type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full col-span-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Decimals
            </label>
            <FormField
              control={control}
              name="contractConfiguration.decimals"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="18">18</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractConfiguration;
