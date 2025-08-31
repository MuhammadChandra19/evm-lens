import { Address } from '@ethereumjs/util';
import type { NewSnapshot, SnapshotType } from '@/repository/snapshot/entity';
import { SnapshotRepository } from '@/repository/snapshot/query';
import { AdapterReplayableAction, SnapshotResult } from './types';
import type { EVMAdapter } from '@/service/evm-adapter';
import type { CreateNewEVMPayload as AdapterPayload, TxData as AdapterTxData } from '@/service/evm-adapter/types';

export class ActionRecorder {
  private snapshotRepo: SnapshotRepository;
  private evmAdapter?: EVMAdapter;

  constructor(snapshotRepo: SnapshotRepository) {
    this.snapshotRepo = snapshotRepo;
  }

  /**
   * Set the EVM adapter for new adapter-based operations
   */
  setEVMAdapter(evmAdapter: EVMAdapter) {
    this.evmAdapter = evmAdapter;
  }
  async loadSnapshot(playgroundId: number): Promise<SnapshotResult<AdapterReplayableAction[]>> {
    return this.loadSnapshotWithAdapter(playgroundId);
  }

  async recordAction(type: SnapshotType, payload: unknown, gasUsed: string, playgroundId: number): Promise<SnapshotResult<number>> {
    try {
      // Serialize BigInt and Address values for database storage
      const serializedPayload = this.serializePayload(payload);
      const data: NewSnapshot = {
        playgroundId,
        type,
        payload: serializedPayload,
        gasUsed,
      };
      const res = await this.snapshotRepo.create(data);

      if (res.length > 0) {
        return {
          data: res[0].id,
          error: null,
        };
      }

      return {
        data: 0,
        error: new Error('no snapshot recorded'),
      };
    } catch (e) {
      return {
        data: 0,
        error: new Error('failed to record snapshot', {
          cause: e,
        }),
      };
    }
  }

  private serializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(
      JSON.stringify(payload, (_key, value) => {
        // Only handle BigInt automatically since it can't be JSON serialized
        if (typeof value === 'bigint') {
          return [value.toString(), 'BigInt'];
        }
        return value;
      })
    );
  }

  private deserializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(JSON.stringify(payload), (_key, value) => {
      // Check if value is in our serialized format [stringified_value, original_type]
      if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'string') {
        const [stringifiedValue, originalType] = value;

        switch (originalType) {
          case 'Address': {
            const addrStr = stringifiedValue.startsWith('0x') ? stringifiedValue.slice(2) : stringifiedValue;
            return new Address(Buffer.from(addrStr, 'hex'));
          }

          case 'BigInt':
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
   * Get the appropriate adapter-based executor function for an action type
   * Uses EVM adapter with shouldRecord: false to prevent double recording
   */
  private getAdapterActionExecutor(type: SnapshotType, playgroundId: number): (payload: unknown) => Promise<unknown> {
    if (!this.evmAdapter) {
      throw new Error('EVM adapter not initialized');
    }

    switch (type) {
      case 'DEPLOY_CONTRACT':
        return async (payload: unknown) => {
          const result = await this.evmAdapter!.deployContract(
            payload as AdapterPayload,
            playgroundId,
            false // shouldRecord: false to prevent double recording
          );
          return result.data;
        };

      case 'CREATE_ACCOUNT':
        return async (payload: unknown) => {
          const typedPayload = payload as { address: string };
          const result = await this.evmAdapter!.createAccount(
            typedPayload.address,
            playgroundId,
            false // shouldRecord: false to prevent double recording
          );
          return result.data;
        };

      case 'FUND_ACCOUNT':
        return async (payload: unknown) => {
          const typedPayload = payload as { address: Address; balance: bigint };
          const result = await this.evmAdapter!.fundAccount(
            typedPayload.address,
            typedPayload.balance,
            playgroundId,
            false // shouldRecord: false to prevent double recording
          );
          return result.data;
        };

      case 'CALL_FUNCTION':
        return async (payload: unknown) => {
          const result = await this.evmAdapter!.callFunction(
            payload as AdapterTxData,
            playgroundId,
            false // shouldRecord: false to prevent double recording
          );
          return result.data;
        };

      case 'REGISTER_ACCOUNT':
        return async (payload: unknown) => {
          const typedPayload = payload as { address: string };
          const result = await this.evmAdapter!.createAccount(
            typedPayload.address,
            playgroundId,
            false // shouldRecord: false to prevent double recording
          );
          return result.data;
        };

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  /**
   * Load snapshots with adapter-based executors
   * This will be used when we fully migrate to adapter-based execution
   */
  async loadSnapshotWithAdapter(playgroundId: number): Promise<SnapshotResult<AdapterReplayableAction[]>> {
    if (!this.evmAdapter) {
      return {
        data: [],
        error: new Error('EVM adapter not initialized'),
      };
    }

    try {
      const res = await this.snapshotRepo.loadPlaygroundSnapshot(playgroundId);

      const replayableAction: AdapterReplayableAction[] = res.map((snapshot) => ({
        type: snapshot.type,
        payload: this.deserializePayload(snapshot.payload),
        execute: this.getAdapterActionExecutor(snapshot.type, playgroundId),
      }));

      return {
        data: replayableAction,
        error: null,
      };
    } catch (e) {
      return {
        data: [],
        error: new Error('failed to load snapshot with adapter', {
          cause: e,
        }),
      };
    }
  }

  /**
   * Load unified snapshots with adapter-based executors
   * This will be used when we fully migrate to adapter-based execution
   */
  async loadUnifiedSnapshotWithAdapter(): Promise<SnapshotResult<AdapterReplayableAction[]>> {
    if (!this.evmAdapter) {
      return {
        data: [],
        error: new Error('EVM adapter not initialized'),
      };
    }

    try {
      const res = await this.snapshotRepo.loadAllSnapshotsOrderedByTime();

      const replayableAction: AdapterReplayableAction[] = res.map((snapshot) => ({
        type: snapshot.type,
        payload: this.deserializePayload(snapshot.payload),
        execute: this.getAdapterActionExecutor(snapshot.type, snapshot.playgroundId || 0),
      }));

      return {
        data: replayableAction,
        error: null,
      };
    } catch (e) {
      return {
        data: [],
        error: new Error('failed to load unified snapshot with adapter', {
          cause: e,
        }),
      };
    }
  }
}
