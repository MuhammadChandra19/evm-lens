# Unified EVM Architecture

## Overview

The EVM Lens now uses a **unified EVM state** where all playgrounds share the same blockchain state. Actions from different playgrounds are executed chronologically, creating a realistic blockchain simulation where all transactions happen in sequence on the same chain.

## Architecture Changes

### ❌ **Before (Playground-Specific EVM):**
- Each playground created its own fresh EVM instance
- ActionRecorder loaded snapshots filtered by `playgroundId`
- Each playground had isolated state - no interaction between playgrounds
- Switching playgrounds = completely new EVM state

### ✅ **After (Unified EVM):**
- Single shared EVM instance across all playgrounds
- ActionRecorder loads ALL snapshots sorted by timestamp
- All playgrounds contribute to the same blockchain state
- Switching playgrounds = same EVM state, different view/context

## Implementation Details

### 1. **ActionRecorder Updates**

#### New Method: `loadUnifiedSnapshot()`
```typescript
async loadUnifiedSnapshot(): Promise<SnapshotResult<ReplayableAction[]>>
```
- Loads ALL snapshots from ALL playgrounds
- Orders them chronologically by timestamp
- Creates replayable actions for unified EVM state

#### Repository Method: `loadAllSnapshotsOrderedByTime()`
```sql
SELECT * FROM snapshot ORDER BY timestamp ASC
```
- Returns all snapshots across all playgrounds
- Sorted by timestamp for chronological execution

### 2. **EVM Store Updates**

#### New Method: `initializeUnifiedEVM()`
```typescript
initializeUnifiedEVM: (actionRecorder: ActionRecorder) => Promise<void>
```
- Creates fresh EVM instance
- Loads all snapshots chronologically
- Replays all actions to build unified state
- Handles errors gracefully

### 3. **PlaygroundProvider Updates**

#### Unified Initialization
- Runs once on mount (not per playground)
- Uses `initializeUnifiedEVM()` instead of `createFreshEVM()`
- Sets playground context for new actions only
- All playgrounds share the same EVM state

## Benefits

### 🎯 **Realistic Blockchain Simulation**
- Actions execute in chronological order (like real blockchain)
- Cross-playground interactions are possible
- True blockchain state continuity

### ⚡ **Performance Improvements**
- Single EVM initialization instead of per-playground
- Shared state reduces memory usage
- Faster playground switching (no state rebuild)

### 🔄 **Better User Experience**
- Actions from one playground affect others (realistic)
- State persists across playground switches
- True blockchain-like behavior

## Usage Examples

### **Scenario 1: Cross-Playground Contract Interaction**
1. **Playground A**: Deploy contract at address `0x123...`
2. **Playground B**: Can interact with the same contract at `0x123...`
3. **Result**: Both playgrounds see the same contract state

### **Scenario 2: Account Balance Continuity**
1. **Playground A**: Create account `0xabc...` with 100 ETH
2. **Playground B**: Same account `0xabc...` still has 100 ETH
3. **Playground B**: Transfer 50 ETH to another account
4. **Playground A**: Account `0xabc...` now shows 50 ETH

### **Scenario 3: Chronological Execution**
```
Timeline:
10:00 AM - Playground A: Deploy Contract
10:05 AM - Playground B: Fund Account  
10:10 AM - Playground A: Call Contract Function
10:15 AM - Playground B: Transfer Tokens

Unified EVM executes in order: Deploy → Fund → Call → Transfer
```

## Database Schema

### Snapshot Table
```sql
CREATE TABLE snapshot (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,
  playground_id INTEGER,  -- Still tracks which playground created the action
  timestamp TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,  -- Key for chronological ordering
  payload TEXT NOT NULL,
  FOREIGN KEY (playground_id) REFERENCES playground(id)
);
```

### Key Changes
- `timestamp` field is crucial for chronological ordering
- `playground_id` still tracked for context/debugging
- All snapshots loaded regardless of `playground_id`

## Migration Guide

### For Existing Data
- Existing snapshots will work with unified EVM
- They'll be replayed chronologically by timestamp
- No data migration required

### For New Development
- Actions are still recorded with `playground_id` context
- New actions append to unified timeline
- Each playground can still track its own "view" of the state

## Configuration

### Enable/Disable Unified EVM
The unified EVM is now the default behavior. To revert to playground-specific EVM (not recommended):

1. Use `loadSnapshot()` instead of `loadUnifiedSnapshot()`
2. Use `createFreshEVM()` instead of `initializeUnifiedEVM()`
3. Filter snapshots by `playground_id`

### Debug Logging
```typescript
// In EVM Store initialization
console.log(`🔄 Replaying ${actions.length} actions from all playgrounds to create unified EVM state`);
```

## Testing

### Test Scenarios
1. **Cross-Playground State**: Deploy in one, interact from another
2. **Chronological Order**: Verify actions execute by timestamp, not playground
3. **State Persistence**: Switch playgrounds and verify state remains
4. **Error Handling**: Failed actions don't break unified state

### Verification
```typescript
// Check that all playgrounds see the same EVM state
const playground1State = await getEVMState();
// Switch to playground 2
const playground2State = await getEVMState();
// Should be identical
assert(playground1State === playground2State);
```

## Future Enhancements

### Possible Improvements
1. **Playground Filtering**: Option to view only actions from specific playground
2. **State Branching**: Create playground-specific branches from unified state
3. **Time Travel**: Jump to specific points in unified timeline
4. **Conflict Resolution**: Handle conflicting actions from different playgrounds

### Performance Optimizations
1. **Lazy Loading**: Load snapshots in chunks for large datasets
2. **State Caching**: Cache intermediate states for faster replay
3. **Incremental Updates**: Only replay new actions since last state

## Conclusion

The unified EVM architecture creates a more realistic and powerful blockchain simulation environment. All playgrounds now contribute to a single, shared blockchain state, enabling true cross-playground interactions and providing a more authentic blockchain development experience.
