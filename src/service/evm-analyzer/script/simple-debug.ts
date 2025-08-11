/* eslint-disable @typescript-eslint/no-unused-vars */
import EVM from '..';
import { Address } from '@ethereumjs/util';
import { parsers } from '../../evm/opcodes/utils';

const evm = await EVM.initEvm();

// Deploy the contract constructor code
const deployResult = await evm.deployContract('6080604052600436106100225760003560e01c8063d0e30db0146100275761002e565b61002e565b5b6001600052602060006000f35b600080fd');
// console.log('Deploy result:', deployResult);

const contractAddr = new Address(Buffer.from('abcdefabcdefabcdefabcdefabcdefabcdefabcd', 'hex'));

// Create the contract address and deploy the runtime code to it
await evm.newAddress(contractAddr.toString());

// Deploy the actual runtime bytecode (this is a simple deposit contract)
// This bytecode checks for the deposit function selector (d0e30db0) and returns 1
const runtimeBytecode = '6080604052600436106100225760003560e01c8063d0e30db0146100275761002e565b61002e565b5b6001600052602060006000f35b600080fd';
await evm.stateManager?.putCode(contractAddr, parsers.hexStringToUint8Array(runtimeBytecode));

// Check if contract code was deployed
const contractCode = await evm.stateManager?.getCode(contractAddr);
// console.log('Contract code deployed:', contractCode?.length, 'bytes');

// Fund the from address with 10 ETH (10 * 10^18 wei)
const fromAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
await evm.fundAddress(fromAddress, BigInt('10000000000000000000'));

// Verify the balance was set correctly
const fundedAddr = new Address(Buffer.from('abcdefabcdefabcdefabcdefabcdefabcdefabcd', 'hex'));
const account = await evm.stateManager?.getAccount(fundedAddr);
// console.log('Funded account balance:', account?.balance);

const result = await evm.runCall({
  from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  to: contractAddr.toString(),
  value: BigInt(1000000000000000000),
  data: 'd0e30db0',
  gasLimit: BigInt(1000000),
});

console.log('Execution result:', result.step);
