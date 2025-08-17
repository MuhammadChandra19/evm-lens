import EVMAnalyzer from '../index';

/**
 * Example script demonstrating EVM state export functionality
 *
 * This script shows how to:
 * 1. Create an EVM analyzer instance
 * 2. Deploy a contract and create accounts
 * 3. Export the complete EVM state
 * 4. Create state checkpoints
 * 5. Import/restore state
 */

async function demonstrateStateExport() {
  console.log('🚀 Starting EVM State Export Demonstration');

  // 1. Create EVM analyzer instance
  const evm = await EVMAnalyzer.create();
  console.log('✅ EVM Analyzer created');

  // 2. Create some accounts and deploy a simple contract
  const ownerAddress = '0x1234567890123456789012345678901234567890';
  const contractAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

  // Create and fund owner account
  await evm.createAccount(ownerAddress);
  await evm.fundAccount(ownerAddress, BigInt('1000000000000000000')); // 1 ETH
  console.log('✅ Owner account created and funded');

  // Simple contract bytecode (just returns 42)
  const simpleBytecode =
    '0x6080604052348015600f57600080fd5b50602a8060206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063c2985578146032575b600080fd5b60386042565b604051603f9190605a565b60405180910390f35b6000602a905090565b6054816073565b82525050565b6000602082019050606d6000830184604d565b92915050565b600081905091905056fea2646970667358221220c7b8a7a3b9d4e6f8a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a456';

  // Deploy the contract
  try {
    const deployResult = await evm.deployContract(ownerAddress, simpleBytecode, contractAddress);
    console.log('✅ Contract deployed:', {
      address: deployResult.contractAddress,
      gasUsed: deployResult.gasUsed.toString(),
      success: deployResult.success,
    });
  } catch (error) {
    let err: Error
    if(error instanceof Error) {
      err = error
      console.log('ℹ️ Contract deployment failed (expected for demo):', err.message);
    } 

    console.log(error)
 
  }

  // 3. Export the current EVM state
  console.log('\n📤 Exporting EVM State...');
  const exportedState = await evm.exportState();
  console.log('State Root:', exportedState.stateRoot);
  console.log('Latest Block Number:', exportedState.blockchain.latestBlockNumber.toString());
  console.log('Latest Block Hash:', exportedState.blockchain.latestBlockHash);

  // 4. Demonstrate state checkpointing
  console.log('\n📸 Creating State Checkpoint...');
  await evm.createCheckpoint();

  // Make some changes
  const newAccountAddress = '0x9876543210987654321098765432109876543210';
  await evm.createAccount(newAccountAddress);
  await evm.fundAccount(newAccountAddress, BigInt('500000000000000000')); // 0.5 ETH
  console.log('✅ Created new account after checkpoint');

  // Get account info to verify it exists
  const accountInfo = await evm.getAccountInfo(newAccountAddress);
  console.log('New account balance:', accountInfo?.balance.toString());

  // Restore to checkpoint (revert changes)
  console.log('\n⏪ Restoring to checkpoint...');
  await evm.restoreCheckpoint();

  // Verify the account no longer exists
  const accountInfoAfterRevert = await evm.getAccountInfo(newAccountAddress);
  console.log('Account exists after revert:', accountInfoAfterRevert !== null);

  // 5. Demonstrate state root operations
  console.log('\n🌳 State Root Operations...');
  const currentStateRoot = await evm.getStateRoot();
  console.log('Current State Root:', Buffer.from(currentStateRoot).toString('hex'));

  // 6. Export account-specific state
  console.log('\n👤 Exporting Account State...');
  const ownerAccountState = await evm.stateManagerService.exportAccountState(ownerAddress);
  console.log('Owner Account State:', {
    address: ownerAccountState.account?.address,
    balance: ownerAccountState.account?.balance.toString(),
    nonce: ownerAccountState.account?.nonce.toString(),
    isContract: ownerAccountState.account?.isContract,
  });

  // 7. Demonstrate direct access to underlying components
  console.log('\n🔧 Direct Component Access...');
  const rawStateManager = evm.rawStateManager;
  const rawBlockchain = evm.rawBlockchain;
  const rawEVM = evm.rawEVM;

  console.log('Raw components available:', {
    stateManager: !!rawStateManager,
    blockchain: !!rawBlockchain,
    evm: !!rawEVM,
  });

  // 8. Flush state to ensure persistence
  console.log('\n💾 Flushing State...');
  await evm.flush();
  console.log('✅ State flushed');

  // Cleanup
  await evm.cleanup();
  console.log('\n🧹 Cleanup completed');
  console.log('🎉 State Export Demonstration Complete!');
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateStateExport().catch(console.error);
}

export { demonstrateStateExport };
