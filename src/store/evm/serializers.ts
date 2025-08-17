import EVMAnalyzer from "@/service/evm-analyzer";
import { EVMState } from "./types";
import { Address } from "@ethereumjs/util";
import { FunctionInfo } from "@/service/evm-analyzer/types";
import { keccak256 } from "ethereum-cryptography/keccak";
import { AbiValidator } from "@/service/evm-analyzer/abi";
import { Abi } from '@/service/evm-analyzer/abi/types';

// Serializable version of the EVM state
export interface SerializableEVMState {
  contractAddress?: string;
  constructorBytecode: string;
  abi: Abi;
  functions?: Array<[string | undefined, FunctionInfo]>;
  ownerAddress?: string;
  totalSupply: string; // BigInt as string
  decimals: number;
  // EVM state will be handled separately
  evmState?: {
    accounts: Array<{
      address: string;
      balance: string;
      nonce: string;
      code?: string;
      storage?: Array<[string, string]>;
    }>;
  };
  abiMetadata: AbiValidator | undefined;
}

export const serializeEVMState = async (
  state: EVMState,
): Promise<SerializableEVMState> => {
  const serialized: SerializableEVMState = {
    contractAddress: state.contractAddress?.toString(),
    constructorBytecode: state.constructorBytecode,
    abi: state.abi,
    functions: state.functions
      ? Array.from(state.functions.entries())
      : undefined,
    ownerAddress: state.ownerAddress?.toString(),
    totalSupply: state.totalSupply.toString(),
    decimals: state.decimals,
    abiMetadata: state.abiMetadata ? state.abiMetadata : undefined,
  };

  // Serialize EVM state if available
  if (state.evm) {
    const knownAddresses = getKnownAddresses(state);
    serialized.evmState = await serializeEVMStateEnhanced(
      state.evm,
      knownAddresses,
    );
  }

  return serialized;
};

export const deserializeEVMState = async (
  serialized: SerializableEVMState,
): Promise<EVMState> => {
  const state: EVMState = {
    contractAddress: serialized.contractAddress
      ? new Address(
          Buffer.from(
            serialized.contractAddress.startsWith("0x")
              ? serialized.contractAddress.slice(2)
              : serialized.contractAddress,
            "hex",
          ),
        )
      : undefined,
    constructorBytecode: serialized.constructorBytecode,
    abi: serialized.abi,
    functions: serialized.functions ? new Map(serialized.functions) : undefined,
    ownerAddress: serialized.ownerAddress
      ? new Address(
          Buffer.from(
            serialized.ownerAddress.startsWith("0x")
              ? serialized.ownerAddress.slice(2)
              : serialized.ownerAddress,
            "hex",
          ),
        )
      : undefined,
    totalSupply: BigInt(serialized.totalSupply),
    decimals: serialized.decimals,
    abiMetadata: new AbiValidator(serialized.abiMetadata),
  };

  // Restore EVM state if available
  if (serialized.evmState) {
    state.evm = await deserializeEVM(serialized.evmState);
  }

  return state;
};

const deserializeEVM = async (
  evmState: NonNullable<SerializableEVMState["evmState"]>,
): Promise<EVMAnalyzer> => {
  // Create a new EVM analyzer instance
  const evm = await EVMAnalyzer.create();

  // Restore accounts and their state
  for (const accountData of evmState.accounts) {
    try {
      // Create the account
      await evm.createAccount(accountData.address);

      // Fund the account with the stored balance
      if (accountData.balance !== "0") {
        await evm.fundAccount(accountData.address, BigInt(accountData.balance));
      }

      // Restore contract code if present
      if (accountData.code) {
        const codeBytes = new Uint8Array(Buffer.from(accountData.code, "hex"));
        await evm.stateManagerService.setCode(accountData.address, codeBytes);
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
      console.warn(`Failed to restore account ${accountData.address}:`, error);
    }
  }

  return evm;
};

// Enhanced serialization that captures more EVM state
export const serializeEVMStateEnhanced = async (
  evm: EVMAnalyzer,
  knownAddresses: string[] = [],
): Promise<SerializableEVMState["evmState"]> => {
  const accounts: Array<{
    address: string;
    balance: string;
    nonce: string;
    code?: string;
    storage?: Array<[string, string]>;
  }> = [];

  // Serialize known addresses (contract address, owner address, etc.)
  for (const address of knownAddresses) {
    if (!address) continue;

    try {
      const accountInfo = await evm.getAccountInfo(address);
      if (accountInfo) {
        const accountData: (typeof accounts)[0] = {
          address: address,
          balance: accountInfo.balance.toString(),
          nonce: accountInfo.nonce.toString(),
        };

        // Get contract code if it's a contract
        if (accountInfo.isContract) {
          const code = await evm.stateManagerService.getCode(address);
          if (code && code.length > 0) {
            accountData.code = Buffer.from(code).toString("hex");
          }
        }

        // Serialize important storage slots for token contracts
        if (accountInfo.isContract) {
          const storage: Array<[string, string]> = [];

          try {
            // Common ERC-20 storage slots
            const importantSlots = [
              "0x0000000000000000000000000000000000000000000000000000000000000000", // slot 0
              "0x0000000000000000000000000000000000000000000000000000000000000001", // slot 1
              "0x0000000000000000000000000000000000000000000000000000000000000002", // slot 2
              "0x0000000000000000000000000000000000000000000000000000000000000003", // slot 3 (totalSupply)
              "0x0000000000000000000000000000000000000000000000000000000000000004", // slot 4 (balances mapping base)
              "0x0000000000000000000000000000000000000000000000000000000000000005", // slot 5
              "0x0000000000000000000000000000000000000000000000000000000000000006", // slot 6 (owner)
            ];

            const cleanAddr = address.startsWith("0x")
              ? address.slice(2)
              : address;
            const addr = new Address(Buffer.from(cleanAddr, "hex"));

            for (const slot of importantSlots) {
              const slotBuffer = Buffer.from(slot.slice(2), "hex");
              const value =
                await evm.stateManagerService.stateManager.getStorage(
                  addr,
                  slotBuffer,
                );

              if (value && value.length > 0) {
                // Only store non-zero values
                const valueHex = Buffer.from(value).toString("hex");
                if (
                  valueHex !==
                  "0000000000000000000000000000000000000000000000000000000000000000"
                ) {
                  storage.push([slot.slice(2), valueHex]);
                }
              }
            }

            // Also serialize balance mapping slots for known addresses
            const balanceMappingSlot = 4; // ERC-20 balances are typically in slot 4
            for (const knownAddr of knownAddresses) {
              if (knownAddr && knownAddr !== address) {
                try {
                  const balanceSlot = getBalanceSlot(
                    knownAddr,
                    balanceMappingSlot,
                  );
                  const slotBuffer = Buffer.from(balanceSlot, "hex");
                  const value =
                    await evm.stateManagerService.stateManager.getStorage(
                      addr,
                      slotBuffer,
                    );

                  if (value && value.length > 0) {
                    const valueHex = Buffer.from(value).toString("hex");
                    if (
                      valueHex !==
                      "0000000000000000000000000000000000000000000000000000000000000000"
                    ) {
                      storage.push([balanceSlot, valueHex]);
                    }
                  }
                } catch (error) {
                  console.warn(
                    `Failed to serialize balance slot for ${knownAddr}:`,
                    error,
                  );
                }
              }
            }

            if (storage.length > 0) {
              accountData.storage = storage;
            }
          } catch (error) {
            console.warn(`Failed to serialize storage for ${address}:`, error);
          }
        }

        accounts.push(accountData);
      }
    } catch (error) {
      console.warn(`Failed to serialize account ${address}:`, error);
    }
  }

  return { accounts };
};

// Helper function to get all addresses that should be persisted
export const getKnownAddresses = (state: EVMState): string[] => {
  const addresses: string[] = [];

  if (state.contractAddress) {
    addresses.push(state.contractAddress.toString());
  }

  if (state.ownerAddress) {
    addresses.push(state.ownerAddress.toString());
  }

  return addresses.filter(Boolean);
};

// Helper to calculate balance mapping slot (same logic as in action.ts)
const getBalanceSlot = (address: string, mappingSlot: number): string => {
  const cleanAddr = address.startsWith("0x") ? address.slice(2) : address;
  const addrBuffer = Buffer.from(cleanAddr.padStart(64, "0"), "hex");
  const slotBuffer = Buffer.from(
    mappingSlot.toString(16).padStart(64, "0"),
    "hex",
  );

  const combined = Buffer.concat([addrBuffer, slotBuffer]);
  const hash = keccak256(combined);

  return Buffer.from(hash).toString("hex");
};
