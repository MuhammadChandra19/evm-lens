import { useFormContext } from 'react-hook-form';
import { BytecodeAndABISchema } from './schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const BytecodeAndABI = () => {
  const { control } = useFormContext<{
    bytecodeAndAbi: BytecodeAndABISchema
  }>();


  return (
    <Card>
      <CardHeader>
        <CardTitle>📜 Bytecode & ABI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Constructor Bytecode</label>
            </div>
            <FormField
              control={control}
              name="bytecodeAndAbi.constructorBytecode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      className="font-mono text-xs mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                📋 Contract ABI (Application Binary Interface)
              </label>
            </div>
            <FormField
              control={control}
              name="bytecodeAndAbi.contractAbi"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      className="font-mono text-xs mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BytecodeAndABI;