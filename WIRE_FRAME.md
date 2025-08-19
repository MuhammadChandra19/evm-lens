┌─────────────────────────────────────────────────────────────────────────────────┐
│  🔍 ContractFlow    Search: [0x742d35Cc...] [🔍]    Network: Ethereum ▼         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CONTRACT HEADER                                       │
│  Contract: 0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8                          │
│  Name: UniswapV2Router02                                  Verified ✅           │
│  Balance: 0 ETH | Transactions: 1,234,567 | Age: 1,234 days                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐ ┌─────────────────────────────────────────────────────────┐
│   FUNCTION LIST     │ │                  EXECUTION VIEWER                       │
│                     │ │                                                         │
│ 📋 Read Functions   │ │  ┌─ Function: swapExactETHForTokens                   │ 
│ ├ allowance()       │ │  │  Inputs: amountOutMin, path, to, deadline          │
│ ├ balanceOf()       │ │  │  [Execute] [Simulate] [View Opcodes]               │
│ ├ decimals()        │ │  │                                                     │
│ ├ name()            │ │  └─────────────────────────────────────────────────── │
│ ├ symbol()          │ │                                                         │
│ ├ totalSupply()     │ │  📊 EXECUTION FLOW VISUALIZATION                       │
│ └ owner()           │ │  ┌─────────────────────────────────────────────────┐   │
│                     │ │  │                                                 │   │
│ ✏️ Write Functions   │ │  │     [START] ──→ [SLOAD] ──→ [CALL] ──→ [SSTORE] │   │
│ ├ approve()         │ │  │        │          │         │          │        │   │
│ ├ transfer()        │ │  │        ↓          ↓         ↓          ↓        │   │
│ ├ transferFrom()    │ │  │    Load Path   Get Rate  Execute    Update      │   │
│ ├ mint()            │ │  │                                     State       │   │
│ ├ burn()            │ │  │                                                 │   │
│ └ swapETHForTokens()│ │  └─────────────────────────────────────────────────┘   │
│                     │ │                                                         │
│ 🔧 Internal Funcs   │ │  🔍 OPCODE EXECUTION TRACE                             │
│ ├ _mint()           │ │  ┌─────────────────────────────────────────────────┐   │
│ ├ _burn()           │ │  │ Step | Opcode    | Stack           | Gas | PC   │   │
│ ├ _transfer()       │ │  │ ──── | ───────── | ─────────────── | ─── | ─── │   │
│ └ _approve()        │ │  │  1   | PUSH1 0x80| [0x80]          | 3   | 0   │   │
│                     │ │  │  2   | PUSH1 0x40| [0x80,0x40]     | 3   | 2   │   │
│ ⚡ Events           │ │  │  3   | MSTORE    | []              | 3   | 4   │   │
│ ├ Transfer          │ │  │  4   | CALLDATASIZE| [0x124]       | 2   | 5   │   │
│ ├ Approval          │ │  │  5   | ISZERO    | [0x0]           | 3   | 6   │   │
│ └ Swap              │ │  │ ...  | ...       | ...             | ... | ... │   │
│                     │ │  └─────────────────────────────────────────────────┘   │
│                     │ │                                                         │
│ 📈 Analytics        │ │  💾 STATE CHANGES                                      │
│ ├ Gas Usage         │ │  ┌─────────────────────────────────────────────────┐   │
│ ├ Call Frequency    │ │  │ Storage Slot | Before      | After       | Δ    │   │
│ └ Error Patterns    │ │  │ ──────────── | ─────────── | ─────────── | ──── │   │
│                     │ │  │ 0x01         | 0x00...     | 0x1F4...    | +500 │   │
└─────────────────────┘ │  │ 0x02         | 0xAB3...    | 0xCD7...    | -123 │   │
                        │  │ 0x03         | 0x00...     | 0x00...     | 0    │   │
                        │  └─────────────────────────────────────────────────┘   │
                        └─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  🧪 ContractEVM    [Tutorial] [Examples] [Docs]      Local Node: ⚫ Ready│
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                     🎯 Smart Contract EVM Setup                          │
│              Learn how smart contracts work by deploying and exploring!         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CONTRACT CONFIGURATION                               │
│                                                                                 │
│  📍 Contract Address (where it will be deployed)                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  [🎲 Generate Random] [📋 Use Deterministic]                                   │
│                                                                                 │
│  👤 Owner Address                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  [🔗 Use Default Account] [🔑 Import Private Key]                              │
│                                                                                 │
│  💰 Total Supply (for ERC20 tokens)                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 1000000                                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  Decimals: [18 ▼]                                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BYTECODE & ABI                                     │
│                                                                                 │
│  📜 Constructor Bytecode                                            [📁 Upload] │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 0x608060405234801561001057600080fd5b506040516107d03803806107d083398101604│   │
│  │ 052810190508061002f576000803c8d6000fd5b50600160005560408051908101604052│     │
│  │ 806020016040528060051b6040528060051b6040528160068201526004810191825260│      │
│  │ 408051602001604052806020016040528060051b6040528060051b604052816006820│       │
│  │ ...                                                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  💡 Template: [ERC20 ▼] [ERC721 ▼] [Custom Contract ▼] [Load Example]          │
│                                                                                 │
│  📋 Contract ABI (Application Binary Interface)                    [📁 Upload] │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [                                                                        │   │
│  │   {                                                                      │   │
│  │     "inputs": [                                                          │   │
│  │       {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"}│   │
│  │     ],                                                                   │   │
│  │     "stateMutability": "nonpayable",                                     │   │
│  │     "type": "constructor"                                                │   │
│  │   },                                                                     │   │
│  │   {                                                                      │   │
│  │     "inputs": [],                                                        │   │
│  │     "name": "totalSupply",                                               │   │
│  │     "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], │   │
│  │     "stateMutability": "view",                                           │   │
│  │     "type": "function"                                                   │   │
│  │   }                                                                      │   │
│  │ ]                                                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  🔍 [Validate ABI] [Auto-generate from Bytecode] [Format JSON]                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOYMENT OPTIONS                                 │
│                                                                                 │
│  ⚡ Gas Settings                                                                │
│  Gas Limit: [300000        ] Gas Price: [20 gwei      ] Max Fee: ~$12.50       │
│                                                                                 │
│  🔧 Advanced Options                                                            │
│  ☐ Enable debugging mode         ☐ Record all state changes                    │
│  ☐ Trace opcode execution        ☐ Generate execution graph                    │
│  ☑ Auto-explore after deployment                                               │
│                                                                                 │
│  📊 Pre-deployment Validation                                                   │
│  ✅ Bytecode is valid            ✅ ABI matches bytecode                        │
│  ✅ Constructor params valid     ✅ Gas estimate successful                     │
│  ⚠️  High gas usage detected     ℹ️  Contract size: 12.4KB                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                QUICK ACTIONS                                    │
│                                                                                 │
│   [📚 Load Example Contract]    [🎯 Use Template]    [📁 Import from File]     │
│                                                                                 │
│                    [🚀 Deploy & Explore Contract] [💾 Save Configuration]      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ETHEREUM.JS STATUS                                │
│                                                                                 │
│  🟢 Local Node: Running (ganache)        📦 Blocks: 0        ⛽ Gas Price: 20 gwei│
│  💰 Test Accounts: 10 loaded             🔗 Network ID: 1337  📊 Block Time: ~2s  │
│  📈 Total Gas Used: 0                    💳 Default Balance: 1000 ETH each      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│  🧪 ContractEVM    [← Back to Setup] [🔄 Reset] [💾 Export Session]     │
│  Local Node: 🟢 Running   Block: #1   Gas Price: 20 gwei   Account: 0xf39F...  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYED CONTRACT STATUS                              │
│  Contract: 0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8    ✅ Deployed Successfully│
│  Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266      💰 Total Supply: 1,000,000│
│  Gas Used: 287,432 | Deployment Cost: 0.0057 ETH | Block: #1 | Age: 12 seconds  │
│  🔍 Debug Mode: ON | 📊 Trace Mode: ON | 📈 State Recording: ON                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐ ┌─────────────────────────────────────────────────────────┐
│   FUNCTION LIST     │ │                  EXECUTION EVM                   │
│   (From ABI)        │ │                                                         │
│                     │ │  ┌─ Function: balanceOf                               │ 
│ 📖 Read Functions   │ │  │  Input: address _owner                              │
│ ├ name() → "MyToken"│ │  │  ┌─────────────────────────────────────────────┐   │
│ ├ symbol() → "MTK"  │ │  │  │ 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  │   │
│ ├ decimals() → 18   │ │  │  └─────────────────────────────────────────────┘   │
│ ├ totalSupply()     │ │  │  [🚀 Execute] [🔍 Simulate] [👁 View Opcodes]        │
│ ├ balanceOf() ⭐    │ │  │  Expected Output: 1000000000000000000000000        │
│ └ owner()           │ │  └─────────────────────────────────────────────────── │
│                     │ │                                                         │
│ ✏️ Write Functions   │ │  🎯 EXECUTION FLOW VISUALIZATION (React Flow)         │
│ ├ approve()         │ │  ┌─────────────────────────────────────────────────┐   │
│ ├ transfer()        │ │  │                                                 │   │
│ ├ transferFrom()    │ │  │  [CALLDATA] ──→ [SLOAD] ──→ [BALANCE_CHECK]     │   │
│ ├ mint() 🔒         │ │  │      │            │             │               │   │
│ └ burn() 🔒         │ │  │      ↓            ↓             ↓               │   │
│                     │ │  │   Parse Args   Load Slot    Check Owner        │   │
│ 🔧 Internal Funcs   │ │  │                                ↓               │   │
│ ├ _mint()           │ │  │                         [RETURN_VALUE]          │   │
│ ├ _burn()           │ │  │                              │                  │   │
│ ├ _transfer()       │ │  │                              ↓                  │   │
│ └ _beforeTokenTrans │ │  │                          [SUCCESS]              │   │
│                     │ │  │                                                 │   │
│ ⚡ Events (Live)    │ │  └─────────────────────────────────────────────────┘   │
│ ├ Transfer (0)      │ │                                                         │
│ ├ Approval (0)      │ │  🔍 OPCODE EXECUTION TRACE                             │
│ └ OwnershipTrans(1) │ │  ┌─────────────────────────────────────────────────┐   │
│                     │ │  │Step│Opcode     │Stack              │Gas  │PC │Depth│
│ 📊 EVM Stats │ │  │────│───────────│───────────────────│─────│───│─────│
│ ├ Functions Called:3│ │  │ 1  │PUSH1 0x80 │[0x80]            │9997 │0  │1    │
│ ├ Total Gas Used:   │ │  │ 2  │PUSH1 0x40 │[0x80,0x40]       │9994 │2  │1    │
│ │   45,234         │ │  │ 3  │MSTORE     │[]                 │9991 │4  │1    │
│ ├ State Changes: 1  │ │  │ 4  │CALLDATASIZE│[0x24]           │9989 │5  │1    │
│ └ Avg Exec Time:   │ │  │ 5  │PUSH1 0x04 │[0x24,0x04]       │9986 │7  │1    │
│   127ms            │ │  │ 6  │LT         │[0x1]              │9983 │9  │1    │
│                     │ │  │ 7  │PUSH2 0x40 │[0x1,0x40]        │9980 │10 │1    │
└─────────────────────┘ │  │...│...        │...                │...  │...│...  │
                        │  └─────────────────────────────────────────────────┘   │
                        │                                                         │
                        │  💾 STATE CHANGES & STORAGE                            │
                        │  ┌─────────────────────────────────────────────────┐   │
                        │  │Slot │Key                │Before     │After      │Δ │
                        │  │─────│───────────────────│───────────│───────────│──│
                        │  │0x00 │totalSupply        │0          │1000000... │+ │
                        │  │0x01 │name               │""         │"MyToken"  │+ │
                        │  │0x02 │symbol             │""         │"MTK"      │+ │
                        │  │0x03 │decimals           │0          │18         │+ │
                        │  │0x04 │owner              │0x0        │0xf39F...  │+ │
                        │  │keccak│balances[0xf39F...]│0          │1000000... │+ │
                        │  └─────────────────────────────────────────────────┘   │
                        │                                                         │
                        │  🎮 EVM CONTROLS                                │
                        │  [⏮ Reset State] [📷 Snapshot] [⏭ Fast Forward]        │
                        │  [🔄 Replay Last] [📜 Export Trace] [🎯 Benchmark]      │
                        └─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│                  EXECUTION VIEWER                       │
│                                                         │
│  ┌─ Function: swapExactETHForTokens                     │
│  │  📝 Description: Swap ETH for tokens with exact input│
│  │  🔓 Visibility: external payable                     │
│  │  ⛽ Est. Gas: ~120,000                               │
│  │                                                     │
│  │  📥 INPUTS:                                          │
│  │  ├ amountOutMin (uint256) [________] Wei             │
│  │  ├ path (address[])       [Add Token Addresses]     │
│  │  ├ to (address)           [0x742d35Cc6aF...]        │
│  │  └ deadline (uint256)     [1692547200] Timestamp    │
│  │                                                     │
│  │  💰 ETH Value: [_______] ETH                        │
│  │                                                     │
│  │  [🚀 Execute] [🔍 Simulate] [📋 View ABI] [⚙️ Advanced]│
│  └─────────────────────────────────────────────────── │
│                                                         │
│  📋 FUNCTION SIGNATURE                                  │
│  swapExactETHForTokens(uint256,address[],address,uint256)│
│                                                         │
│  🔗 RELATED FUNCTIONS                                   │
│  • swapTokensForExactETH() - Reverse swap              │
│  • getAmountsOut() - Get expected output               │
│                                                         │
│  ⚠️  IMPORTANT NOTES                                    │
│  • This function is payable - ETH will be sent         │
│  • Ensure sufficient slippage tolerance                │
│  • Deadline prevents transaction from hanging          │
│                                                         │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│                  EXECUTION VIEWER                       │
│                                                         │
│  🧪 Smart Contract Playground                           │
│                                                         │
│  This is a safe simulation environment where you can:   │
│  • Execute any function without real-world consequences │
│  • Fund your account with unlimited test ETH           │
│  • Experiment with different parameters freely         │
│  • Learn how EVM opcodes work under the hood           │
│                                                         │
│  💰 Your Balance: 1000.0 ETH (simulated)               │
│  [💸 Add More ETH] [🔄 Reset State]                     │
│                                                         │
│  🎯 Try These Popular Functions:                        │
│  • balanceOf() - Check token balances                  │
│  • transfer() - Move tokens between accounts           │
│  • swapETHForTokens() - Experience DeFi swaps          │
│                                                         │
│  📊 Simulation Stats:                                   │
│  • Block Number: #1,337,420                            │
│  • Gas Price: 20 gwei                                  │
│  • Network: Local Testnet                              │
│                                                         │
│  Select any function to start experimenting! →         │
└─────────────────────────────────────────────────────────┘