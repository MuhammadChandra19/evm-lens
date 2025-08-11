import { createEVM, EVM as EVMType, InterpreterStep } from '@ethereumjs/evm';
import { parsers } from '../evm/opcodes/utils';
import { Blockchain as BlockchainType, createBlockchain } from '@ethereumjs/blockchain';
import { MerkleStateManager } from '@ethereumjs/statemanager';
import { Address, Account } from '@ethereumjs/util';
import { TxData } from './types';

class EVM {
  evm: EVMType | null;
  blockChain: BlockchainType | null;
  stateManager: MerkleStateManager | null;

  constructor(evm: EVMType, blockChain: BlockchainType, stateManager: MerkleStateManager) {
    this.evm = evm;
    this.blockChain = blockChain;
    this.stateManager = stateManager;
  }

  static async initEvm() {
    const stateManager = new MerkleStateManager();
    const blockChain = await createBlockchain();
    const evm = await createEVM({
      stateManager,
      blockchain: blockChain,
    });
    return new EVM(evm, blockChain, stateManager);
  }

  async deployContract(code: string) {
    if (!this.evm) {
      throw new Error('EVM not initialized');
    }
    const step: InterpreterStep[] = [];
    this.evm.events.on('step', (snapshot) => {
      step.push(snapshot);
    });

    const res = await this.evm.runCode({
      code: parsers.hexStringToUint8Array(code),
    });

    return {
      res,
      step,
    };
  }

  async newAddress(address: string) {
    // Remove 0x prefix if present and create Address from hex string
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const res = await this.stateManager?.putAccount(new Address(Buffer.from(cleanAddress, 'hex')), undefined);

    return res;
  }

  async fundAddress(address: string, balance: bigint) {
    if (!this.stateManager) {
      throw new Error('State manager not initialized');
    }

    // Remove 0x prefix if present and create Address from hex string
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addr = new Address(Buffer.from(cleanAddress, 'hex'));

    // Get existing account or create new one with balance
    const existingAccount = await this.stateManager.getAccount(addr);
    const account = new Account(existingAccount?.nonce || 0n, balance, existingAccount?.storageRoot, existingAccount?.codeHash);

    // Set the account with balance
    await this.stateManager.putAccount(addr, account);

    return addr;
  }

  async runCall(txData: TxData) {
    if (!this.evm) {
      throw new Error('EVM not initialized');
    }

    const step: {
      opcode: {
        name: string;
        fee: number;
        dynamicFee?: bigint;
        isAsync: boolean;
        code: number; // The hexadecimal representation of the opcode (e.g. 0x60 for PUSH1)
      };
      memory: Uint8Array<ArrayBufferLike>;
      stack: bigint[];
    }[] = [];
    const stepHandler = (snapshot: InterpreterStep) => {
      step.push({
        opcode: snapshot.opcode,
        memory: snapshot.memory,
        stack: snapshot.stack,
      });
    };

    this.evm.events.on('step', stepHandler);

    const fromAddr = new Address(Buffer.from(txData.from.startsWith('0x') ? txData.from.slice(2) : txData.from, 'hex'));
    const toAddr = new Address(Buffer.from(txData.to.startsWith('0x') ? txData.to.slice(2) : txData.to, 'hex'));

    const res = await this.evm.runCall({
      to: toAddr,
      caller: fromAddr,
      origin: fromAddr,
      value: txData.value,
      data: parsers.hexStringToUint8Array(txData.data),
      gasLimit: txData.gasLimit,
    });

    // Clean up the event listener
    this.evm.events.off('step', stepHandler);

    return {
      res,
      step,
    };
  }
}

export default EVM;
