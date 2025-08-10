// src/service/evm/script/debug_memory.ts
import EVM from '..';
import { parsers } from '../opcodes/utils';

// Test simple memory operations first
const simpleMemoryTest = '6080604052'; // PUSH1 0x80 PUSH1 0x40 MSTORE

const evm = new EVM({ debug: true });

try {
  const result = await evm.start({
    _code: parsers.hexStringToUint8Array(simpleMemoryTest),
  });
  console.log('Simple memory test passed:', result);
} catch (error) {
  console.error('Memory test failed:', error);
}
