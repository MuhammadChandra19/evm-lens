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
    const parsedBalance = balance * BigInt(10 ** ETH_DECIMAL);
    const storedAccount = accounts.get(address.toString());

    if (!storedAccount) {
      console.error(
        `Cannot fund account ${address.toString()}: account does not exist`,
      );
      return {
        error: `Cannot fund account ${address.toString()}: account does not exist`,
        success: false,
      };
    }

    const newBalance = storedAccount.balance + parsedBalance;
    const result = await evmAdapter.addFundToAccount(
      playgroundId,
      address,
      newBalance,
      shouldRecord,
      balance,
    );

    if (result.success) {
      updateAccountBalance(address.toString(), newBalance);
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

  const registerAccount = async (playgroundId: number, address: Address, shouldRecord: boolean = true) => {
    const result = await evmAdapter.registerAccount(playgroundId, address, shouldRecord);
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
