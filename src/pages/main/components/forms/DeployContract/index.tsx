import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DeployContractSchema } from './schema';
import { useDeployContract } from './useDeployContract';
import { FormProvider } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Props = {
  onSubmit: (data: DeployContractSchema) => void;
}
const DeployContractForm = ({ onSubmit }: Props) => {
  const { method } = useDeployContract();

  return (
    <FormProvider {...method}>
      <form onSubmit={method.handleSubmit(onSubmit)}>
        <Card className="w-4xl mx-auto min-h-fit m-auto">
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="w-full flex flex-col gap-2">
              <FormField
                control={method.control}
                name="contractAddress"
                render={({ field }) => (
                  <FormItem
                    className="w-full"
                  >
                    <FormLabel>Contract Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0x..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={method.control}
                name="constructorBytecode"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Constructor Bytecode</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0x..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={method.control}
                name="ownerAddress"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Owner Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0x..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={method.control}
                name="totalSupply"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Total Supply</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1000000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="rounded-xl bg-muted p-4">
              <FormField
                control={method.control}
                name="contractMetadata"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Contract Metadata</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter contract metadata as JSON..."
                        className="min-h-48 max-h-48 w-full resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="w-full cursor-pointer">Deploy</Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  )
};

export default DeployContractForm;