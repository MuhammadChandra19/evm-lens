export type Gas = bigint;
export type Value = bigint;
export type Address = string;
export type ProgramCounter = number;
export type Calldata = Buffer;

/**
 * TxData is the data for a transaction
 */
export interface TxData {
  to: Address;
  from: Address;
  value: Value;
  origin: Address;
  gasprice: Gas;
  data: Calldata;
}

export interface State {
  [key: Address]: Account;
}

export interface Account {
  balance?: Value;
  code?: Uint8Array;
}
