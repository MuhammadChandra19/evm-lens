// src/service/evm/script/test_callvalue.ts
import EVM from '..';
import { parsers } from '../opcodes/utils';
import { buildTxData, buildState } from '../utils';

// Simple bytecode that just returns msg.value
// CALLVALUE PUSH1 0 MSTORE PUSH1 32 PUSH1 0 RETURN
const simpleCallValueTest = '3460005260206000f3';

const evm = new EVM({ debug: false });

const result = await evm.start({
  _code: parsers.hexStringToUint8Array(simpleCallValueTest),
  _txData: buildTxData({
    tx: {
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef123456',
      data: '',
      value: BigInt(1000000000000000000), // 1 ETH
    },
    name: '',
    code: { asm: '', bin: '' },
    expect: {},
  }),
  _globalState: buildState({
    state: {
      '0x1234567890123456789012345678901234567890': {
        balance: BigInt(5000000000000000000),
        code: { asm: '', bin: '' },
      },
    },
    name: '',
    code: { asm: '', bin: '' },
    expect: {},
  }),
});

console.log('CALLVALUE test result:', result);
console.log('Return data should be 1 ETH in hex:', result.return);
