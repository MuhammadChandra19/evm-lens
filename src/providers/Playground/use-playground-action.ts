import { Address } from "@ethereumjs/util";
import { useApp } from "@/hooks/use-app";
import { AccountInfo } from "@/service/evm-analyzer";
import useAppStore from "@/store/app";
import { ETH_DECIMAL } from "@/lib/constants";
import { CreateNewEVMPayload, TxData } from "@/service/evm-adapter/types";

const usePlaygroundAction = () => {
  const { evmAdapter } = useApp();
  const setAccounts = useAppStore((store) => store.setAccounts);
  const updateAccountBalance = useAppStore(
    (store) => store.updateAccountBalance,
  );
  const accounts = useAppStore((store) => store.accounts);

  const createAccount = async (
    playgroundId: number,
    address: string,
    shouldRecord: boolean = true,
  ) => {
    const addressType = evmAdapter.toAddressType(address);
    const result = await evmAdapter.createNewAccount(
      playgroundId,
      addressType,
      shouldRecord,
    );
    if (!result) return null;

    const newAccount: AccountInfo = {
      address: result,
      balance: 0n,
      nonce: 0n,
    };

    setAccounts([[address, newAccount]]);
    return result;
  };

  const fundAccount = async (
    playgroundId: number,
    address: Address,
    balance: bigint,
    shouldRecord: boolean = true,
  ) => {
    let storedAccount = accounts.get(address.toString());

    // During replay, if account doesn't exist in store, create it first
    if (!storedAccount && !shouldRecord) {
      await createAccount(playgroundId, address.toString(), false);
      // Get fresh state after account creation
      storedAccount = useAppStore.getState().accounts.get(address.toString());
    }

    if (!storedAccount) {
      console.error(
        `Cannot fund account ${address.toString()}: account does not exist`,
      );
      return {
        error: `Cannot fund account ${address.toString()}: account does not exist`,
        success: false,
      };
    }

    let newBalance: bigint;

    if (shouldRecord) {
      // Regular funding from UI: convert ETH to wei and add to existing balance
      const parsedBalance = balance * BigInt(10 ** ETH_DECIMAL);
      newBalance = storedAccount.balance + parsedBalance;
    } else {
      // Snapshot replay: balance is already in wei format, set it directly (don't add)
      newBalance = balance;
    }

    const result = await evmAdapter.addFundToAccount(
      playgroundId,
      address,
      newBalance,
      shouldRecord,
      newBalance,
    );

    if (result.success) {
      updateAccountBalance(address.toString(), newBalance);

      // During replay, also sync the account from EVM to ensure consistency
      if (!shouldRecord) {
        try {
          const evmAccount = await evmAdapter.getAccount(address);
          if (evmAccount) {
            setAccounts([[address.toString(), evmAccount]]);
          }
        } catch (e) {
          console.warn(`Failed to sync EVM account:`, e);
        }
      }
    }

    return result;
  };

  const deployContractToEVM = async (
    payload: CreateNewEVMPayload,
    shouldRecord: boolean = true,
  ) => {
    const result = await evmAdapter.deployNewContract(
      payload,
      useAppStore.getState,
      shouldRecord,
    );
    return result;
  };

  const callFunction = async (txData: TxData, shouldRecord: boolean = true) => {
    try {
      const result = await evmAdapter.callContractFunction(
        txData.playgroundId,
        txData,
        useAppStore.getState,
        shouldRecord,
      );

      if (result && !result.success) {
        return result;
      }
      const account = await evmAdapter.getAccount(txData.executorAddress);
      if (account) {
        setAccounts([[txData.executorAddress.toString(), account]]);
      }

      return result;
    } catch (e) {
      console.error(e);
    }
  };

  const registerAccount = async (
    playgroundId: number,
    address: Address,
    shouldRecord: boolean = true,
  ) => {
    const result = await evmAdapter.registerAccount(
      playgroundId,
      address,
      shouldRecord,
    );
    if (!result) return;

    setAccounts([
      [
        address.toString(),
        {
          address: result,
          balance: 0n,
          nonce: 0n,
        },
      ],
    ]);
  };

  return {
    createAccount,
    fundAccount,
    deployContractToEVM,
    callFunction,
    registerAccount,
  };
};

export default usePlaygroundAction;
