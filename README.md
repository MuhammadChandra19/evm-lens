# 🔍 EVM Lens

**An interactive EVM blockchain simulator and smart contract explorer for learning and experimentation.**

EVM Lens is a comprehensive educational tool that provides a safe, simulated environment for deploying, exploring, and understanding Ethereum smart contracts. Built with React and TypeScript, it features a complete EVM implementation with detailed execution tracing and visualization.

## ✨ Features

### 🚀 Core Functionality
- **Smart Contract Deployment**: Deploy contracts from bytecode with full ABI support
- **Interactive Function Execution**: Execute contract functions with real-time parameter input
- **EVM Simulation**: Complete Ethereum Virtual Machine implementation with opcode execution
- **Execution Tracing**: Step-by-step opcode execution with stack, memory, and storage visualization
- **State Management**: Persistent blockchain state with automatic save/restore functionality

### 🎯 Educational Tools
- **Visual Execution Flow**: React Flow-based visualization of contract execution paths
- **Opcode Analysis**: Detailed breakdown of EVM opcodes with gas costs and effects
- **Function Discovery**: Automatic detection and parsing of contract functions from bytecode
- **ABI Validation**: Built-in ABI validation and formatting tools
- **Gas Estimation**: Real-time gas usage tracking and optimization insights

### 💾 Advanced Features
- **Dual-Layer Persistence**: Complete blockchain state preservation across sessions
- **Account Management**: Create and fund multiple test accounts
- **Token Operations**: Full ERC-20 token support with transfers and approvals
- **DEX Simulation**: Built-in decentralized exchange functionality
- **Contract Analysis**: Static analysis tools for security and optimization

## 🏗️ Architecture

### Frontend Components
```
src/
├── pages/main/
│   ├── components/
│   │   ├── SubmitContract/     # Contract deployment interface
│   │   └── Playground/         # Interactive contract explorer
├── components/ui/              # Reusable UI components (shadcn/ui)
├── store/                      # Zustand state management
└── service/                    # Core EVM and analysis services
```

### Core Services

#### EVM Engine (`src/service/evm/`)
- **Custom EVM Implementation**: Complete Ethereum Virtual Machine with all opcodes
- **Machine State Management**: Stack, memory, and storage simulation
- **Execution Tracing**: Detailed logging and debugging capabilities
- **Gas Calculation**: Accurate gas cost computation for all operations

#### EVM Analyzer (`src/service/evm-analyzer/`)
- **Contract Manager**: Deployment and interaction management
- **State Manager**: Blockchain state persistence and querying
- **Execution Tracer**: Step-by-step execution recording
- **Analysis Tools**: Static analysis and optimization suggestions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/evm-lens.git
   cd evm-lens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Quick Start Guide

1. **Deploy a Contract**
   - Paste your contract bytecode and ABI
   - Configure deployment parameters
   - Click "Deploy & Explore Contract"

2. **Explore Functions**
   - Browse available functions in the sidebar
   - Select a function to see its parameters
   - Execute functions and view results

3. **Analyze Execution**
   - View opcode-level execution traces
   - Examine state changes and gas usage
   - Visualize execution flow with interactive diagrams

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **React Flow** - Interactive execution flow visualization
- **Zustand** - Lightweight state management

### Blockchain & EVM
- **@ethereumjs/evm** - Official Ethereum JavaScript implementation
- **@ethereumjs/statemanager** - Blockchain state management
- **ethereum-cryptography** - Cryptographic utilities
- **Custom EVM Engine** - Educational EVM implementation

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting
- **Jest** - Unit testing framework
- **TypeScript ESLint** - TypeScript-aware linting

## 📖 Usage Examples

### Deploying an ERC-20 Token

```typescript
// Example: Deploy a simple ERC-20 token
const tokenBytecode = "0x608060405234801561001057600080fd5b50...";
const tokenABI = [
  {
    "inputs": [{"name": "_totalSupply", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // ... more ABI entries
];

// Deploy through the UI or programmatically
await evmStore.createNewEVM({
  contractAddress: "0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8",
  ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  totalSupply: 1000000n,
  decimals: 18,
  constructorBytecode: tokenBytecode,
  abi: tokenABI
});
```

### Executing Contract Functions

```typescript
// Transfer tokens between accounts
await evmStore.transferTokens(
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // from
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // to
  1000n // amount
);

// Check balance
const balance = await evmStore.getTokenBalance(
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
);
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The project includes comprehensive tests for:
- EVM opcode execution
- Contract deployment and interaction
- State management and persistence
- ABI validation and parsing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📚 Documentation

- **[EVM Store Documentation](src/store/evm/README.md)** - Detailed store API reference
- **[State Export Guide](src/service/evm-analyzer/STATE_EXPORT.md)** - State management documentation
- **[Wire Frames](WIRE_FRAME.md)** - UI design specifications

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_DEFAULT_GAS_LIMIT=300000
VITE_DEFAULT_GAS_PRICE=20000000000
VITE_ENABLE_DEBUG_MODE=true
```

### Build Configuration

The project uses Vite with custom configuration for:
- Node.js polyfills for browser compatibility
- Optimized bundle splitting
- TypeScript path resolution

## 📊 Performance

EVM Lens is optimized for educational use with:
- **Fast Contract Deployment**: < 100ms average deployment time
- **Real-time Execution**: Step-by-step opcode execution with minimal latency
- **Efficient State Management**: Optimized storage with automatic cleanup
- **Responsive UI**: Smooth interactions even with complex contracts

## 🐛 Troubleshooting

### Common Issues

**Contract deployment fails**
- Verify bytecode format (should start with 0x)
- Check ABI validity using the built-in validator
- Ensure sufficient gas limit

**Function execution errors**
- Validate input parameters match ABI specification
- Check account balances and permissions
- Review execution trace for specific error opcodes

**State persistence issues**
- Clear browser storage and restart
- Check for localStorage quota limits
- Verify state export/import functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** - For the ethereumjs libraries
- **React Flow** - For execution visualization capabilities
- **shadcn/ui** - For beautiful, accessible UI components
- **Vite Team** - For the excellent build tooling

## 🔗 Links

// TODO

---

**Made with ❤️ for the Ethereum developer community**

*Learn, experiment, and master smart contract development in a safe, interactive environment.*