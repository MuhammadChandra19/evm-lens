import EVMAnalyzer from '..';
import { Address } from '@ethereumjs/util';

async function main() {
  const analyzer = await EVMAnalyzer.create();

  try {
    // Deploy contract with runtime bytecode
    const contractAddr = new Address(Buffer.from('abcdefabcdefabcdefabcdefabcdefabcdefabcd', 'hex'));
    const runtimeBytecode = '6080604052600436106100225760003560e01c8063d0e30db0146100275761002e565b61002e565b5b6001600052602060006000f35b600080fd';

    await analyzer.deployContractToAddress(contractAddr.toString(), runtimeBytecode);

    // Fund the caller
    const fromAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    await analyzer.fundAccount(fromAddress, BigInt('10000000000000000000'));

    // Execute contract call with tracing
    const result = await analyzer.callContract(
      {
        from: fromAddress,
        to: contractAddr.toString(),
        value: BigInt(1000000000000000000),
        data: 'd0e30db0',
        gasLimit: BigInt(1000000),
      },
      {
        includeMemory: true,
        includeStack: true,
        includeStorage: true,
        maxSteps: 1000,
      }
    );

    console.log('Execution successful:', result.success);
    console.log('Gas used:', result.gasUsed.toString());
    console.log('Steps captured:', result.steps.length);

    // Analyze execution
    const analysis = analyzer.analyzeExecution(result.steps);
    console.log('Analysis:', {
      totalGasUsed: analysis.totalGasUsed.toString(),
      opcodeFrequency: analysis.opcodeFrequency,
      maxStackDepth: analysis.maxStackDepth,
      memoryAccesses: analysis.memoryAccesses,
      storageAccesses: analysis.storageAccesses,
      steps: analysis.steps,
    });
  } finally {
    await analyzer.cleanup();
  }
}

main().catch(console.error);
