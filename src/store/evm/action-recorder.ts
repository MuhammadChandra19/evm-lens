import { ActionSnapshot, ActionType, ActionHistory, ReplayableAction, EVMStore, CreateNewEVMPayload, TxData } from './types';
import { Address } from '@ethereumjs/util';

const ACTION_HISTORY_KEY = 'evm-action-history';

/**
 * Action Recorder - Manages action snapshots for replay functionality
 */
export class ActionRecorder {
  private static instance: ActionRecorder;
  private history: ActionHistory = {
    snapshots: [],
    lastReplayedIndex: -1,
  };
  private isReplaying = false;

  private constructor() {
    this.loadHistory();
  }

  static getInstance(): ActionRecorder {
    if (!ActionRecorder.instance) {
      ActionRecorder.instance = new ActionRecorder();
    }
    return ActionRecorder.instance;
  }

  /**
   * Record an action snapshot
   */
  recordAction(type: ActionType, payload: unknown, result?: unknown): string {
    // Don't record actions during replay
    if (this.isReplaying) {
      return '';
    }

    const snapshot: ActionSnapshot = {
      id: crypto.randomUUID(),
      type,
      timestamp: Date.now(),
      payload: this.serializePayload(payload),
      result: result ? this.serializePayload(result) : undefined,
    };

    this.history.snapshots.push(snapshot);
    this.saveHistory();

    console.log(`[ActionRecorder] Recorded action: ${type}`, snapshot);
    return snapshot.id;
  }

  /**
   * Get all recorded snapshots
   */
  getSnapshots(): ActionSnapshot[] {
    return [...this.history.snapshots];
  }

  /**
   * Get snapshots that haven't been replayed yet
   */
  getUnreplayedSnapshots(): ActionSnapshot[] {
    return this.history.snapshots.slice(this.history.lastReplayedIndex + 1);
  }

  /**
   * Mark snapshots as replayed up to a certain index
   */
  markReplayed(index: number): void {
    this.history.lastReplayedIndex = Math.max(this.history.lastReplayedIndex, index);
    this.saveHistory();
  }

  /**
   * Clear all action history
   */
  clearHistory(): void {
    this.history = {
      snapshots: [],
      lastReplayedIndex: -1,
    };
    this.saveHistory();
    console.log('[ActionRecorder] Cleared action history');
  }

  /**
   * Set replay mode
   */
  setReplayMode(isReplaying: boolean): void {
    this.isReplaying = isReplaying;
  }

  /**
   * Check if currently in replay mode
   */
  isInReplayMode(): boolean {
    return this.isReplaying;
  }

  /**
   * Get replayable actions for execution
   */
  getReplayableActions(): ReplayableAction[] {
    return this.getUnreplayedSnapshots().map((snapshot) => ({
      type: snapshot.type,
      payload: this.deserializePayload(snapshot.payload),
      execute: this.getActionExecutor(snapshot.type),
    }));
  }

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(ACTION_HISTORY_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
        console.log(`[ActionRecorder] Loaded ${this.history.snapshots.length} action snapshots`);
      }
    } catch (error) {
      console.warn('[ActionRecorder] Failed to load action history:', error);
      this.history = {
        snapshots: [],
        lastReplayedIndex: -1,
      };
    }
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(ACTION_HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.warn('[ActionRecorder] Failed to save action history:', error);
    }
  }

  /**
   * Serialize payload for storage (handle Address and BigInt types)
   */
  private serializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(
      JSON.stringify(payload, (_key, value) => {
        // Handle Address objects
        if (value && typeof value === 'object' && value.constructor?.name === 'Address') {
          return {
            __type: 'Address',
            value: value.toString(),
          };
        }
        // Handle BigInt
        if (typeof value === 'bigint') {
          return {
            __type: 'BigInt',
            value: value.toString(),
          };
        }
        return value;
      })
    );
  }

  /**
   * Deserialize payload from storage (restore Address and BigInt types)
   */
  private deserializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(JSON.stringify(payload), (_key, value) => {
      if (value && typeof value === 'object') {
        // Restore Address objects
        if (value.__type === 'Address') {
          const addrStr = value.value.startsWith('0x') ? value.value.slice(2) : value.value;
          return new Address(Buffer.from(addrStr, 'hex'));
        }
        // Restore BigInt
        if (value.__type === 'BigInt') {
          return BigInt(value.value);
        }
      }
      return value;
    });
  }

  /**
   * Get the appropriate executor function for an action type
   */
  private getActionExecutor(type: ActionType): (payload: unknown, evmStore: EVMStore) => Promise<unknown> {
    switch (type) {
      case 'DEPLOY_CONTRACT':
        return async (payload: unknown, evmStore: EVMStore) => {
          return evmStore.deployContractToEVM(payload as CreateNewEVMPayload);
        };

      case 'CREATE_ACCOUNT':
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: string };
          return evmStore.createAccount(typedPayload.address);
        };

      case 'FUND_ACCOUNT':
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address; balance: bigint };
          return evmStore.fundAccount(typedPayload.address, typedPayload.balance);
        };

      case 'CALL_FUNCTION':
        return async (payload: unknown, evmStore: EVMStore) => {
          return evmStore.callFunction(payload as TxData);
        };

      case 'REGISTER_ACCOUNT':
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address };
          return evmStore.registerAccount(typedPayload.address);
        };

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }
}

export default ActionRecorder;
