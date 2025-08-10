// src/service/evm/script/test_callvalue_simple.ts
import EVM from '..';
import { parsers } from '../opcodes/utils';
import { buildTxData, buildState } from '../utils';

// Simple bytecode: CALLVALUE PUSH1 0 MSTORE PUSH1 32 PUSH1 0 RETURN
// This just returns whatever msg.value was sent
const testBytecode = '3460005260206000f3';

const evm = new EVM({ debug: false });

console.log('🧪 Testing CALLVALUE with different amounts...\n');

// Test 1: Send 0 ETH
const result1 = await evm.start({
  _code: parsers.hexStringToUint8Array(testBytecode),
  _txData: buildTxData({
    tx: {
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef123456',
      data: '',
      value: 0n, // 0 ETH
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

console.log('Test 1 - 0 ETH:');
console.log('Return data:', result1.return);
console.log('Expected: all zeros');
console.log('Success:', result1.success);

// Test 2: Send 1 ETH
const result2 = await evm.start({
  _code: parsers.hexStringToUint8Array(testBytecode),
  _txData: buildTxData({
    tx: {
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef123456',
      data: '',
      value: 1000000000000000000n, // 1 ETH as number
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

console.log('\nTest 2 - 1 ETH:');
console.log('Return data:', result2.return);
console.log('Expected: 0x0de0b6b3a7640000 (1 ETH in hex)');
console.log('Success:', result2.success);

// Test 3: Send 1 ETH as BigInt
const result3 = await evm.start({
  _code: parsers.hexStringToUint8Array(testBytecode),
  _txData: buildTxData({
    tx: {
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef123456',
      data: '',
      value: BigInt(1000000000000000000), // 1 ETH as BigInt
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

console.log('\nTest 3 - 1 ETH (BigInt):');
console.log('Return data:', result3.return);
console.log('Expected: 0x0de0b6b3a7640000 (1 ETH in hex)');
console.log('Success:', result3.success);
