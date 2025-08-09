import { BIGINT_0 } from '@/lib/constants';
import { Account, Address, State } from './types';

class GlobalState {
  private _state: State;

  private _recentBlockHashes?: Map<bigint, Buffer>;

  constructor(state: State, opts?: { recentBlockHashes?: Map<bigint, Buffer> }) {
    this._state = state;
    this._recentBlockHashes = opts?.recentBlockHashes;
  }

  setRecentBlockHashes(map: Map<bigint, Buffer>) {
    this._recentBlockHashes = map;
  }

  getBlockHash(blockNumber: bigint): Buffer | undefined {
    return this._recentBlockHashes?.get(blockNumber);
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
