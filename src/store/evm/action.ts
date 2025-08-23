import { CreateNewEVMPayload, ExecutionResult, EVMState, ContractDeploymentResult, TxData } from './types';
import { ERRORS } from './errors';
import { generateFunctionHash, generateInputHash } from '@/service/evm-analyzer/abi/util';
import { Address } from '@/service/evm-analyzer/utils/address';
import { AccountInfo } from '@/service/evm-analyzer';
import { ETH_DECIMAL } from '@/lib/constants';


export const deployContractToEVM = async (payload: CreateNewEVMPayload, set: (partial: Partial<EVMState>) => void, get: () => EVMState): Promise<ContractDeploymentResult | null> => {
  const evm = get().evm;
  if (!evm) return null;

  const owner = new Address(Buffer.from(payload.ownerAddress.slice(2), 'hex'));
  const ownerAddress = await createAccount(owner, get);
  if (!ownerAddress) return null;

  const contract = new Address(Buffer.from(payload.contractAddress.slice(2), 'hex'));
  const contractAddress = await createAccount(contract, get);
  if (!contractAddress) return null;

  const res = await evm.deployContract(ownerAddress, payload.constructorBytecode, contractAddress);
  if (!res.success) return null;

  // Fund the owner account
  const parsedBalance = payload.initialOwnerBalance * BigInt(10 ** ETH_DECIMAL)
  await fundAccount(ownerAddress, parsedBalance, get);

  const ownerAccountInfo = await evm.getAccountInfo(ownerAddress);
  const contractAccountInfo = await evm.getAccountInfo(contractAddress);

  const accounts: Record<string, AccountInfo> = {};
  if (ownerAccountInfo) {
    accounts[ownerAddress.toString()] = ownerAccountInfo;
  }
  if (contractAccountInfo) {
    accounts[contractAddress.toString()] = contractAccountInfo;
  }

  set({
    abi: payload.abi,
    totalSupply: BigInt(payload.totalSupply) * BigInt(10 ** payload.decimal), // Fix calculation
    ownerAddress,
    contractAddress,
    decimals: payload.decimal,
    accounts, // ✅ Proper accounts with complete AccountInfo
  });

  return res;
};

export const callFunction = async (tx: TxData, get: () => EVMState): Promise<ExecutionResult> => {
  try {
      const evm = get().evm;
  if (!evm) return null;

  const contractAddress = get().contractAddress;
  if (!contractAddress) return null;

  let data = generateFunctionHash(tx.func);
  data += generateInputHash(tx.func, tx.args, get().decimals);

  let ethAmount = 0n
  if(tx.func.stateMutability === 'payable') {
    ethAmount = tx.ethAmount
  }
  const result = await evm.callContract(
    {
      data,
      from: tx.executorAddres,
      to: contractAddress,
      gasLimit: BigInt(tx.gasLimit),
      value: ethAmount,
    },
    {
      includeMemory: true,
      includeStack: true,
      includeStorage: true,
    }
  );
  return result;
  } catch(e) {
    console.error(e)
    throw new Error("failed to call function", e as ErrorOptions)
  }
};

export const createAccount = async (address: Address, get: () => EVMState) => {
  const evm = get().evm;
  if (!evm) return null;
  const account = await evm.createAccount(address);
  return account;
};

export const fundAccount = async (address: Address, balance: bigint, get: () => EVMState) => {
  const evm = get().evm;
  if (!evm) return { success: false, error: ERRORS.EVM_NOT_INITIALIZED };
  try {
    await evm.fundAccount(address, balance);
    return { success: true, error: null };
  } catch (e) {
    console.error('DEX deployment failed:', e);
    return { success: false, error: e };
  }
};

export const getAccount =  async (address: Address, get: () => EVMState) => {
  const evm = get().evm;
  if (!evm) return { success: false, error: ERRORS.EVM_NOT_INITIALIZED };
    try {
    const res = await evm.getAccountInfo(address)
    return res
  } catch (e) {
    console.error('Failed to get account:', e);
  }
}
