# 🔍 EVM Lens

**An interactive Ethereum Virtual Machine simulator and smart contract explorer for learning and experimentation.**

🌐 **Live Demo**: [https://www.evm-lens.com](https://www.evm-lens.com)

EVM Lens is a comprehensive educational tool that provides a safe, simulated environment for deploying, exploring, and understanding Ethereum smart contracts. Built with React 19 and TypeScript, it features a **unified EVM architecture** where all playgrounds share the same blockchain state, creating a realistic multi-project development environment with chronological transaction execution.

## ✨ Features

### 🚀 Core Functionality
- **Unified EVM Architecture**: Single shared blockchain state across all playgrounds with chronological transaction execution
- **Smart Contract Deployment**: Deploy contracts from bytecode with full ABI support
- **Cross-Playground Interactions**: Contracts deployed in one playground can be accessed and used from any other playground
- **Interactive Function Execution**: Execute contract functions with real-time parameter input and validation
- **Dual EVM Implementation**: Custom educational EVM + EthereumJS integration for comprehensive analysis
- **Step-by-Step Execution**: Detailed opcode-level execution with stack, memory, and storage visualization
- **Persistent State Management**: SQLite-based local storage with automatic session restoration

### 🔍 Blockchain Explorer
- **Account Explorer**: View all accounts with ETH balances, transaction counts, and account types (EOA/Contract)
- **Token Balance Tracking**: Automatic detection and display of ERC20 token holdings for each account
- **Account Detail Pages**: Deep dive into individual accounts with comprehensive token portfolio view
- **Transaction History**: Track all transactions and state changes across the unified blockchain
- **Real-time Updates**: Live synchronization between playground actions and explorer views

### 🎯 Educational Tools
- **Visual Execution Flow**: Interactive React Flow diagrams showing contract execution paths with animated transitions
- **Complete Opcode Coverage**: Support for 80+ EVM opcodes including arithmetic, bitwise, control flow, memory, storage, and system operations
- **Real-time State Inspection**: Live visualization of stack, memory, storage, and gas consumption during execution
- **ABI Validation & Parsing**: Built-in ABI validation with automatic function discovery from bytecode
- **Gas Analysis**: Detailed gas cost tracking and optimization insights

### 💾 Advanced Features
- **Local SQLite Database**: Complete blockchain state persistence using Drizzle ORM and SQLocal
- **Snapshot System**: Create and restore blockchain state snapshots for experimentation
- **Action Replay**: Chronological replay of all actions across all playgrounds
- **Multi-Playground Management**: Create and manage multiple smart contract projects simultaneously
- **Export/Import Capabilities**: Save and share playground configurations and blockchain states

## 🌐 Unified EVM Architecture

EVM Lens features a **revolutionary unified EVM architecture** that creates a realistic blockchain simulation environment:

### 🔗 How It Works

**Traditional Approach (Isolated Playgrounds):**
```
Playground A: [Deploy Contract] → Isolated EVM State A
Playground B: [Fund Account]   → Isolated EVM State B
❌ No interaction between playgrounds
```

**EVM Lens Unified Approach:**
```
Timeline: 10:00 AM - Deploy Contract (Playground A)
         10:05 AM - Fund Account (Playground B)
         10:10 AM - Call Function (Playground A)

Unified EVM: [Deploy] → [Fund] → [Call] → Shared State
✅ All playgrounds see the same blockchain state
```

### 🎯 Key Benefits

- **Realistic Blockchain Simulation**: Actions execute chronologically like a real blockchain
- **Cross-Playground Interactions**: Deploy a contract in one playground, use it in another
- **True State Continuity**: Account balances and contract state persist across playground switches
- **Educational Value**: Learn how real blockchain networks handle multiple concurrent transactions
- **Performance**: Single EVM initialization instead of per-playground overhead

### 📊 Example Scenarios

**Scenario 1: Multi-Project Development**
1. **Playground A**: Deploy an ERC-20 token contract
2. **Playground B**: Deploy a DEX contract that uses the token
3. **Playground C**: Create a staking contract that rewards the token
4. **Result**: All contracts interact seamlessly in the unified blockchain state

**Scenario 2: Educational Progression**
1. **Beginner**: Start with simple storage contracts
2. **Intermediate**: Deploy token contracts and see balance changes in explorer
3. **Advanced**: Build complex DeFi protocols that interact with existing contracts
4. **Result**: Progressive learning with persistent state across all lessons

## 🏗️ Architecture

### Frontend (`src/`)
- **React 19** with TypeScript for modern, type-safe development
- **Tailwind CSS** + **shadcn/ui** for beautiful, accessible components
- **React Router** for seamless navigation between playgrounds and explorer
- **Zustand** for lightweight, performant state management
- **React Query** for efficient data fetching and caching

### EVM Engine (`src/service/evm-analyzer/`)
- **Custom EVM Implementation**: Educational-focused virtual machine with detailed tracing
- **EthereumJS Integration**: Production-grade EVM compatibility for real-world accuracy
- **Contract Manager**: Advanced deployment and interaction management
- **State Manager**: Blockchain state persistence with checkpoint/commit/revert functionality
- **Execution Tracer**: Professional-grade execution recording and analysis
- **Performance Analysis**: Gas optimization and security analysis tools

### Database Layer (`src/repository/`)
- **SQLite with Drizzle ORM**: Type-safe database operations
- **Playground Management**: Multi-playground support with unified state management
- **Unified Snapshot System**: Chronological action recording across all playgrounds
- **Migration System**: Automated database schema management
- **Configurable Table Clearing**: Development tools for database reset and testing

### Explorer System (`src/pages/explorer/`)
- **Account Management**: Comprehensive account tracking with token balance detection
- **Transaction Monitoring**: Real-time transaction history and state change tracking
- **Token Balance Service**: Automatic ERC20 token detection using `balanceOf` calls
- **Interactive Navigation**: Seamless exploration of accounts, transactions, and contract interactions

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (for modern JavaScript features)
- **npm** or **yarn** (package management)
- **Modern Browser** with WebAssembly and SharedArrayBuffer support

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
   ```
   Navigate to http://localhost:5173
   ```

### Quick Start Guide

1. **Create Your First Playground**
   - Click "Create New Contract" on the landing page
   - Enter your contract bytecode and ABI
   - Deploy to the unified blockchain

2. **Explore the Blockchain**
   - Navigate to the Explorer section
   - View all accounts and their ETH/token balances
   - Click on any account to see detailed token holdings

3. **Execute Functions**
   - Select a function from the sidebar
   - Configure input parameters
   - Execute and watch the visual execution flow

4. **Cross-Playground Interaction**
   - Create a second playground
   - Deploy a contract that interacts with your first contract
   - See how they share the same blockchain state

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and constants
├── pages/              # Application pages and routes
│   ├── create-contract/    # Contract creation flow
│   ├── explorer/          # Blockchain explorer
│   │   ├── accounts/         # Account management and token tracking
│   │   ├── transactions/     # Transaction history
│   │   └── router/          # Explorer routing
│   ├── landing/           # Landing page
│   └── playground/        # Interactive contract playground
├── providers/          # React context providers
├── repository/         # Database layer (SQLite + Drizzle)
├── router/            # Application routing
├── service/           # Core business logic
│   ├── evm/              # Custom EVM implementation
│   ├── evm-adapter/      # EVM integration layer
│   └── evm-analyzer/     # EthereumJS-based analysis
└── store/             # Global state management
```

### Key Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: Zustand, React Query
- **Database**: SQLite, Drizzle ORM, SQLocal
- **EVM**: Custom implementation + EthereumJS
- **Visualization**: React Flow, Lucide Icons
- **Build**: Vite, ESLint, TypeScript

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview

# Build with bundle analysis
npm run build:analyze
```

## 🔧 Configuration

### Environment Setup

The application runs entirely in the browser with no backend dependencies. All blockchain state is persisted locally using SQLite in the browser.

### Database Configuration

The SQLite database is automatically initialized on first run. You can reset the database by clearing browser storage or using the built-in development tools.

### EVM Configuration

The EVM engine supports both custom educational mode and EthereumJS compatibility mode. Configuration can be adjusted in `src/service/evm-analyzer/core/`.

## 🎓 Educational Use Cases

### For Students
- **Learn Solidity**: Deploy and interact with contracts in a safe environment
- **Understand EVM**: See exactly how the Ethereum Virtual Machine executes code
- **Debug Contracts**: Step through execution with detailed state inspection
- **Explore DeFi**: Build and interact with decentralized finance protocols

### For Educators
- **Interactive Lessons**: Create progressive learning experiences across multiple playgrounds
- **Visual Learning**: Use execution flow diagrams to explain complex concepts
- **Safe Experimentation**: Let students experiment without real-world consequences
- **Comprehensive Analysis**: Show gas costs, security implications, and optimization opportunities

### For Developers
- **Contract Testing**: Test contract interactions in a controlled environment
- **Gas Optimization**: Analyze and optimize gas consumption patterns
- **Security Analysis**: Identify potential vulnerabilities and attack vectors
- **Cross-Contract Integration**: Test complex multi-contract systems

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Add JSDoc comments for public APIs
- Include tests for new functionality

### Areas for Contribution

- **New EVM Opcodes**: Expand opcode coverage for educational completeness
- **Visual Enhancements**: Improve execution flow visualization and UI/UX
- **Educational Content**: Create example contracts and learning materials
- **Performance Optimization**: Enhance EVM execution speed and memory usage
- **Documentation**: Improve guides, tutorials, and API documentation

## 🎯 Roadmap

- [x] **Unified EVM Architecture**: Single shared blockchain state across all playgrounds ✅
- [x] **Chronological Transaction Execution**: Time-based action replay system ✅
- [x] **Cross-Playground Interactions**: Contracts accessible from any playground ✅
- [x] **Blockchain Explorer**: Account and transaction exploration with token tracking ✅
- [x] **Token Balance Detection**: Automatic ERC20 token balance tracking ✅
- [ ] **Enhanced Debugging**: Breakpoints and step-through debugging
- [ ] **Contract Templates**: Pre-built contract examples (DeFi, NFT, etc.)
- [ ] **Performance Profiler**: Advanced gas optimization tools
- [ ] **Multi-chain Support**: Support for other EVM-compatible chains
- [ ] **Export/Import**: Contract and state export functionality
- [ ] **Playground Filtering**: View actions from specific playgrounds only
- [ ] **State Branching**: Create playground-specific branches from unified state
- [ ] **Collaborative Features**: Share playgrounds and collaborate in real-time

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** - For the ethereumjs libraries and EVM specifications
- **React Flow** - For powerful execution visualization capabilities
- **shadcn/ui** - For beautiful, accessible UI components
- **Drizzle Team** - For excellent TypeScript-first ORM
- **Vite Team** - For lightning-fast development experience

## 🔗 Links

- **Live Demo**: [https://www.evm-lens.com](https://www.evm-lens.com)
- **Documentation**: [GitHub Wiki](https://github.com/yourusername/evm-lens/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/evm-lens/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/evm-lens/discussions)

---

**Made with ❤️ for the Ethereum developer community**

*Learn, experiment, and master smart contract development in a safe, interactive environment.*

### Key Features at a Glance

🌐 **Unified**: Single shared blockchain state across all playgrounds  
🔍 **Explorer**: Comprehensive account and token balance tracking  
🎯 **Educational**: Step-by-step EVM execution with visual flow diagrams  
⚡ **Fast**: Local SQLite database with instant state persistence  
🔧 **Flexible**: Support for any ERC20 contract with automatic detection  
🚀 **Modern**: Built with React 19, TypeScript, and cutting-edge web technologies  

### Recent Updates

- ✅ **Account Detail Pages**: Deep dive into individual accounts with token portfolios
- ✅ **Token Balance Tracking**: Automatic ERC20 token detection using `balanceOf` calls
- ✅ **Explorer Navigation**: Seamless navigation between accounts and transaction history
- ✅ **Real-time Synchronization**: Live updates between playground actions and explorer views
- ✅ **Cross-Playground Token Tracking**: See token balances from all deployed contracts

Experience the future of smart contract education and development at [www.evm-lens.com](https://www.evm-lens.com)! 🚀