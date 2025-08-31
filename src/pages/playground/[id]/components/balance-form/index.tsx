import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
// import { useApp } from "@/hooks/use-app"; // No longer needed
import { useEVMAdapter } from "@/hooks/use-evm-adapter";
import { useCurrentPlayground } from "@/hooks/use-current-playground";

const BalanceForm = () => {
  // const { actionRecorder } = useApp(); // No longer needed
  const evmAdapter = useEVMAdapter();
  const [balance, setBalance] = useState("1");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current playground data
  const { ownerAddress } = useCurrentPlayground();

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

      if (!ownerAddress) {
        setError("No owner address found");
        return;
      }

      // Get current playground ID from current playground config
      const playgroundId = parseInt(window.location.pathname.split('/')[2]);

      if (!playgroundId) {
        setError("No playground ID found");
        return;
      }

      const res = await evmAdapter.fundAccount(
        ownerAddress,
        BigInt(balance),
        playgroundId,
      );

      if (!res.success) {
        toast.error("failed to fund account");
        console.error(res.error);
        return;
      }

      toast.success("Account funded successfully");
      setOpen(false);
    } catch (e) {
      console.error(e);
      setError("An error occurred while funding account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="outline">
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
          {error && <p className="text-sm text-red-500">{error}</p>}
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
