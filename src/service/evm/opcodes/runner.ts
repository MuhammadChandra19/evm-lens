import { Runners } from './types';
import * as controlFlow from './operations/control-flow';
import * as arithmetic from './operations/arithmetic';
import * as comparison from './operations/comparison';
import * as bitwise from './operations/bitwise';
import * as keccak from './operations/keccak';

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
};

export default runners;
