# 🔍 EVM Lens

**An interactive Ethereum Virtual Machine simulator and smart contract explorer for learning and experimentation.**

EVM Lens is a comprehensive educational tool that provides a safe, simulated environment for deploying, exploring, and understanding Ethereum smart contracts. Built with React 19 and TypeScript, it features both a custom EVM implementation and integration with the official EthereumJS libraries for detailed execution tracing and visualization.

## ✨ Features

### 🚀 Core Functionality
- **Smart Contract Deployment**: Deploy contracts from bytecode with full ABI support
- **Interactive Function Execution**: Execute contract functions with real-time parameter input and validation
- **Dual EVM Implementation**: Custom educational EVM + EthereumJS integration for comprehensive analysis
- **Step-by-Step Execution**: Detailed opcode-level execution with stack, memory, and storage visualization
- **Persistent State Management**: SQLite-based local storage with automatic session restoration

### 🎯 Educational Tools
- **Visual Execution Flow**: Interactive React Flow diagrams showing contract execution paths with animated transitions
- **Complete Opcode Coverage**: Support for 80+ EVM opcodes including arithmetic, bitwise, control flow, memory, storage, and system operations
- **Real-time State Inspection**: Live visualization of stack, memory, storage, and gas consumption during execution
- **ABI Validation & Parsing**: Built-in ABI validation with automatic function discovery from bytecode
- **Gas Analysis**: Detailed gas cost tracking and optimization insights

### 💾 Advanced Features
- **Local SQLite Database**: Complete blockchain state persistence using Drizzle ORM and SQLocal
- **Account Management**: Create and fund multiple test accounts with unlimited ETH
- **Action History**: Record and replay all blockchain interactions with snapshot functionality
- **Contract Analysis**: Static analysis tools for security and optimization suggestions
- **Multi-session Support**: Manage multiple playground environments simultaneously

## 🏗️ Architecture

### Frontend Stack
```
src/
├── pages/
│   ├── create-contract/          # Contract deployment interface
│   └── playground/               # Interactive contract explorer
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── ActionHistoryViewer.tsx  # Transaction history
│   └── MarkdownViewer/          # Documentation display
├── store/                       # Zustand state management
├── service/                     # Core EVM and analysis services
├── repository/                  # Database layer (Drizzle ORM)
└── hooks/                       # Custom React hooks
```

### Core Services

#### Custom EVM Engine (`src/service/evm/`)
- **Complete EVM Implementation**: 80+ opcodes with full compliance testing
- **Machine State Management**: Stack, memory, and storage simulation with real-time updates
- **Execution Tracing**: Comprehensive logging with step-by-step debugging
- **Gas Calculation**: Accurate gas cost computation for all operations
- **Error Handling**: Detailed error reporting with stack traces

#### EVM Analyzer (`src/service/evm-analyzer/`)
- **EthereumJS Integration**: Official Ethereum JavaScript libraries for production-grade simulation
- **Contract Manager**: Advanced deployment and interaction management
- **State Manager**: Blockchain state persistence with checkpoint/commit/revert functionality
- **Execution Tracer**: Professional-grade execution recording and analysis
- **Performance Analysis**: Gas optimization and security analysis tools

#### Database Layer (`src/repository/`)
- **SQLite with Drizzle ORM**: Type-safe database operations
- **Playground Management**: Multi-session support with isolated environments
- **Snapshot System**: Complete state capture and restoration
- **Migration System**: Automated database schema management

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
   - Navigate to the contract creation page
   - Paste your contract bytecode and ABI
   - Configure deployment parameters (address, owner, gas settings)
   - Click "Deploy & Explore Contract"

2. **Explore Functions**
   - Browse available functions in the interactive sidebar
   - Select read or write functions
   - Input parameters with real-time validation
   - Execute functions and view detailed results

3. **Analyze Execution**
   - View step-by-step opcode execution traces
   - Examine stack, memory, and storage changes
   - Visualize execution flow with interactive React Flow diagrams
   - Track gas usage and optimization opportunities

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React features with concurrent rendering
- **TypeScript** - Full type safety and modern language features
- **Tailwind CSS 4.1** - Modern utility-first styling
- **shadcn/ui** - High-quality, accessible UI components
- **React Flow** - Interactive execution flow visualization with animations
- **Zustand** - Lightweight, performant state management
- **React Hook Form + Zod** - Type-safe form validation

### Blockchain & EVM
- **@ethereumjs/evm** - Official Ethereum JavaScript EVM implementation
- **@ethereumjs/statemanager** - Production-grade blockchain state management
- **@ethereumjs/blockchain** - Complete blockchain simulation
- **ethereum-cryptography** - Cryptographic utilities and address generation
- **Custom EVM Engine** - Educational EVM implementation with detailed tracing

### Database & Persistence
- **SQLite + SQLocal** - Browser-based SQLite database
- **Drizzle ORM** - Type-safe database operations with migrations
- **Automatic Migrations** - Schema versioning and updates

### Development Tools
- **Vite** - Fast build tool with HMR and optimized bundling
- **ESLint** - Code linting with React and TypeScript rules
- **Jest + ts-jest** - Unit testing framework with TypeScript support
- **Node.js Polyfills** - Browser compatibility for Node.js APIs

## 📖 Usage Examples

### Deploying an ERC-20 Token

```typescript
// Navigate to /create-contract and configure:
const tokenConfig = {
  contractAddress: "0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8",
  ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  totalSupply: 1000000n,
  decimals: 18,
  bytecode: "0x608060405234801561001057600080fd5b50...",
  abi: [
    {
      "inputs": [{"name": "_totalSupply", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    // ... more ABI entries
  ]
};
```

### Executing Contract Functions

The playground interface provides:
- **Function Discovery**: Automatic parsing of read/write functions
- **Parameter Input**: Type-safe input fields with validation
- **Real-time Execution**: Immediate feedback with detailed traces
- **State Visualization**: Live updates to contract storage and balances

### Analyzing Execution Flow

- **Interactive Diagrams**: Click nodes to inspect stack/memory state
- **Animated Execution**: Visual flow of opcode execution
- **Gas Tracking**: Real-time gas consumption analysis
- **Storage Changes**: Before/after state comparisons

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

The project includes tests for:
- EVM opcode execution (80+ opcodes)
- Contract deployment and interaction
- State management and persistence
- ABI validation and parsing
- Database operations and migrations

## 🗄️ Database Schema

EVM Lens uses SQLite with the following key tables:

- **playground**: Stores playground configurations and metadata
- **snapshot**: Records all blockchain actions for replay and analysis

All database operations are type-safe using Drizzle ORM with automatic migrations.

## ⚡ Performance Features

- **Fast Contract Deployment**: Sub-100ms deployment times
- **Real-time Execution**: Minimal latency opcode execution
- **Efficient State Management**: Optimized storage with automatic cleanup
- **Responsive UI**: Smooth interactions even with complex contracts
- **Memory Optimization**: Lazy loading and garbage collection

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_DEFAULT_GAS_LIMIT=300000
VITE_DEFAULT_GAS_PRICE=20000000000
VITE_ENABLE_DEBUG_MODE=true
```

### Build Configuration

The project uses Vite with:
- Node.js polyfills for browser compatibility
- Cross-Origin isolation for SharedArrayBuffer support
- Optimized bundle splitting for faster loading
- TypeScript path resolution with `@/` alias

## 🐛 Troubleshooting

### Common Issues

**Contract deployment fails**
- Verify bytecode format (should start with 0x)
- Check ABI validity using the built-in validator
- Ensure sufficient gas limit (default: 300,000)

**Function execution errors**
- Validate input parameters match ABI specification
- Check account balances and permissions
- Review execution trace for specific error opcodes

**Database issues**
- Clear browser storage: `localStorage.clear()`
- Check browser console for migration errors
- Verify SQLite support in your browser

**Performance issues**
- Enable SharedArrayBuffer in browser settings
- Check for memory leaks in long-running sessions
- Use browser dev tools to profile performance

## 📚 Documentation

- **[EVM Store Documentation](src/store/evm/README.md)** - Detailed store API reference
- **[State Export Guide](src/service/evm-analyzer/STATE_EXPORT.md)** - State management documentation
- **[Wire Frames](WIRE_FRAME.md)** - UI design specifications
- **[Database Schema](drizzle/)** - Complete database documentation

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Add JSDoc comments for public APIs
- Include tests for new functionality

## 🎯 Roadmap

- [ ] **Enhanced Debugging**: Breakpoints and step-through debugging
- [ ] **Contract Templates**: Pre-built contract examples (DeFi, NFT, etc.)
- [ ] **Performance Profiler**: Advanced gas optimization tools
- [ ] **Multi-chain Support**: Support for other EVM-compatible chains
- [ ] **Export/Import**: Contract and state export functionality
- [ ] **Collaborative Features**: Share playground sessions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** - For the ethereumjs libraries and EVM specifications
- **React Flow** - For powerful execution visualization capabilities
- **shadcn/ui** - For beautiful, accessible UI components
- **Drizzle Team** - For excellent TypeScript-first ORM
- **Vite Team** - For lightning-fast development experience

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [GitHub Wiki](https://github.com/yourusername/evm-lens/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/evm-lens/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/evm-lens/discussions)

---

**Made with ❤️ for the Ethereum developer community**

*Learn, experiment, and master smart contract development in a safe, interactive environment.*

### Key Features at a Glance

🔍 **Explore**: Deploy and interact with smart contracts safely  
⚡ **Analyze**: Step-by-step opcode execution with full state inspection  
📊 **Visualize**: Interactive execution flow diagrams with React Flow  
💾 **Persist**: SQLite-based local storage with session management  
🎓 **Learn**: Educational tools for understanding EVM internals  
🛠️ **Develop**: Professional-grade development environment