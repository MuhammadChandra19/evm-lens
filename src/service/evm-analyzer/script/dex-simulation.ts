import EVMAnalyzer from "..";
import test_abi from "./test_abi.json";
import { Address } from "@ethereumjs/util";
import tokenBytecode from "./token";
import { AbiValidator } from "../abi";
import {
  generateFunctionHash,
  generateFunctionSignature,
  generateInputHash,
  generateSelector,
} from "../abi/util";
import { extractUint256 } from "../../../lib/utils";
import path from 'path';
import fs from "fs"
import { parseEVMStepsToFlow } from '../utils/react-flow-parser';

// Helper functions
// function encodeUint256(value: bigint): string {
//   return value.toString(16).padStart(64, "0");
// }

// function encodeAddress(address: string): string {
//   const cleanAddr = address.startsWith("0x") ? address.slice(2) : address;
//   return cleanAddr.padStart(64, "0");
// }

async function main() {
  console.log("🚀 SimpleToken DEX - Clean Simulation\n");

  const analyzer = await EVMAnalyzer.create();
  const abi = new AbiValidator(test_abi);
  try {
    // === ADDRESSES ===
    const contractAddr = new Address(
      Buffer.from("1234567890123456789012345678901234567890", "hex"),
    );
    const devAddr = new Address(
      Buffer.from("abcdefabcdefabcdefabcdefabcdefabcdefabcd", "hex"),
    );
    const user1Addr = new Address(
      Buffer.from("1111111111111111111111111111111111111111", "hex"),
    );
    const user2Addr = new Address(
      Buffer.from("2222222222222222222222222222222222222222", "hex"),
    );
    const user3Addr = new Address(
      Buffer.from("3333333333333333333333333333333333333333", "hex"),
    );

    console.log("📋 Setup:");
    console.log(`Contract: ${contractAddr.toString()}`);
    console.log(`Developer: ${devAddr.toString()}`);
    console.log(
      `User1-3: ${user1Addr.toString()}, ${user2Addr.toString()}, ${user3Addr.toString()}\n`,
    );

    // === FUND ACCOUNTS ===
    console.log("💰 Developer getting initial funds...");
    await analyzer.fundAccount(devAddr, BigInt("1000000000000000000000")); // 1000 ETH
    await analyzer.fundAccount(user1Addr, BigInt("50000000000000000000")); // 50 ETH
    await analyzer.fundAccount(user2Addr, BigInt("50000000000000000000")); // 50 ETH
    await analyzer.fundAccount(user3Addr, BigInt("50000000000000000000")); // 50 ETH
    console.log("✅ All accounts funded\n");

    // === DEPLOY CONTRACT ===
    console.log("🏗️ Developer deploying contract...");

    // Use the proper deployment method with constructor execution
    const deploymentResult = await analyzer.deployContract(
      devAddr,
      tokenBytecode,
      contractAddr,
    );

    if (!deploymentResult.success) {
      throw new Error(`Contract deployment failed`);
    }

    console.log(`✅ Contract deployed with constructor execution!`);
    console.log(`Gas used: ${deploymentResult.gasUsed}`);
    console.log(`Contract address: ${deploymentResult.contractAddress}`);
    console.log(
      `Runtime bytecode length: ${deploymentResult.returnValue.length}`,
    );
    console.log(`Deployment success: ${deploymentResult.success}\n`);

    const outputFile = path.join(__dirname, `execution-result-${Date.now()}.json`);
    const seen = new WeakSet();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cyclicReplacer = (key: string, value: any) => {
      // Handle BigInt
      if (typeof value === 'bigint') {
        return value.toString();
      }
      
      // Handle cyclic references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      
      return value;
    };

    fs.writeFileSync(outputFile, JSON.stringify(deploymentResult.executionResult, cyclicReplacer, 2));

    console.log(`✅ Execution result saved to: ${outputFile}`);
    console.log(`Execution result: ${deploymentResult.executionResult}`)

    // === DEBUG: CHECK STORAGE ===
    console.log("🔍 Checking storage slots...");
    const addr = new Address(
      Buffer.from(
        contractAddr.toString().startsWith("0x")
          ? contractAddr.toString().slice(2)
          : contractAddr.toString(),
        "hex",
      ),
    );

    // Check totalSupply storage (slot 3)
    const slot3 = Buffer.from(
      "0000000000000000000000000000000000000000000000000000000000000003",
      "hex",
    );
    const totalSupplyStorage =
      await analyzer.stateManagerService.stateManager.getStorage(addr, slot3);
    console.log(
      `Storage slot 3 (totalSupply): ${Buffer.from(totalSupplyStorage).toString("hex")}`,
    );

    // Check owner storage (slot 6)
    const slot6 = Buffer.from(
      "0000000000000000000000000000000000000000000000000000000000000006",
      "hex",
    );
    const ownerStorage =
      await analyzer.stateManagerService.stateManager.getStorage(addr, slot6);
    console.log(
      `Storage slot 6 (owner): ${Buffer.from(ownerStorage).toString("hex")}`,
    );
    console.log();

    const totalSupplyFunc = abi.getFunction("totalSupply");
    if (totalSupplyFunc) {
      const signature = generateFunctionSignature(totalSupplyFunc);
      const selector = generateSelector(signature);

      const data = selector.slice(2);

      const totalSupyResult = await analyzer.callContract({
        from: devAddr,
        to: contractAddr,
        value: 0n,
        data,
        gasLimit: BigInt(500000),
      });

      const outputFile = path.join(__dirname, `totalSupply-${Date.now()}.json`);

      fs.writeFileSync(outputFile, JSON.stringify(totalSupyResult.steps, cyclicReplacer, 2));

      const flowData = parseEVMStepsToFlow(deploymentResult.steps);

      fs.writeFileSync(
        path.join(__dirname, `flow-data-${Date.now()}.json`), 
        JSON.stringify(flowData, null, 2)
      );

      console.log("totalSupply", extractUint256(totalSupyResult.returnValue));
    } else {
      console.error("❌ Error:", "No function available");
    }

    const addLiquidityFunc = abi.getFunction("addLiquidity");
    if (addLiquidityFunc) {
      let data = generateFunctionHash(addLiquidityFunc);
      const tokenAmount = BigInt(500000) * BigInt(10 ** 18);
      const ethAmount = BigInt(100) * BigInt(10 ** 18); // 100 ETH
      data += generateInputHash(addLiquidityFunc, [tokenAmount.toString()]);

      console.log("🏦 Calling addLiquidity...");
      console.log(`Token amount: ${tokenAmount.toString()}`);
      console.log(`ETH amount: ${ethAmount.toString()}`);

      const addLiquidityResult = await analyzer.callContract({
        from: devAddr,
        to: contractAddr,
        value: ethAmount,
        data,
        gasLimit: BigInt(500000),
      });

      console.log(`Call success: ${addLiquidityResult.success}`);
      console.log(`Gas used: ${addLiquidityResult.gasUsed}`);

      if (addLiquidityResult.success) {
        console.log("✅ addLiquidity succeeded");
        if (addLiquidityResult.returnValue.length > 0) {
          console.log(
            "Return value:",
            extractUint256(addLiquidityResult.returnValue),
          );
        }

        // === CHECK LIQUIDITY POOLS ===
        console.log("\n💧 Checking liquidity pools...");

        await checkLiquidityPools(analyzer, contractAddr, abi, devAddr);
      } else {
        console.log("❌ addLiquidity failed");

        // Decode the revert reason
        if (addLiquidityResult.returnValue.length >= 4) {
          const returnHex = Buffer.from(
            addLiquidityResult.returnValue,
          ).toString("hex");
          console.log("Return data (hex):", returnHex);

          // Check if it's a revert with Error(string) - selector 0x08c379a0
          if (returnHex.startsWith("08c379a0")) {
            try {
              // Skip function selector (4 bytes = 8 hex chars) and ABI decode the string
              const errorDataHex = returnHex.slice(8);
              console.log("Error data hex:", errorDataHex);

              // ABI decode: offset (32 bytes) + length (32 bytes) + string data
              if (errorDataHex.length >= 128) {
                // At least 64 bytes for offset+length
                const stringLengthHex = errorDataHex.slice(64, 128); // bytes 32-64
                const stringLength = parseInt(stringLengthHex, 16);
                const stringDataHex = errorDataHex.slice(
                  128,
                  128 + stringLength * 2,
                );
                const errorMessage = Buffer.from(stringDataHex, "hex").toString(
                  "utf8",
                );
                console.log(`Revert reason: "${errorMessage}"`);
              }
            } catch (e) {
              console.log("Could not decode revert message:", e);
            }
          } else {
            console.log("Unknown revert format");
            console.log(
              "Raw return value as uint256:",
              extractUint256(addLiquidityResult.returnValue),
            );
          }
        }
      }
    }

    const swapEthFunc = abi.getFunction("swapEthForTokens");
    if (swapEthFunc) {
      const data = generateFunctionHash(swapEthFunc);
      const result = await analyzer.callContract({
        from: user1Addr,
        to: contractAddr,
        value: BigInt(10) * BigInt(10 ** 18),
        data,
        gasLimit: BigInt(100000),
      });

      console.log(
        "\n \n swapEthForTokensResult",
        extractUint256(result.returnValue),
      );
      if (result.success) {
        console.log("✅ swapEthForTokens succeeded");
        console.log("Gas used:", result.gasUsed);
        await checkLiquidityPools(analyzer, contractAddr, abi, devAddr);
      } else {
        console.log("❌ swapEthForTokens failed");
      }
    }

    const swapTokenFunc = abi.getFunction("swapTokensForEth");
    if (swapTokenFunc) {
      let data = generateFunctionHash(swapTokenFunc);
      const tokenAmount = BigInt(5000) * BigInt(10 ** 18);
      data += generateInputHash(swapTokenFunc, [tokenAmount.toString()]);

      const result = await analyzer.callContract({
        from: user1Addr,
        to: contractAddr,
        value: BigInt(0),
        data,
        gasLimit: BigInt(100000),
      });

      console.log(
        "\n \n swapTokensForEthResult",
        extractUint256(result.returnValue),
      );
      if (result.success) {
        console.log("✅ swapTokensForEth succeeded");
        console.log("Gas used:", result.gasUsed);
        await checkLiquidityPools(analyzer, contractAddr, abi, devAddr);
      } else {
        console.log("❌ swapTokensForEth failed");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

const checkLiquidityPools = async (
  analyzer: EVMAnalyzer,
  contractAddr: Address,
  abi: AbiValidator,
  devAddr: Address,
) => {
  // === CHECK LIQUIDITY POOLS ===
  console.log("\n💧 Checking liquidity pools...");

  // Check token reserves
  const tokenReserveFunc = abi.getFunction("tokenReserve");
  if (tokenReserveFunc) {
    const tokenReserveData = generateFunctionHash(tokenReserveFunc);
    const tokenReserveResult = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data: tokenReserveData,
      gasLimit: BigInt(100000),
    });

    if (tokenReserveResult.success) {
      const tokenReserve = extractUint256(tokenReserveResult.returnValue);
      console.log(`Token Reserve: ${tokenReserve.toString()} tokens`);
    }
  }

  // Check ETH reserves
  const ethReserveFunc = abi.getFunction("ethReserve");
  if (ethReserveFunc) {
    const ethReserveData = generateFunctionHash(ethReserveFunc);
    const ethReserveResult = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data: ethReserveData,
      gasLimit: BigInt(100000),
    });

    if (ethReserveResult.success) {
      const ethReserve = extractUint256(ethReserveResult.returnValue);
      console.log(
        `ETH Reserve: ${ethReserve.toString()} wei (${Number(ethReserve) / 1e18} ETH)`,
      );
    }
  }

  // Check contract ETH balance
  const contractBalanceFunc = abi.getFunction("getContractEthBalance");
  if (contractBalanceFunc) {
    const contractBalanceData = generateFunctionHash(contractBalanceFunc);
    const contractBalanceResult = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data: contractBalanceData,
      gasLimit: BigInt(100000),
    });

    if (contractBalanceResult.success) {
      const contractBalance = extractUint256(contractBalanceResult.returnValue);
      console.log(
        `Contract ETH Balance: ${contractBalance.toString()} wei (${Number(contractBalance) / 1e18} ETH)`,
      );
    }
  }

  // Check developer's remaining token balance
  const balanceOfFunc = abi.getFunction("balanceOf");
  if (balanceOfFunc) {
    let balanceData = generateFunctionHash(balanceOfFunc);
    balanceData += generateInputHash(balanceOfFunc, [devAddr.toString()]);

    const balanceResult = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data: balanceData,
      gasLimit: BigInt(100000),
    });

    if (balanceResult.success) {
      const devBalance = extractUint256(balanceResult.returnValue);
      console.log(`Developer Token Balance: ${devBalance.toString()} tokens`);
    }
  }

  // === CALCULATE TOKEN PRICES ===
  console.log("\n💰 Token Price Analysis...");

  // Get current reserves for price calculation
  let currentTokenReserve = 0n;
  let currentEthReserve = 0n;

  const tokenReserveFuncPrice = abi.getFunction("tokenReserve");
  if (tokenReserveFuncPrice) {
    const tokenReserveDataPrice = generateFunctionHash(tokenReserveFuncPrice);
    const tokenReserveResultPrice = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data: tokenReserveDataPrice,
      gasLimit: BigInt(100000),
    });

    if (tokenReserveResultPrice.success) {
      currentTokenReserve = extractUint256(tokenReserveResultPrice.returnValue);
    }
  }

  const ethReserveFuncPrice = abi.getFunction("ethReserve");
  if (ethReserveFuncPrice) {
    const ethReserveDataPrice = generateFunctionHash(ethReserveFuncPrice);
    const ethReserveResultPrice = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data: ethReserveDataPrice,
      gasLimit: BigInt(100000),
    });

    if (ethReserveResultPrice.success) {
      currentEthReserve = extractUint256(ethReserveResultPrice.returnValue);
    }
  }

  // Calculate spot price (direct ratio)
  if (currentTokenReserve > 0n && currentEthReserve > 0n) {
    const spotPriceWei =
      (currentEthReserve * BigInt(1e18)) / currentTokenReserve;
    const spotPriceEth = Number(spotPriceWei) / 1e18;
    console.log(`Spot Price: ${spotPriceEth.toFixed(8)} ETH per token`);
    console.log(
      `Inverse Price: ${(1 / spotPriceEth).toFixed(2)} tokens per ETH`,
    );
  }

  // Test price functions with 1 ETH
  const getTokenAmountFunc = abi.getFunction("getTokenAmountForEth");
  if (getTokenAmountFunc) {
    let data = generateFunctionHash(getTokenAmountFunc);
    const oneEth = BigInt(1e18); // 1 ETH in wei
    data += generateInputHash(getTokenAmountFunc, [oneEth.toString()]);

    const result = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data,
      gasLimit: BigInt(100000),
    });

    if (result.success) {
      const tokensFor1Eth = extractUint256(result.returnValue);
      const tokensFor1EthFormatted = Number(tokensFor1Eth) / 1e18;
      console.log(
        `Exchange Rate: 1 ETH = ${tokensFor1EthFormatted.toFixed(2)} tokens`,
      );
      console.log(
        `Token Price: ${(1 / tokensFor1EthFormatted).toFixed(8)} ETH per token`,
      );
    }
  }

  // Test price functions with 1000 tokens
  const getEthAmountFunc = abi.getFunction("getEthAmountForTokens");
  if (getEthAmountFunc) {
    let data = generateFunctionHash(getEthAmountFunc);
    const oneThousandTokens = BigInt(1000) * BigInt(1e18); // 1000 tokens
    data += generateInputHash(getEthAmountFunc, [oneThousandTokens.toString()]);

    const result = await analyzer.callContract({
      from: devAddr,
      to: contractAddr,
      value: 0n,
      data,
      gasLimit: BigInt(100000),
    });

    if (result.success) {
      const ethFor1000Tokens = extractUint256(result.returnValue);
      const ethFor1000TokensFormatted = Number(ethFor1000Tokens) / 1e18;
      const ethPerToken = ethFor1000TokensFormatted / 1000;
      console.log(
        `Exchange Rate: 1000 tokens = ${ethFor1000TokensFormatted.toFixed(6)} ETH`,
      );
      console.log(`Token Price: ${ethPerToken.toFixed(8)} ETH per token`);
    }
  }
};

main().catch(console.error);
