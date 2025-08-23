import {
  ActionSnapshot,
  ActionType,
  ActionHistory,
  ReplayableAction,
  EVMStore,
  CreateNewEVMPayload,
  TxData,
} from "./types";
import { Address } from "@ethereumjs/util";

const ACTION_HISTORY_KEY = "evm-action-history";

/**
 * Action Recorder - Manages action snapshots for replay functionality
 */
export class ActionRecorder {
  private static instance: ActionRecorder;
  history: ActionHistory = {
    snapshots: [],
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
  recordAction(type: ActionType, payload: unknown): string {
    // Don't record actions during replay
    if (this.isReplaying) {
      return "";
    }

    const snapshot: ActionSnapshot = {
      id: crypto.randomUUID(),
      type,
      timestamp: Date.now(),
      payload: this.serializePayload(payload),
      // result: result ? this.serializePayload(result) : undefined,
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
   * Clear all action history
   */
  clearHistory(): void {
    this.history = {
      snapshots: [],
    };
    this.saveHistory();
    console.log("[ActionRecorder] Cleared action history");
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
    return this.getSnapshots().map((snapshot) => ({
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
        console.log(
          `[ActionRecorder] Loaded ${this.history.snapshots.length} action snapshots`,
        );
      }
    } catch (error) {
      console.warn("[ActionRecorder] Failed to load action history:", error);
      this.history = {
        snapshots: [],
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
      console.warn("[ActionRecorder] Failed to save action history:", error);
    }
  }

  /**
   * Serialize payload for storage (only handle BigInt automatically, Address should be manually formatted)
   */
  private serializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(
      JSON.stringify(payload, (_key, value) => {
        // Only handle BigInt automatically since it can't be JSON serialized
        if (typeof value === "bigint") {
          return [value.toString(), "BigInt"];
        }
        return value;
      }),
    );
  }

  /**
   * Deserialize payload from storage (restore types from [stringified_value, original_type] format)
   */
  private deserializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(JSON.stringify(payload), (_key, value) => {
      // Check if value is in our serialized format [stringified_value, original_type]
      if (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[1] === "string"
      ) {
        const [stringifiedValue, originalType] = value;

        switch (originalType) {
          case "Address": {
            const addrStr = stringifiedValue.startsWith("0x")
              ? stringifiedValue.slice(2)
              : stringifiedValue;
            return new Address(Buffer.from(addrStr, "hex"));
          }

          case "BigInt":
            return BigInt(stringifiedValue);

          default:
            // For other types, return the stringified value as-is
            return stringifiedValue;
        }
      }
      return value;
    });
  }

  /**
   * Get the appropriate executor function for an action type
   */
  private getActionExecutor(
    type: ActionType,
  ): (payload: unknown, evmStore: EVMStore) => Promise<unknown> {
    switch (type) {
      case "DEPLOY_CONTRACT":
        return async (payload: unknown, evmStore: EVMStore) => {
          return evmStore.deployContractToEVM(
            payload as CreateNewEVMPayload,
            false,
          );
        };

      case "CREATE_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: string };
          return evmStore.createAccount(typedPayload.address, false);
        };

      case "FUND_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address; balance: bigint };
          return evmStore.fundAccount(
            typedPayload.address,
            typedPayload.balance,
            false,
          );
        };

      case "CALL_FUNCTION":
        return async (payload: unknown, evmStore: EVMStore) => {
          return evmStore.callFunction(payload as TxData, false);
        };

      case "REGISTER_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address };
          return evmStore.registerAccount(typedPayload.address, false);
        };

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }
}

export default ActionRecorder;
