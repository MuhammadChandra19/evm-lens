import EVMAnalyzer from '@/service/evm-analyzer';
import { Address } from '@ethereumjs/util';
import { CreateNewPlaygroundPayload, PlaygroundState } from './types';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { BytecodeAnalyzer } from '@/service/evm-analyzer/utils/bytecode-analyzer';
import { ERRORS } from './errors';

export const createNewPlayground = async (
  playground: CreateNewPlaygroundPayload,
  set: (partial: Partial<PlaygroundState>) => void,
  get: () => PlaygroundState
) => {
  try {
    const evm = get().evm
    if(!evm) return { success: false , error: "EVM not initialized" }
    const contractAddress = await evm.createAccount(playground.contractAddress)

    const runtimeStart = playground.constructorBytecode.indexOf('6080604052600436');
    const runtimeBytecode = playground.constructorBytecode.slice(runtimeStart);

    const totalSupply = playground.totalSupply * BigInt(10 ** playground.decimals)
    await initializeContractState(evm, playground.contractAddress, playground.ownerAddress, playground.totalSupply)

    const analysis = BytecodeAnalyzer.analyzeWithMetadata(runtimeBytecode, playground.abi)
    const functions = new Map(analysis.functions.map((f) => [f.name, f]));

    set({
      contractAddress,
      functions,
      totalSupply
    })

    return { success: true , error: null }
  } catch(e) {
    console.error('DEX deployment failed:', e);
    return { success: false , error: e }
  }
}

const initializeContractState = async(
  evm: EVMAnalyzer,
  contractAddress: string,
  ownerAddress: string,
  totalSupply: bigint
) => {
  const setStorage = async (slot: number | string, value: string) => {
    let slotHex: string;
    if (typeof slot === 'number') {
      slotHex = slot.toString(16).padStart(64, '0');
    } else {
      slotHex = slot.padStart(64, '0');
    }

    const valueHex = value.startsWith('0x') ? value.slice(2) : value;
    const cleanAddr = contractAddress.startsWith('0x') ? contractAddress.slice(2) : contractAddress;
    const addr = new Address(Buffer.from(cleanAddr, 'hex'));

    await evm.stateManagerService.stateManager.putStorage(
      addr,
      Buffer.from(slotHex, 'hex'),
      Buffer.from(valueHex.padStart(64, '0'), 'hex')
    );
  };

      // Helper to calculate balance mapping slot
  const getBalanceSlot = (address: string, mappingSlot: number): string => {
    const cleanAddr = address.startsWith('0x') ? address.slice(2) : address;
    const addrBuffer = Buffer.from(cleanAddr.padStart(64, '0'), 'hex');
    const slotBuffer = Buffer.from(mappingSlot.toString(16).padStart(64, '0'), 'hex');

    const combined = Buffer.concat([addrBuffer, slotBuffer]);
    const hash = keccak256(combined);

    return Buffer.from(hash).toString('hex');
  };

  // Set owner (slot 6)
  await setStorage(6, ownerAddress.slice(2));

  // Set total supply (slot 3) - now uses parameter
  await setStorage(3, totalSupply.toString(16));

  // Set owner's balance (mapping slot 4) - now uses parameter
  const ownerBalanceSlot = getBalanceSlot(ownerAddress, 4);
  await setStorage(ownerBalanceSlot, totalSupply.toString(16));
}

export const createAccount = async (
  address: string,
  get: () => PlaygroundState
) => {
  const evm = get().evm
  if(!evm) return null
  const account = await evm.createAccount(address)
  return account
}

export const fundAccount = async (
  address: string,
  balance: bigint,
  get: () => PlaygroundState
) => {
  const evm = get().evm
  if(!evm) return  { success: false , error: ERRORS.EVM_NOT_INITIALIZED }

  try {
    await evm.fundAccount(address, balance)
    return { success: true , error: null }
  } catch(e) {
    console.error('DEX deployment failed:', e);
    return { success: false , error: e }
  }
}

