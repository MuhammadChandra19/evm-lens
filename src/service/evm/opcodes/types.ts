import { MachineState } from '../machine-state/types';

/**
 * Opcode is a number between 0 and 255
 *
 * @see https://eips.ethereum.org/EIPS/eip-140#opcode-table
 */
export type Opcode = number;
/**
 * Runner is a function that takes a MachineState and returns void or a Promise<void>
 *
 */
export type Runner = (state: MachineState) => void | Promise<void>;

/**
 * OpcodeDefinition is a record of Opcode to OpcodeDefinition
 */
export type OpcodeDefinition = {
  name: string;
  runner: Runner;
};

export type OpcodeRunner = Runner;

/**
 * Runners is a record of Opcode to OpcodeDefinition
 */
export type Runners = Record<Opcode, OpcodeDefinition>;
