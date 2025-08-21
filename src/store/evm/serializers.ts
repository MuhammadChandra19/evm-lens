import EVMAnalyzer from "@/service/evm-analyzer";
import { EVMState, EVMStore } from "./types";
import { Address } from "@ethereumjs/util";
import { FunctionInfo } from "@/service/evm-analyzer/types";
import { AbiValidator } from "@/service/evm-analyzer/abi";
import { Abi } from "@/service/evm-analyzer/abi/types";

// Serializable version of AccountInfo (Address and bigint converted to strings)
export interface SerializableAccountInfo {
  /** The account address as hex string */
  address: string;
  /** The account balance in wei as string */
  balance: string;
  /** The account nonce as string */
  nonce: string;
  /** Whether this account is a contract (has code) */
  isContract?: boolean;
  /** Hash of the contract code (if isContract is true) */
  codeHash?: string;
  /** Hash of the storage root */
  storageRoot?: string;
  /** Contract bytecode as hex string (if isContract is true) */
  code?: string;
  // Note: Storage is handled separately by the EVM state manager via getStorage/putStorage
  // AccountInfo does not contain storage data, only the storageRoot hash
}

// Serializable version of the EVM state - matches store structure
export interface SerializableEVMState {
  contractAddress?: string;
  constructorBytecode: string;
  abi: Abi;
  functions?: Array<[string | undefined, FunctionInfo]>;
  ownerAddress?: string;
  totalSupply: string; // BigInt as string
  decimals: number;
  abiMetadata?: AbiValidator;
  // Match store structure: accounts as Record<string, SerializableAccountInfo>
  accounts?: Record<string, SerializableAccountInfo>;
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
    serialized.accounts = await serializeAccountsToRecord(
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
    abiMetadata: new AbiValidator(serialized.abi),
  };

  // Restore EVM state if available
  if (serialized.accounts) {
    state.evm = await deserializeEVMFromAccounts(serialized.accounts);
    // Also set the accounts in the store state for consistency
    state.accounts = await convertSerializedAccountsToStore(
      serialized.accounts,
    );
  }

  return state;
};

// Helper function to serialize accounts to Record format (matches store structure)
const serializeAccountsToRecord = async (
  evm: EVMAnalyzer,
  knownAddresses: Address[] = [],
): Promise<SerializableEVMState["accounts"]> => {
  const accounts: NonNullable<SerializableEVMState["accounts"]> = {};

  // Serialize known addresses
  for (const address of knownAddresses) {
    if (!address) continue;

    try {
      const accountInfo = await evm.getAccountInfo(address);
      if (accountInfo) {
        const addressKey = address.toString(); // Use full address as key

        accounts[addressKey] = {
          address: address.toString().slice(2), // Remove 0x prefix for storage
          balance: accountInfo.balance.toString(),
          nonce: accountInfo.nonce.toString(),
          isContract: accountInfo.isContract,
          codeHash: accountInfo.codeHash,
          storageRoot: accountInfo.storageRoot,
        };

        // Add contract code if present
        if (accountInfo.isContract && accountInfo.code) {
          accounts[addressKey].code = Buffer.from(accountInfo.code).toString(
            "hex",
          );
        }
      }
    } catch (error) {
      console.warn(`Failed to serialize account ${address.toString()}:`, error);
    }
  }

  return accounts;
};

// Helper function to deserialize EVM from accounts Record
const deserializeEVMFromAccounts = async (
  accounts: NonNullable<SerializableEVMState["accounts"]>,
): Promise<EVMAnalyzer> => {
  const evm = await EVMAnalyzer.create();

  // Restore accounts and their state
  for (const [addressKey, accountData] of Object.entries(accounts)) {
    try {
      const address = new Address(Buffer.from(accountData.address, "hex"));

      // Create the account
      await evm.createAccount(address);

      // Fund the account with the stored balance
      if (accountData.balance !== "0") {
        await evm.fundAccount(address, BigInt(accountData.balance));
      }

      // Restore contract code if present
      if (accountData.code) {
        const codeBytes = new Uint8Array(Buffer.from(accountData.code, "hex"));
        await evm.stateManagerService.setCode(address, codeBytes);
      }

      // Note: Storage restoration is NOT needed here because:
      // 1. AccountInfo doesn't contain storage data
      // 2. Storage is automatically handled by MerkleStateManager via storageRoot
      // 3. The state manager will restore storage from the storageRoot hash
    } catch (error) {
      console.warn(`Failed to restore account ${addressKey}:`, error);
    }
  }

  return evm;
};

// Helper function to convert serialized accounts to store AccountInfo format
const convertSerializedAccountsToStore = async (
  serializedAccounts: NonNullable<SerializableEVMState["accounts"]>,
): Promise<
  Record<string, import("@/service/evm-analyzer/types").AccountInfo>
> => {
  const storeAccounts: Record<
    string,
    import("@/service/evm-analyzer/types").AccountInfo
  > = {};

  for (const [addressKey, accountData] of Object.entries(serializedAccounts)) {
    const address = new Address(Buffer.from(accountData.address, "hex"));

    storeAccounts[addressKey] = {
      address: address,
      balance: BigInt(accountData.balance),
      nonce: BigInt(accountData.nonce),
      isContract: accountData.isContract,
      codeHash: accountData.codeHash,
      storageRoot: accountData.storageRoot,
      code: accountData.code
        ? new Uint8Array(Buffer.from(accountData.code, "hex"))
        : undefined,
    };
  }

  return storeAccounts;
};

// Legacy function - now redirects to new structure
export const deserializeEVM = async (
  accountsData:
    | NonNullable<SerializableEVMState["accounts"]>
    | {
        accounts: Array<{
          address: string;
          balance: string;
          nonce?: string;
          code?: string;
          codeHash?: string;
          storageRoot?: string;
        }>;
      },
): Promise<EVMAnalyzer> => {
  // Handle both old array format and new Record format
  if ("accounts" in accountsData && Array.isArray(accountsData.accounts)) {
    // Convert old array format to new Record format
    const recordAccounts: NonNullable<SerializableEVMState["accounts"]> = {};
    for (const accountData of accountsData.accounts) {
      const addressKey = `0x${accountData.address}`;
      recordAccounts[addressKey] = {
        address: accountData.address,
        balance: accountData.balance,
        nonce: accountData.nonce || "0",
        isContract: Boolean(accountData.code),
        codeHash: accountData.codeHash,
        storageRoot: accountData.storageRoot,
        code: accountData.code,
      };
    }
    return deserializeEVMFromAccounts(recordAccounts);
  } else {
    // New Record format
    return deserializeEVMFromAccounts(
      accountsData as NonNullable<SerializableEVMState["accounts"]>,
    );
  }
};

// Legacy function removed - now using serializeEVMState with Record structure

// Helper function to get all addresses that should be persisted
export const getKnownAddresses = (state: EVMState): Address[] => {
  const addresses: Address[] = [];

  if (state.contractAddress) {
    addresses.push(state.contractAddress);
  }

  if (state.ownerAddress) {
    addresses.push(state.ownerAddress);
  }

  return addresses.filter(Boolean);
};

export const handlePopulateState = async (state: EVMStore | undefined) => {
  if (!state) return;
  // Convert serialized Address strings back to Address objects
  if (typeof state.contractAddress === "string") {
    const addrStr = state.contractAddress as string;
    const cleanAddr = addrStr.startsWith("0x") ? addrStr.slice(2) : addrStr;
    state.contractAddress = new Address(Buffer.from(cleanAddr, "hex"));
  }

  if (typeof state.ownerAddress === "string") {
    const addrStr = state.ownerAddress as string;
    const cleanAddr = addrStr.startsWith("0x") ? addrStr.slice(2) : addrStr;
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
    const evmStateStr = localStorage.getItem("evm-state");
    if (evmStateStr) {
      try {
        const serializedState = JSON.parse(evmStateStr);
        const restoredState = await deserializeEVMState(serializedState);
        if (restoredState.evm) {
          // Restore the full state
          Object.assign(state, restoredState);
          return;
        }
      } catch (error) {
        console.warn("Failed to restore EVM state:", error);
      }
    }

    state.evm = evm;
  }
};

// Storage slot calculation is no longer needed - EVM state manager handles all storage
