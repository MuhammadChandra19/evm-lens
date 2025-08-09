import { BIGINT_0 } from '@/lib/constants';
import { Account, Address, State } from './types';

class GlobalState {
  private _state: State;

  constructor(state: State) {
    this._state = state;
  }

  getAccount(address: Address) {
    return this._state[address];
  }

  setAccount(address: Address, account: Account) {
    this._state[address] = account;
  }

  getBalance(address: Address) {
    const account = this.getAccount(address);
    return account?.balance ?? BIGINT_0;
  }
}

export default GlobalState;
