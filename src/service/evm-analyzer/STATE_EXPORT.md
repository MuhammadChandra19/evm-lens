# EVM State Export Documentation

This document describes the state export and management capabilities added to the EVM Analyzer service layer, including the new consistent address handling system.

## Overview

The EVM Analyzer now provides comprehensive state export and management functionality that allows you to:

- Export complete EVM state including accounts, contracts, and blockchain data
- Create and manage state checkpoints for rollback scenarios
- Import and restore state from exported data
- Access raw ethereumjs components for advanced usage
- Manage state roots for precise state control

## Key Components

### 1. EVMManager State Methods

The `EVMManager` class now includes these state management methods:

```typescript
// State root operations
async getStateRoot(): Promise<Uint8Array>
async setStateRoot(root: Uint8Array): Promise<void>

// Checkpoint management
async checkpoint(): Promise<void>
async commit(): Promise<void>
async revert(): Promise<void>

// State persistence
async flush(): Promise<void>
```

### 2. StateManagerService Extensions

The `StateManagerService` has been enhanced with:

```typescript
// Storage operations
async getStorage(address: string, key: Uint8Array): Promise<Uint8Array>
async putStorage(address: string, key: Uint8Array, value: Uint8Array): Promise<void>

// Account state export
async exportAccountState(address: string): Promise<{
  account: AccountInfo | null;
  code?: Uint8Array;
  storage?: Map<string, Uint8Array>;
}>

// All state management methods (checkpoint, commit, revert, flush)
```

### 3. EVMAnalyzer Main Interface

The main `EVMAnalyzer` class provides high-level state export methods:

```typescript
// Complete state export
async exportState(): Promise<ExportedEVMState>

// State import
async importState(stateData: ImportableEVMState): Promise<void>

// Checkpoint management
async createCheckpoint(): Promise<void>
async restoreCheckpoint(): Promise<void>

// Direct component access
get rawEVM(): EVM
get rawBlockchain(): Blockchain
get rawStateManager(): MerkleStateManager
```

## Usage Examples

### Basic State Export

```typescript
import EVMAnalyzer from "./service/evm-analyzer";

const evm = await EVMAnalyzer.create();

// Deploy contracts, create accounts, etc.
// ...

// Export complete state
const exportedState = await evm.exportState();
console.log("State Root:", exportedState.stateRoot);
console.log("Block Number:", exportedState.blockchain.latestBlockNumber);
```

### Checkpoint and Rollback

```typescript
// Create a checkpoint
await evm.createCheckpoint();

// Make some changes
await evm.createAccount("0x123...");
await evm.fundAccount("0x123...", BigInt(1000));

// Rollback to checkpoint
await evm.restoreCheckpoint();
// The account changes are now reverted
```

### State Import/Export

```typescript
// Export state
const stateData = await evm.exportState();

// Create new EVM instance
const newEvm = await EVMAnalyzer.create();

// Import the state
await newEvm.importState({
  stateRoot: stateData.stateRoot,
  accounts: [
    {
      address: "0x123...",
      balance: "1000000000000000000",
      nonce: "0",
      code: "0x608060405234801561001057600080fd5b50...",
    },
  ],
});
```

### Direct Component Access

```typescript
// Access raw ethereumjs components
const rawStateManager = evm.rawStateManager;
const rawBlockchain = evm.rawBlockchain;
const rawEVM = evm.rawEVM;

// Use ethereumjs APIs directly
const account = await rawStateManager.getAccount(address);
const block = await rawBlockchain.getCanonicalHeadBlock();
```

## Type Definitions

### ExportedEVMState

```typescript
interface ExportedEVMState {
  stateRoot: string;
  accounts: ExportedAccountState[];
  blockchain: {
    latestBlockNumber: bigint;
    latestBlockHash?: string;
  };
}
```

### ExportedAccountState

```typescript
interface ExportedAccountState {
  address: string;
  balance: string;
  nonce: string;
  code?: string;
  storage?: Array<[string, string]>;
}
```

### ImportableEVMState

```typescript
interface ImportableEVMState {
  stateRoot: string;
  accounts?: Array<{
    address: string;
    balance: string;
    nonce: string;
    code?: string;
    storage?: Array<[string, string]>;
  }>;
}
```

## Important Notes

### EthereumJS v10 Limitations

- **No State Copying**: The `copy()` method is not available on `MerkleStateManager` in v10
- **Use Checkpoints**: Instead of copying state, use the checkpoint/commit/revert pattern
- **Blockchain API**: Use `getCanonicalHeadBlock()` instead of `getLatestBlock()`

### Performance Considerations

1. **State Export**: Exporting large states can be memory-intensive
2. **Storage Iteration**: Complete storage export requires iterating through all slots
3. **Checkpoint Overhead**: Frequent checkpointing may impact performance
4. **Flush Operations**: Call `flush()` to ensure state persistence

### Security Considerations

1. **State Validation**: Always validate imported state data
2. **Address Verification**: Ensure addresses are properly formatted
3. **Balance Limits**: Validate balance values to prevent overflow
4. **Code Verification**: Verify contract bytecode before importing

## Integration with Existing Store

The new service-layer functionality is designed to work alongside the existing Zustand store:

```typescript
// In your store actions
const exportedState = await evm.exportState();
localStorage.setItem("evm-state-backup", JSON.stringify(exportedState));

// Later restore
const backupData = JSON.parse(localStorage.getItem("evm-state-backup"));
await evm.importState(backupData);
```

## Best Practices

1. **Always Checkpoint**: Create checkpoints before risky operations
2. **Regular Flushing**: Call `flush()` after important state changes
3. **Error Handling**: Wrap state operations in try-catch blocks
4. **State Validation**: Validate state before import operations
5. **Resource Cleanup**: Always call `cleanup()` when done

## Example Script

See `src/service/evm-analyzer/script/state-export-example.ts` for a complete working example demonstrating all the state export functionality.

## Future Enhancements

Potential improvements for future versions:

1. **Incremental Export**: Export only changed state since last checkpoint
2. **Compression**: Compress exported state data for storage efficiency
3. **State Diffing**: Compare states and show differences
4. **Batch Operations**: Batch multiple state operations for better performance
5. **State Streaming**: Stream large state exports to avoid memory issues
