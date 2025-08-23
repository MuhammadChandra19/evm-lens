import { useFormContext } from 'react-hook-form';
import { ContractConfigurationSchema } from './schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Dice6, Wallet, User, FolderOpen, Banknote } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateRandomAddress } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContractConfiguration = () => {
  const { control, setValue } = useFormContext<{
    contractConfiguration: ContractConfigurationSchema
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
        {/* ✅ 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <FormField
                control={control}
                name="contractConfiguration.projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="My Token Project"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contract Address */}
            <div>
              <FormField
                control={control}
                name="contractConfiguration.contractAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      📍 Contract Address
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0x..."
                          className="font-mono text-sm flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue('contractConfiguration.contractAddress', generateRandomAddress())
                        }}
                      >
                        <Dice6 className="w-4 h-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Supply */}
            <div>
              <FormField
                control={control}
                name="contractConfiguration.totalSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Total Supply
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="1000000"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Owner Address */}
            <div>
              <FormField
                control={control}
                name="contractConfiguration.ownerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Owner Address
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0x..."
                          className="font-mono text-sm flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue('contractConfiguration.ownerAddress', generateRandomAddress())
                        }}
                      >
                        <Dice6 className="w-4 h-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Initial Owner Balance */}
            <div>
              <FormField
                control={control}
                name="contractConfiguration.initialOwnerBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Initial Owner Balance (ETH)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="1000"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Decimals */}
            <div>
              <FormField
                control={control}
                name="contractConfiguration.decimals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Decimals</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={(value) => field.onChange(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select decimals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 decimals</SelectItem>
                          <SelectItem value="8">8 decimals</SelectItem>
                          <SelectItem value="18">18 decimals (standard)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractConfiguration;
