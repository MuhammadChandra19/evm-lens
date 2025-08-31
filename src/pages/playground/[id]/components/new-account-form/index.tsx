import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { generateRandomAddress } from "@/lib/utils";
import { CircleUser, Dice6 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
// import { useApp } from "@/hooks/use-app"; // No longer needed
import { useEVMAdapter } from "@/hooks/use-evm-adapter";
import { Address } from "@ethereumjs/util";

const NewAccountForm = () => {
  // const { actionRecorder } = useApp(); // No longer needed
  const evmAdapter = useEVMAdapter();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState("0");
  const [address, setAddress] = useState("");
  const [errorAddress, setErrorAddress] = useState<string | null>(null);
  const [errorBalance, setErrorBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setErrorAddress(null);
    setErrorBalance(null);
    setIsLoading(true);

    try {
      const balanceNum = Number(balance);
      if (isNaN(balanceNum) || balanceNum < 1) {
        setErrorBalance("Invalid balance value");
        return;
      }

      if (address.length === 0) {
        setErrorAddress("Address must be filled");
        return;
      }

      // Get current playground ID from URL params
      const playgroundId = parseInt(window.location.pathname.split('/')[2]);

      const accountResult = await evmAdapter.createAccount(address, playgroundId);
      if (!accountResult.success) {
        toast.error("failed to create account", {
          description: accountResult.error || "Account creation failed",
        });
        return;
      }

      toast.success("account created", {
        description: `Address: ${accountResult.data?.address.toString()}`,
      });

      if (balanceNum === 0) {
        setOpen(false);
        return;
      }

      // Fund the account if balance > 0
      const addressObj = new Address(Buffer.from(address.slice(2), 'hex'));
      const fundResult = await evmAdapter.fundAccount(addressObj, BigInt(balance), playgroundId);

      if (fundResult.success) {
        toast.success("account funded", {
          description: `Eth amount: ${balance}`,
        });
      } else {
        toast.error("failed to fund account", {
          description: fundResult.error || "Funding failed",
        });
      }

      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create new account");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer h-full">
          <CircleUser />
          Add New Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add user to chain</DialogTitle>
          <DialogDescription>
            Execute function to create user with inital balance
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="w-full space-y-2">
            <div className="flex gap-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address (0x)..."
                disabled
              />
              <Button
                type="button"
                variant="outline"
                className="font-mono text-sm flex-1"
                size="sm"
                onClick={() => {
                  setAddress(generateRandomAddress());
                }}
              >
                <Dice6 className="w-4 h-4" />
              </Button>
            </div>
            {errorAddress && (
              <p className="text-sm text-red-500">{errorAddress}</p>
            )}
          </div>
          <div className="w-full space-y-2">
            <Input
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Enter Eth amount..."
              type="number"
            />
            {errorBalance && (
              <p className="text-sm text-red-500">{errorBalance}</p>
            )}
          </div>
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

export default NewAccountForm;
