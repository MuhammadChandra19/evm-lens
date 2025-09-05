import { Address } from "@ethereumjs/util";
import { ActionRecorder } from "../action-recorder";
import EVMAnalyzer, { AccountInfo } from "../evm-analyzer";
import {
  ContractDeploymentResult,
  CreateNewEVMPayload,
  ExecutionResult,
  TxData,
} from "./types";
import { ETH_DECIMAL } from "@/lib/constants";
import {
  generateFunctionHash,
  generateInputHash,
} from "../evm-analyzer/abi/util";
import { AbiFunction } from "../evm-analyzer/abi/types";
import { AppStore } from "@/store/app/types";

/**
 * EVM Adapter - handles all EVM operations with consistent return types
 * Integrates with playground store for state management
 */
export class EVMAdapter {
  private recordAction: typeof ActionRecorder.prototype.recordAction;
  private evm: EVMAnalyzer;

  constructor(
    evm: EVMAnalyzer,
    recordAction: typeof ActionRecorder.prototype.recordAction,
  ) {
    this.evm = evm;
    this.recordAction = recordAction;
  }

  async deployNewContract(
    payload: CreateNewEVMPayload,
    getState: () => AppStore,
    shouldRecord: boolean = true,
  ): Promise<ContractDeploymentResult | null> {
    const owner = this.toAddressType(payload.ownerAddress);
    const ownerAddress = await this.createNewAccount(
      payload.id,
      owner,
      shouldRecord,
    );

    if (!ownerAddress) return null;

    const contract = this.toAddressType(payload.contractAddress);
    const contractAddress = await this.createNewAccount(
      payload.id,
      contract,
      shouldRecord,
    );

    if (!contractAddress) return null;

    const res = await this.evm.deployContract(
      ownerAddress,
      payload.constructorBytecode,
      contractAddress,
    );

    if (!res.success) return null;

    const parsedBalance =
      payload.initialOwnerBalance * BigInt(10 ** ETH_DECIMAL);
    await this.addFundToAccount(
      payload.id,
      ownerAddress,
      parsedBalance,
      shouldRecord,
    );

    const ownerAccountInfo = await this.evm.getAccountInfo(ownerAddress);
    const contractAccountInfo = await this.evm.getAccountInfo(contractAddress);
    const accounts: [string, AccountInfo][] = [];
    if (ownerAccountInfo) {
      accounts.push([ownerAddress.toString(), ownerAccountInfo]);
    }
    if (contractAccountInfo) {
      accounts.push([contractAddress.toString(), contractAccountInfo]);
    }

    const { setAccounts, createNewPlayground } = getState();
    setAccounts(accounts);
    createNewPlayground({
      abi: payload.abi,
      contractAddress: contractAddress,
      decimals: payload.decimal,
      id: payload.id,
      name: payload.projectName,
      ownerAddress: ownerAddress,
      totalSupply: BigInt(payload.totalSupply) * BigInt(10 ** payload.decimal),
    });

    if (shouldRecord) {
      await this.recordAction(
        payload.id,
        "DEPLOY_CONTRACT",
        payload,
        res.gasUsed.toString(),
      );
    }

    return res;
  }

  async createNewAccount(
    playgroundId: number,
    address: Address,
    shouldRecord: boolean = true,
  ) {
    const account = await this.evm.createAccount(address);
    if (account && shouldRecord) {
      const actionPayload = { address: address.toString() };
      await this.recordAction(
        playgroundId,
        "CREATE_ACCOUNT",
        actionPayload,
        "0",
      );
    }

    return account;
  }

  async addFundToAccount(
    playgroundId: number,
    address: Address,
    balance: bigint,
    shouldRecord: boolean = true,
    recordAmount?: bigint,
  ) {
    try {
      await this.evm.fundAccount(address, balance);
      const result = { success: true, error: null };
      if (shouldRecord) {
        const actionPayload = {
          address: [address.toString(), "Address"],
          balance: recordAmount !== undefined ? recordAmount : balance,
        };

        await this.recordAction(
          playgroundId,
          "FUND_ACCOUNT",
          actionPayload,
          "0",
        );
      }

      return result;
    } catch (e) {
      console.error("Failed to add fund to account:", e);
      return { success: false, error: e };
    }
  }

  async callContractFunction(
    playgroundId: number,
    tx: TxData,
    getState: () => AppStore,
    shouldRecord: boolean = true,
  ): Promise<ExecutionResult> {
    try {
      const { getPlaygroundConfig } = getState();
      const { contractAddress, decimals } = getPlaygroundConfig(playgroundId);

      let data = generateFunctionHash(tx.func);
      data += generateInputHash(tx.func, tx.args, decimals);

      let ethAmount = 0n;
      if (
        tx.type === "function" &&
        (tx.func as AbiFunction).stateMutability === "payable"
      ) {
        ethAmount = tx.ethAmount * BigInt(10 ** ETH_DECIMAL);
      }

      const result = await this.evm.callContract(
        {
          data,
          from: tx.executorAddress,
          to: contractAddress,
          gasLimit: BigInt(tx.gasLimit),
          value: ethAmount,
        },
        {
          includeMemory: true,
          includeStack: true,
          includeStorage: true,
        },
      );

      if (!result.success) {
        return result;
      }

      if (
        shouldRecord &&
        tx.type === "function" &&
        (tx.func as AbiFunction).stateMutability !== "view"
      ) {
        const actionPayload = {
          ...tx,
          executorAddress: [tx.executorAddress.toString(), "Address"],
        };

        this.recordAction(
          playgroundId,
          "CALL_FUNCTION",
          actionPayload,
          result.gasUsed.toString(),
        );
      }

      return result;
    } catch (e) {
      console.error(e);
      throw new Error("failed to call function", e as ErrorOptions);
    }
  }

  async getAccount(address: Address) {
    try {
      const res = await this.evm.getAccountInfo(address);
      return res;
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : "Unknown error occurred",
      );
    }
  }

  async registerAccount(
    playgroundId: number,
    address: Address,
    shouldRecord = true,
  ) {
    const result = await this.createNewAccount(playgroundId, address);

    if (result && shouldRecord) {
      const actionPayload = { address: [address.toString(), "Address"] };
      await this.recordAction(
        playgroundId,
        "REGISTER_ACCOUNT",
        actionPayload,
        "0",
      );
    }

    return result;
  }

  toAddressType(address: string) {
    const fixAddress = address.startsWith("0x") ? address.slice(2) : address;
    const addressType = new Address(Buffer.from(fixAddress, "hex"));

    return addressType;
  }
}
