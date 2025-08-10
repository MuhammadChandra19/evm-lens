/**
 * Bytecode Analysis Utilities
 * Provides functions to analyze EVM bytecode and extract contract information
 */

/**
 * Function selector with metadata
 */
export interface FunctionSelector {
  /** 4-byte function selector as hex string */
  selector: string;
  /** Byte offset where selector was found */
  offset: number;
  /** Known function name if recognized */
  name?: string;
  /** Function signature if known */
  signature?: string;
}

/**
 * Contract analysis result
 */
export interface ContractAnalysis {
  /** All function selectors found */
  functions: FunctionSelector[];
  /** Unique opcodes used */
  opcodes: number[];
  /** Contract size in bytes */
  size: number;
  /** Whether contract appears to be a standard (ERC20, ERC721, etc.) */
  standardType?: string;
}

/**
 * Known function selectors for common standards
 */
export const KNOWN_SELECTORS: Record<string, { name: string; signature: string; standard?: string }> = {
  // ERC20 Standard
  '06fdde03': { name: 'name', signature: 'name()', standard: 'ERC20' },
  '95d89b41': { name: 'symbol', signature: 'symbol()', standard: 'ERC20' },
  '313ce567': { name: 'decimals', signature: 'decimals()', standard: 'ERC20' },
  '18160ddd': { name: 'totalSupply', signature: 'totalSupply()', standard: 'ERC20' },
  '70a08231': { name: 'balanceOf', signature: 'balanceOf(address)', standard: 'ERC20' },
  a9059cbb: { name: 'transfer', signature: 'transfer(address,uint256)', standard: 'ERC20' },
  '23b872dd': { name: 'transferFrom', signature: 'transferFrom(address,address,uint256)', standard: 'ERC20' },
  dd62ed3e: { name: 'allowance', signature: 'allowance(address,address)', standard: 'ERC20' },
  '095ea7b3': { name: 'approve', signature: 'approve(address,uint256)', standard: 'ERC20' },

  // ERC721 Standard
  '6352211e': { name: 'ownerOf', signature: 'ownerOf(uint256)', standard: 'ERC721' },
  '081812fc': { name: 'getApproved', signature: 'getApproved(uint256)', standard: 'ERC721' },
  a22cb465: { name: 'setApprovalForAll', signature: 'setApprovalForAll(address,bool)', standard: 'ERC721' },
  e985e9c5: { name: 'isApprovedForAll', signature: 'isApprovedForAll(address,address)', standard: 'ERC721' },
  b88d4fde: { name: 'safeTransferFrom', signature: 'safeTransferFrom(address,address,uint256,bytes)', standard: 'ERC721' },

  // Common Custom Functions
  d0e30db0: { name: 'deposit', signature: 'deposit()' },
  '2e1a7d4d': { name: 'withdraw', signature: 'withdraw(uint256)' },
  '3ccfd60b': { name: 'withdraw', signature: 'withdraw()' },
  '8da5cb5b': { name: 'owner', signature: 'owner()' },
  f2fde38b: { name: 'transferOwnership', signature: 'transferOwnership(address)' },
  '715018a6': { name: 'renounceOwnership', signature: 'renounceOwnership()' },

  // Pausable
  '5c975abb': { name: 'paused', signature: 'paused()' },
  '8456cb59': { name: 'pause', signature: 'pause()' },
  '3f4ba83a': { name: 'unpause', signature: 'unpause()' },

  // Access Control
  '248a9ca3': { name: 'getRoleAdmin', signature: 'getRoleAdmin(bytes32)' },
  '91d14854': { name: 'hasRole', signature: 'hasRole(bytes32,address)' },
  '2f2ff15d': { name: 'grantRole', signature: 'grantRole(bytes32,address)' },
  d547741f: { name: 'revokeRole', signature: 'revokeRole(bytes32,address)' },
  '36568abe': { name: 'renounceRole', signature: 'renounceRole(bytes32,address)' },
};

/**
 * Converts hex string to Uint8Array, handling both prefixed and non-prefixed hex
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Extracts function selectors from contract bytecode
 */
export function extractFunctionSelectors(bytecode: string): FunctionSelector[] {
  const bytes = hexToBytes(bytecode);
  const selectors: FunctionSelector[] = [];

  // Look for function dispatch pattern: PUSH4 selector
  for (let i = 0; i < bytes.length - 4; i++) {
    // Look for PUSH4 (0x63) followed by 4 bytes
    if (bytes[i] === 0x63) {
      const selectorBytes = bytes.slice(i + 1, i + 5);
      const selector = Array.from(selectorBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const known = KNOWN_SELECTORS[selector];
      selectors.push({
        selector,
        offset: i,
        name: known?.name,
        signature: known?.signature,
      });

      i += 4; // Skip the selector bytes
    }
  }

  // Remove duplicates
  return selectors.filter((selector, index, self) => index === self.findIndex((s) => s.selector === selector.selector));
}

/**
 * Extracts all unique opcodes from bytecode
 */
export function extractOpcodes(bytecode: string): number[] {
  const bytes = hexToBytes(bytecode);
  const opcodeSet = new Set<number>();

  for (let i = 0; i < bytes.length; i++) {
    const opcode = bytes[i];
    opcodeSet.add(opcode);

    // Skip PUSH data
    if (opcode >= 0x60 && opcode <= 0x7f) {
      const pushSize = opcode - 0x5f;
      i += pushSize;
    }
  }

  return Array.from(opcodeSet).sort((a, b) => a - b);
}

/**
 * Determines if contract matches a known standard
 */
export function detectStandard(selectors: FunctionSelector[]): string | undefined {
  const selectorStrings = selectors.map((s) => s.selector);

  // ERC20 required functions
  const erc20Required = ['06fdde03', '95d89b41', '313ce567', '18160ddd', '70a08231', 'a9059cbb', '23b872dd', 'dd62ed3e', '095ea7b3'];
  const erc20Matches = erc20Required.filter((sel) => selectorStrings.includes(sel)).length;

  // ERC721 required functions
  const erc721Required = ['70a08231', '6352211e', 'a9059cbb', '23b872dd', '081812fc', 'a22cb465'];
  const erc721Matches = erc721Required.filter((sel) => selectorStrings.includes(sel)).length;

  if (erc20Matches >= 6) return 'ERC20';
  if (erc721Matches >= 4) return 'ERC721';

  return undefined;
}

/**
 * Performs complete bytecode analysis
 */
export function analyzeContract(bytecode: string): ContractAnalysis {
  const functions = extractFunctionSelectors(bytecode);
  const opcodes = extractOpcodes(bytecode);
  const size = hexToBytes(bytecode).length;
  const standardType = detectStandard(functions);

  return {
    functions,
    opcodes,
    size,
    standardType,
  };
}

/**
 * Pretty prints contract analysis results
 */
export function printContractAnalysis(bytecode: string): void {
  const analysis = analyzeContract(bytecode);

  console.log('🔍 Contract Bytecode Analysis');
  console.log('=====================================');
  console.log(`📦 Size: ${analysis.size} bytes`);

  if (analysis.standardType) {
    console.log(`🏷️  Standard: ${analysis.standardType}`);
  }

  console.log(`🔧 Opcodes: ${analysis.opcodes.length} unique opcodes used`);
  console.log(`⚡ Functions: ${analysis.functions.length} functions found\n`);

  if (analysis.functions.length === 0) {
    console.log('❌ No function selectors found');
    return;
  }

  console.log('📋 Function List:');
  console.log('─'.repeat(50));

  analysis.functions.forEach((func, index) => {
    console.log(`${index + 1}. 0x${func.selector}`);
    if (func.name && func.signature) {
      console.log(`   📝 ${func.signature}`);
      if (KNOWN_SELECTORS[func.selector]?.standard) {
        console.log(`   🏷️  ${KNOWN_SELECTORS[func.selector].standard} standard`);
      }
    } else {
      console.log(`   ❓ Unknown function`);
    }
    console.log(`   📍 Found at byte ${func.offset}`);
    console.log('');
  });

  // Show some opcodes for debugging
  console.log('🔧 Sample Opcodes:');
  console.log('─'.repeat(30));
  analysis.opcodes.slice(0, 10).forEach((opcode) => {
    console.log(`0x${opcode.toString(16).padStart(2, '0').toUpperCase()}`);
  });
  if (analysis.opcodes.length > 10) {
    console.log(`... and ${analysis.opcodes.length - 10} more`);
  }
}

/**
 * Checks if a contract has a specific function
 */
export function hasFunction(bytecode: string, functionName: string): boolean {
  const functions = extractFunctionSelectors(bytecode);
  return functions.some((func) => func.name === functionName);
}

/**
 * Gets function selector for a known function name
 */
export function getFunctionSelector(functionName: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const entry = Object.entries(KNOWN_SELECTORS).find(([_, info]) => info.name === functionName);
  return entry?.[0];
}
