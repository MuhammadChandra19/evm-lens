import { ContractPlaygroundSchema } from './schema';

const DEFAULT_DATA: ContractPlaygroundSchema = {
  contractConfiguration: {
    contractAddress: "0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8",
    decimals:'18',
    ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    totalSupply: "1000000"
  },
  bytecodeAndAbi: {
    constructorBytecode: "0x608060405234801561001057600080fd5b506040516107d03803806107d083398101604052810190508061002f576000803c8d6000fd5b50600160005560408051908101604052806020016040528060051b6040528060051b6040528160068201526004810191825260408051602001604052806020016040528060051b6040528060051b604052816006820",
    contractAbi: `
      [
        {
          "inputs": [
            {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"}
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    `
  }
}

export {
  DEFAULT_DATA
}