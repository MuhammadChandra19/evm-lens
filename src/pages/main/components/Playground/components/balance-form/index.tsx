import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useEVMStore from '@/store/evm';
import { useState } from 'react';
import { toast } from 'sonner';

const BalanceForm = () => {
  const [balance, setBalance] = useState("1");
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fundAccount = useEVMStore(store => store.fundAccount);
  const ownerAddress = useEVMStore(store => store.ownerAddress!);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Simple validation
      const balanceNum = Number(balance);
      if (isNaN(balanceNum) || balanceNum < 1) {
        setError("Invalid balance value");
        return;
      }

      const res = await fundAccount(ownerAddress, BigInt(balance));

      if (!res.success) {
        toast.error("failed to fund account")
        console.error(res.error)
      }
      setOpen(false)
    } catch (e) {
      console.log(e);
      setError("An error occurred while funding account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full cursor-pointer" variant="outline">
          <Wallet />
          Add Balance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fund Account</DialogTitle>
          <DialogDescription>
            Execute function to fund account with given value
          </DialogDescription>
        </DialogHeader>
        <div className="w-full space-y-2">
          <Input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Enter Eth amount..."
            type="number"
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            className="cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BalanceForm;
