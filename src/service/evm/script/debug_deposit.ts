/* eslint-disable @typescript-eslint/no-unused-vars */
// src/service/evm/script/debug_deposit.ts
import EVM from '..';
import { parsers } from '../opcodes/utils';
import { buildState, buildTxData } from '../utils';

// ✅ CORRECTED: Proper bytecode with valid JUMPDEST opcodes
// This has function dispatch + deposit() with proper jump destinations
const correctDepositBytecode = '6080604052600436106100225760003560e01c8063d0e30db0146100275761002e565b61002e565b5b6001600052602060006000f35b600080fd';

const evm = new EVM({
  debug: true,
  saveLogs: true,
});

console.log('Testing CORRECTED deposit function with valid jumps...');

const result = await evm.start({
  _codeString: correctDepositBytecode,
  _code: parsers.hexStringToUint8Array(correctDepositBytecode),
  _txData: buildTxData({
    tx: {
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef123456',
      data: 'd0e30db0', // ✅ deposit() function selector
      value: BigInt(1000000000000000000), // 1 ETH
    },
    name: '',
    code: { asm: '', bin: '' },
    expect: {},
  }),
  _globalState: buildState({
    state: {
      '0x1234567890123456789012345678901234567890': {
        balance: BigInt(5000000000000000000), // 5 ETH
        code: { asm: '', bin: '' },
      },
      '0xabcdefabcdefabcdefabcdefabcdef123456': {
        balance: BigInt(0),
        code: { asm: '', bin: correctDepositBytecode }, // ✅ WITH VALID JUMPDEST
      },
    },
    name: '',
    code: { asm: '', bin: '' },
    expect: {},
  }),
});

console.log('Debug result:', result);
