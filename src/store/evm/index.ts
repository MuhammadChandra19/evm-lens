import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { EVMState, CreateNewEVMPayload, EVMStore } from "./types";
import { ContractMetadata } from "@/service/evm-analyzer/types";
import * as actions from "./action";
import { serializeEVMStateEnhanced, getKnownAddresses } from "./serializers";
import EVMAnalyzer from "@/service/evm-analyzer";
import { Address } from "@ethereumjs/util";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import { AbiValidator } from "@/service/evm-analyzer/abi";

const initialState: EVMState = {
  constructorBytecode: "",
  abi: {} as ContractMetadata,
  totalSupply: BigInt(0),
  decimals: 18,
  abiMetadata: new AbiValidator({}),
};

/**
 * EVM Store with Persistence
 *
 * This store persists both evm state and EVM blockchain state:
 *
 * 1. Basic State Persistence (localStorage: 'evm-storage'):
 *    - Contract address, bytecode, ABI, functions, owner, supply, decimals
 *    - Uses Zustand persist middleware with custom serialization for Address/BigInt types
 *
 * 2. EVM State Persistence (localStorage: 'evm-evm-state'):
 *    - Account balances, contract code, storage slots
 *    - Serialized separately due to complexity of EVM state manager
 *    - Restored during onRehydrateStorage callback
 *
 * 3. Auto-save triggers:
 *    - EVM state is automatically saved after state-changing operations
 *    - Basic state is automatically persisted by Zustand middleware
 */

const useEVMStore = create<EVMStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic EVM functions
      createAccount: async (address: string) => {
        const result = await actions.createAccount(address, get);
        await saveEVMState();
        return result;
      },
      fundAccount: async (address: string, balance: bigint) => {
        const result = await actions.fundAccount(address, balance, get);
        if (result.success) {
          await saveEVMState();
        }
        return result;
      },

      deployContractToEVM: async (payload: CreateNewEVMPayload) => {
        const result = await actions.deployContractToEVM(payload, set, get);
        await saveEVMState();
        return result;
      },

      callFunction: async (
        executorAddres: string,
        func: AbiFunction,
        args: string[],
        gasLimit: number,
      ) => {
        const result = await actions.callFunction(
          executorAddres,
          func,
          args,
          gasLimit,
          get,
        );
        await saveEVMState();
        return result;
      },

      // Persistence helpers
      initializeEVM: async () => {
        const currentState = get();
        if (!currentState.evm) {
          const evm = await EVMAnalyzer.create();
          set({ evm });
        }
      },
      saveEVMState: async () => {
        await saveEVMState();
      },
      clearPersistedState: () => {
        localStorage.removeItem("evm-storage");
        localStorage.removeItem("evm-evm-state");
        set(initialState);
      },
    }),
    {
      name: "evm-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return async (state) => {
          if (!state) return;
          // Convert serialized Address strings back to Address objects
          if (typeof state.contractAddress === "string") {
            const addrStr = state.contractAddress as string;
            const cleanAddr = addrStr.startsWith("0x")
              ? addrStr.slice(2)
              : addrStr;
            state.contractAddress = new Address(Buffer.from(cleanAddr, "hex"));
          }

          if (typeof state.ownerAddress === "string") {
            const addrStr = state.ownerAddress as string;
            const cleanAddr = addrStr.startsWith("0x")
              ? addrStr.slice(2)
              : addrStr;
            state.ownerAddress = new Address(Buffer.from(cleanAddr, "hex"));
          }

          // Convert serialized BigInt strings back to BigInt
          if (typeof state.totalSupply === "string") {
            state.totalSupply = BigInt(state.totalSupply);
          }

          // Convert serialized functions array back to Map
          if (Array.isArray(state.functions)) {
            state.functions = new Map(state.functions);
          }

          // Initialize EVM if not present
          if (!state.evm) {
            const evm = await EVMAnalyzer.create();

            // Try to restore EVM state from separate storage
            const evmStateStr = localStorage.getItem("evm-evm-state");
            if (evmStateStr) {
              try {
                const evmState = JSON.parse(evmStateStr);
                const restoredEvm = await restoreEVMFromState(evmState);
                if (restoredEvm) {
                  state.evm = restoredEvm;
                  return;
                }
              } catch (error) {
                console.warn("Failed to restore EVM state:", error);
              }
            }

            state.evm = evm;
          }
        };
      },
      partialize: (state) => ({
        contractAddress: state.contractAddress?.toString(),
        constructorBytecode: state.constructorBytecode,
        abi: state.abi,
        functions: state.functions
          ? Array.from(state.functions.entries())
          : undefined,
        ownerAddress: state.ownerAddress?.toString(),
        totalSupply: state.totalSupply.toString(),
        decimals: state.decimals,
        // Exclude evm from automatic serialization
      }),
    },
  ),
);

// Helper functions
const saveEVMState = async () => {
  try {
    const state = useEVMStore.getState();
    if (state.evm) {
      const knownAddresses = getKnownAddresses(state);
      const evmState = await serializeEVMStateEnhanced(
        state.evm,
        knownAddresses,
      );
      localStorage.setItem("evm-evm-state", JSON.stringify(evmState));
    }
  } catch (error) {
    console.warn("Failed to save EVM state:", error);
  }
};

const restoreEVMFromState = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evmState: any,
): Promise<EVMAnalyzer | null> => {
  try {
    const evm = await EVMAnalyzer.create();

    // Restore accounts and their state
    if (evmState.accounts) {
      for (const accountData of evmState.accounts) {
        try {
          // Create the account
          await evm.createAccount(accountData.address);

          // Fund the account with the stored balance
          if (accountData.balance !== "0") {
            await evm.fundAccount(
              accountData.address,
              BigInt(accountData.balance),
            );
          }

          // Restore contract code if present
          if (accountData.code) {
            const codeBytes = new Uint8Array(
              Buffer.from(accountData.code, "hex"),
            );
            await evm.stateManagerService.setCode(
              accountData.address,
              codeBytes,
            );
          }

          // Restore storage if present
          if (accountData.storage) {
            for (const [slot, value] of accountData.storage) {
              const cleanAddr = accountData.address.startsWith("0x")
                ? accountData.address.slice(2)
                : accountData.address;
              const addr = new Address(Buffer.from(cleanAddr, "hex"));
              await evm.stateManagerService.stateManager.putStorage(
                addr,
                Buffer.from(slot, "hex"),
                Buffer.from(value, "hex"),
              );
            }
          }
        } catch (error) {
          console.warn(
            `Failed to restore account ${accountData.address}:`,
            error,
          );
        }
      }
    }

    return evm;
  } catch (error) {
    console.error("Failed to restore EVM from state:", error);
    return null;
  }
};

export default useEVMStore;
