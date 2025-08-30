# Repository Configuration

This directory contains the database repository with configurable table clearing functionality.

## Quick Start

### Enable Table Clearing

To clear database tables on initialization, edit `src/repository/config.ts`:

```typescript
const defaultConfig: RepositoryConfig = {
  clearTablesOnInit: true, // Set to true to clear tables on init
  enableDebugLogging: true, // Enable to see what's happening
  databaseName: "evmdb.sqlite3",
  tablesToClear: [], // Empty means clear all tables
};
```

### Clear Specific Tables Only

To clear only certain tables:

```typescript
const defaultConfig: RepositoryConfig = {
  clearTablesOnInit: true,
  enableDebugLogging: true,
  databaseName: "evmdb.sqlite3",
  tablesToClear: ["playground"], // Only clear playground table
};
```

## Development Utilities

### Programmatic Usage

After initializing the repository, you can clear tables using the built-in method:

```typescript
import initRepository from "@/repository";

const repo = await initRepository();

// Clear all tables
await repo.clearTables();

// Clear specific tables
await repo.clearTables(["playground"]);
await repo.clearTables(["snapshot"]);
```

## Configuration Options

| Option               | Type    | Default           | Description                                   |
| -------------------- | ------- | ----------------- | --------------------------------------------- |
| `clearTablesOnInit`  | boolean | `false`           | Clear tables when repository initializes      |
| `enableDebugLogging` | boolean | `false`           | Show detailed logging during operations       |
| `databaseName`       | string  | `"evmdb.sqlite3"` | SQLite database file name                     |
| `tablesToClear`      | array   | `[]`              | Specific tables to clear (empty = all tables) |

## Database Schema

The repository manages these tables:

- **playground**: Stores playground configurations and metadata
- **snapshot**: Stores action history and state snapshots (references playground)

## Safety Notes

⚠️ **WARNING**: Enabling `clearTablesOnInit: true` will delete all existing data when the application starts!

- Use this feature during development only
- Always backup important data before enabling
- The clearing happens after migrations but before the repository is returned
- Tables are cleared in the correct order to respect foreign key constraints

## File Structure

```
src/repository/
├── config.ts           # Configuration settings
├── clear-tables.ts     # Table clearing utilities
├── reset-db.ts         # Development utilities
├── index.ts            # Main repository initialization
├── playground/         # Playground table schema and queries
├── snapshot/           # Snapshot table schema and queries
└── migration/          # Database migrations
```

## Example Workflow

1. **Development Setup**: Enable table clearing for a fresh start each time
2. **Testing**: Use the repository's clearTables method to reset test data
3. **Production**: Keep `clearTablesOnInit: false` for data persistence

```typescript
// Development: Clear on startup
const defaultConfig: RepositoryConfig = {
  clearTablesOnInit: true,
  enableDebugLogging: true,
  tablesToClear: [], // Clear everything
};

// Runtime clearing during development/testing
const repo = await initRepository();
await repo.clearTables(); // Clear all
await repo.clearTables(["snapshot"]); // Clear specific tables
```
