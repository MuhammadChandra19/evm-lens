# Playground Store

A comprehensive Zustand store for managing EVM blockchain simulation state with full persistence capabilities.

## Overview

The Playground Store provides a complete interface for interacting with an EVM blockchain simulator, including contract deployment, token operations, DEX trading, and persistent state management. All blockchain state is automatically persisted across browser sessions.

## Features

### 🔧 Core Functionality
- **Contract Deployment**: Deploy and manage smart contracts
- **Account Management**: Create and fund blockchain accounts
- **Token Operations**: ERC-20 token transfers, approvals, and balance queries
- **DEX Trading**: Liquidity provision and token swapping
- **Price Discovery**: Real-time price calculations and reserve monitoring

### 💾 Persistence
- **Dual-Layer Persistence**: Basic state and complex EVM blockchain state
- **Automatic Save**: State changes trigger automatic persistence
- **Complete Restoration**: Full blockchain state recovery on page reload
- **Storage Optimization**: Only non-zero values persisted to minimize storage usage

## Architecture

```
src/store/playground/
├── README.md              # This documentation
├── index.ts              # Main store with Zustand persistence
├── action.ts             # Business logic and EVM operations
├── types.ts              # TypeScript type definitions
├── serializers.ts        # State serialization/deserialization
└── errors.ts             # Error constants and handling
```

## Store Structure

### State Properties

```typescript
interface PlaygroundState {
  contractAddress?: Address;        // Deployed contract address
  constructorBytecode: string;     // Contract constructor bytecode
  abi: ContractMetadata;           // Contract ABI and metadata
  functions?: Map<string, FunctionInfo>; // Contract function mappings
  ownerAddress?: Address;          // Contract owner address
  totalSupply: bigint;             // Token total supply
  decimals: number;                // Token decimal places
  evm?: EVMAnalyzer;              // EVM blockchain simulator instance
}
```

### Available Actions

#### Contract Management
- `createNewPlayground(payload)` - Deploy new contract with configuration
- `deployContract(bytecode)` - Deploy contract from bytecode
- `deployContractToAddress(address, bytecode)` - Deploy to specific address
- `callContract(txData)` - Execute contract function calls

#### Account Operations
- `createAccount(address)` - Create new blockchain account
- `fundAccount(address, balance)` - Fund account with ETH balance

#### Token Functions
- `getTokenBalance(userAddress)` - Query token balance
- `transferTokens(from, to, amount)` - Transfer tokens between accounts
- `approveTokens(user, spender, amount)` - Approve token spending

#### DEX Trading
- `addLiquidity(user, tokenAmount, ethAmount)` - Add liquidity to pool
- `swapEthForTokens(user, ethAmount)` - Swap ETH for tokens
- `swapTokensForEth(user, tokenAmount)` - Swap tokens for ETH

#### Price & Reserve Queries
- `getReserves()` - Get current pool reserves
- `getTokenPrice()` - Calculate current token price
- `getEthAmountForTokens(tokenAmount)` - Calculate ETH for token amount
- `getTokenAmountForEth(ethAmount)` - Calculate tokens for ETH amount

#### Persistence Management
- `initializeEVM()` - Manually initialize EVM instance
- `saveEVMState()` - Manually trigger state persistence
- `clearPersistedState()` - Clear all persisted data

## Usage Examples

### Basic Setup

```typescript
import usePlaygroundStore from '@/store/playground';

const MyComponent = () => {
  const {
    createNewPlayground,
    getTokenBalance,
    transferTokens,
    swapEthForTokens,
    getReserves
  } = usePlaygroundStore();

  // Component logic here
};
```

### Contract Deployment

```typescript
const deployNewContract = async () => {
  const result = await createNewPlayground({
    contractAddress: '0x742d35cc6ab4c3c8b9f4c6d5e7f8a9b0c1d2e3f4',
    constructorBytecode: '0x608060405234801561001057600080fd5b50...',
    abi: contractMetadata,
    ownerAddress: '0x1234567890123456789012345678901234567890',
    totalSupply: BigInt('1000000'),
    decimals: 18
  });

  if (result.success) {
    console.log('Contract deployed successfully');
  }
};
```

### Token Operations

```typescript
const handleTokenTransfer = async () => {
  const fromAddress = '0x1234567890123456789012345678901234567890';
  const toAddress = '0x0987654321098765432109876543210987654321';
  const amount = BigInt('1000000000000000000'); // 1 token with 18 decimals

  // Check balance before transfer
  const balance = await getTokenBalance(fromAddress);
  console.log('Balance before:', balance);

  // Execute transfer
  const result = await transferTokens(fromAddress, toAddress, amount);
  if (result) {
    console.log('Transfer successful');
  }

  // Check balance after transfer
  const newBalance = await getTokenBalance(fromAddress);
  console.log('Balance after:', newBalance);
};
```

### DEX Trading

```typescript
const handleSwap = async () => {
  const userAddress = '0x1234567890123456789012345678901234567890';
  const ethAmount = BigInt('1000000000000000000'); // 1 ETH

  // Check reserves before swap
  const { tokenReserve, ethReserve } = await getReserves();
  console.log('Reserves before:', { tokenReserve, ethReserve });

  // Execute swap
  const result = await swapEthForTokens(userAddress, ethAmount);
  if (result) {
    console.log('Swap successful');
  }

  // Check reserves after swap
  const newReserves = await getReserves();
  console.log('Reserves after:', newReserves);
};
```

### Price Queries

```typescript
const getPriceInfo = async () => {
  // Get current token price in ETH
  const price = await getTokenPrice();
  console.log('Current token price:', price, 'ETH');

  // Calculate swap amounts
  const tokenAmount = BigInt('1000000000000000000'); // 1 token
  const ethForTokens = await getEthAmountForTokens(tokenAmount);
  console.log('1 token =', ethForTokens, 'wei ETH');

  const ethAmount = BigInt('1000000000000000000'); // 1 ETH
  const tokensForEth = await getTokenAmountForEth(ethAmount);
  console.log('1 ETH =', tokensForEth, 'wei tokens');
};
```

## Persistence Details

### Storage Locations

The store uses two localStorage keys:

1. **`playground-storage`** - Basic state (addresses, bytecode, ABI, etc.)
2. **`playground-evm-state`** - Complex blockchain state (accounts, balances, storage)

### What Gets Persisted

#### Basic State
- Contract and owner addresses
- Constructor bytecode and ABI
- Function mappings
- Total supply and decimals

#### EVM Blockchain State
- Account balances and nonces
- Contract bytecode
- Storage slots (including token balances)
- Balance mapping slots for known addresses

### Automatic Persistence

State is automatically saved after:
- Contract deployment
- Account creation or funding
- Contract function calls
- Token transfers and approvals
- DEX trading operations

### Manual Persistence Control

```typescript
// Save current state
await saveEVMState();

// Clear all persisted data
clearPersistedState();

// Initialize EVM if needed
await initializeEVM();
```

## Storage Serialization

### Address Objects
- Serialized as hex strings
- Restored as proper Address instances

### BigInt Values
- Serialized as strings
- Restored as BigInt instances

### Function Maps
- Serialized as arrays of key-value pairs
- Restored as Map instances

### EVM State
- Accounts with balances, nonces, and code
- Storage slots with keccak256-calculated mapping slots
- Only non-zero values to optimize space

## Error Handling

All operations include comprehensive error handling:

```typescript
const result = await fundAccount(address, balance);
if (!result.success) {
  console.error('Funding failed:', result.error);
}
```

Common error scenarios:
- EVM not initialized
- Invalid addresses
- Insufficient balances
- Contract call failures

## Development

### Adding New Functions

1. Add function to `action.ts` with proper error handling
2. Update `PlaygroundAction` type in `types.ts`
3. Add function to store in `index.ts`
4. Add auto-save trigger if function modifies state

### Extending Persistence

1. Update serialization logic in `serializers.ts`
2. Add new storage slots to `serializeEVMStateEnhanced`
3. Update deserialization to handle new data
4. Test persistence across browser sessions

## Performance Considerations

- **Lazy Loading**: EVM instance created only when needed
- **Selective Persistence**: Only important storage slots captured
- **Optimized Storage**: Non-zero values only to minimize localStorage usage
- **Async Operations**: All EVM operations are asynchronous and non-blocking

## Browser Compatibility

- **localStorage**: Required for persistence functionality
- **BigInt**: Required for blockchain value handling
- **Async/Await**: Required for EVM operations
- **Buffer**: Polyfilled for browser compatibility

## Security Notes

- All data stored in localStorage (client-side only)
- No sensitive information should be persisted
- State validation on restoration
- Error boundaries for graceful degradation

---

For more information about the EVM analyzer service, see `/src/service/evm-analyzer/README.md`
