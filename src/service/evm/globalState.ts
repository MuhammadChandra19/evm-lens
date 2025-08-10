import { Account, Address, State } from "./types"

// For the sake of this test-based challenge,
// the global state is just a map of addresses to account info,
// which is passed directly from the test file.

export default class GlobalState {
  private _state: State

  /**
   * Initializes global state with the provided state mapping
   * @param _state - Initial state mapping from addresses to account data
   */
  constructor(_state: State) {
    this._state = _state
  }

  /**
   * Retrieves account information for a given address
   * @param address - The address to look up
   * @returns Account data or empty object if address not found
   */
  getAccount(address: Address): Account {
    return this._state[address] ?? {}
  }

  /**
   * Sets account information for a given address
   * @param address - The address to update
   * @param account - The account data to set
   */
  setAccount(address: Address, account: Account) {
    this._state[address] = account
  }

  /**
   * Gets the balance for a specific address
   * @param address - The address to check balance for
   * @returns Balance as bigint, or 0n if account doesn't exist
   */
  getBalance(address: Address): bigint {
    return this.getAccount(address)?.balance ?? 0n
  }
}
