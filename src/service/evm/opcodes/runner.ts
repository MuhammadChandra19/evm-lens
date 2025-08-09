import { Runners } from './types';
import * as controlFlow from './operations/control-flow';
import * as arithmetic from './operations/arithmetic';
import * as comparison from './operations/comparison';
import * as bitwise from './operations/bitwise';
import * as keccak from './operations/keccak';
import * as enviromental from './operations/enviromental';
import * as block from './operations/block';

const runners: Runners = {
  0x00: { name: 'STOP', runner: controlFlow.STOP },

  0x01: { name: 'ADD', runner: arithmetic.ADD },
  0x02: { name: 'MUL', runner: arithmetic.MUL },
  0x03: { name: 'SUB', runner: arithmetic.SUB },
  0x04: { name: 'DIV', runner: arithmetic.DIV },
  0x05: { name: 'SDIV', runner: arithmetic.SDIV },
  0x06: { name: 'MOD', runner: arithmetic.MOD },
  0x07: { name: 'SMOD', runner: arithmetic.SMOD },
  0x08: { name: 'ADDMOD', runner: arithmetic.ADDMOD },
  0x09: { name: 'MULMOD', runner: arithmetic.MULMOD },
  0x0a: { name: 'EXP', runner: arithmetic.EXP },
  0x0b: { name: 'SIGNEXTEND', runner: arithmetic.SIGNEXTEND },

  0x10: { name: 'LT', runner: comparison.LT },
  0x11: { name: 'GT', runner: comparison.GT },
  0x12: { name: 'SLT', runner: comparison.SLT },
  0x13: { name: 'SGT', runner: comparison.SGT },
  0x14: { name: 'EQ', runner: comparison.EQ },
  0x15: { name: 'ISZERO', runner: comparison.ISZERO },

  0x16: { name: 'AND', runner: bitwise.AND },
  0x17: { name: 'OR', runner: bitwise.OR },
  0x18: { name: 'XOR', runner: bitwise.XOR },
  0x19: { name: 'NOT', runner: bitwise.NOT },
  0x1a: { name: 'BYTE', runner: bitwise.BYTE },
  0x1b: { name: 'SHL', runner: bitwise.SHL },
  0x1c: { name: 'SHR', runner: bitwise.SHR },
  0x1d: { name: 'SAR', runner: bitwise.SAR },

  0x20: { name: 'KECCAK256', runner: keccak.KECCAK256 },

  0x30: { name: 'ADDRESS', runner: enviromental.ADDRESS },
  0x31: { name: 'BALANCE', runner: enviromental.BALANCE },
  0x32: { name: 'ORIGIN', runner: enviromental.ORIGIN },
  0x33: { name: 'CALLER', runner: enviromental.CALLER },
  0x34: { name: 'CALLVALUE', runner: enviromental.CALLVALUE },
  0x35: { name: 'CALLDATALOAD', runner: enviromental.CALLDATALOAD },
  0x36: { name: 'CALLDATASIZE', runner: enviromental.CALLDATASIZE },
  0x37: { name: 'CALLDATACOPY', runner: enviromental.CALLDATACOPY },
  0x38: { name: 'CODESIZE', runner: enviromental.CODESIZE },
  0x39: { name: 'CODECOPY', runner: enviromental.CODECOPY },
  0x3a: { name: 'GASPRICE', runner: enviromental.GASPRICE },
  0x3b: { name: 'EXTCODESIZE', runner: enviromental.EXTCODESIZE },
  0x3c: { name: 'EXTCODECOPY', runner: enviromental.EXTCODECOPY },
  0x3d: { name: 'RETURNDATASIZE', runner: enviromental.RETURNDATASIZE },
  0x3e: { name: 'RETURNDATACOPY', runner: enviromental.RETURNDATACOPY },
  0x3f: { name: 'EXTCODEHASH', runner: enviromental.EXTCODEHASH },

  0x40: { name: 'BLOCKHASH', runner: block.BLOCKHASH },
  0x41: { name: 'COINBASE', runner: block.COINBASE },
  0x42: { name: 'TIMESTAMP', runner: block.TIMESTAMP },
  0x43: { name: 'NUMBER', runner: block.NUMBER },
  0x44: { name: 'DIFFICULTY', runner: block.DIFFICULTY },
  0x45: { name: 'GASLIMIT', runner: block.GASLIMIT },
  0x46: { name: 'CHAINID', runner: block.CHAINID },
  0x47: { name: 'SELFBALANCE', runner: block.SELFBALANCE },
  0x48: { name: 'BASEFEE', runner: block.BASEFEE },
};

export default runners;
