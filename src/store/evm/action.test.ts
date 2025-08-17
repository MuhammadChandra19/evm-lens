import { Abi } from '@/service/evm-analyzer/abi/types'
import test_abi from "@/service/evm-analyzer/script/test_abi.json"
import { EVMState } from './types'
import * as actions from "./action"
import EVMAnalyzer from '@/service/evm-analyzer'
import { generateRandomAddress } from '@/lib/utils'
import { Address } from '@/service/evm-analyzer/utils/address'

describe('Store: EVM action', () => {
  let evmState: EVMState = {
    constructorBytecode: "",
    abi: {} as Abi,
    totalSupply: BigInt(0),
    decimals: 18,
  }

  const get = () => evmState
  const set = (partial: Partial<EVMState>) => {
    evmState = {
      ...evmState,
      ...partial,
    }
  }

  const MOCK_CREATE_ACCOUNT = jest.fn()
  const MOCK_DEPLOY_CONTRACT = jest.fn()

  evmState.evm = {
    createAccount: MOCK_CREATE_ACCOUNT,
    deployContract: MOCK_DEPLOY_CONTRACT
  } as unknown as EVMAnalyzer


  describe('deployContractToEVM', () => {
    test('should return null when create account fail: owner account', async () => {
      MOCK_CREATE_ACCOUNT.mockResolvedValueOnce(null)
      const res = await actions.deployContractToEVM(
        {
          abi: {} as Abi,
          constructorBytecode: generateRandomAddress(),
          contractAddress: generateRandomAddress(),
          ownerAddress: generateRandomAddress()
        },
        set,
        get
      )

      expect(res).toEqual(null)
    })
    test('should return null when create account fail: contract account', async () => {
      const ownerAddress = generateRandomAddress()
      MOCK_CREATE_ACCOUNT
        .mockResolvedValueOnce(new Address(Buffer.from(ownerAddress.slice(2), "hex")))
        .mockResolvedValueOnce(null)
      const res = await actions.deployContractToEVM(
        {
          abi: {} as Abi,
          constructorBytecode: generateRandomAddress(),
          contractAddress: generateRandomAddress(),
          ownerAddress: ownerAddress
        },
        set,
        get
      )

      expect(res).toEqual(null)
    })

    test('should return null when failed to deploy contract', async () => {
      const ownerAddress = generateRandomAddress()
      const contractAddress = generateRandomAddress()

      const fromOwnerAddress = new Address(Buffer.from(ownerAddress.slice(2), "hex"))
      const fromContractAddress = new Address(Buffer.from(contractAddress.slice(2), "hex"))

      MOCK_CREATE_ACCOUNT
        .mockResolvedValueOnce(fromOwnerAddress)
        .mockResolvedValueOnce(fromContractAddress)

      MOCK_DEPLOY_CONTRACT
        .mockResolvedValueOnce({ success: false })

      const res = await actions.deployContractToEVM(
        {
          abi: {} as Abi,
          constructorBytecode: generateRandomAddress(),
          contractAddress: contractAddress,
          ownerAddress: ownerAddress
        },
        set,
        get
      )

      expect(res).toEqual(null)

    })

    test('should return success', async () => {
      const ownerAddress = generateRandomAddress()
      const contractAddress = generateRandomAddress()

      const fromOwnerAddress = new Address(Buffer.from(ownerAddress.slice(2), "hex"))
      const fromContractAddress = new Address(Buffer.from(contractAddress.slice(2), "hex"))

      MOCK_CREATE_ACCOUNT
        .mockResolvedValueOnce(fromOwnerAddress)
        .mockResolvedValueOnce(fromContractAddress)

      MOCK_DEPLOY_CONTRACT
        .mockResolvedValueOnce({ success: true })

      const res = await actions.deployContractToEVM(
        {
          abi: test_abi as Abi,
          constructorBytecode: generateRandomAddress(),
          contractAddress: contractAddress,
          ownerAddress: ownerAddress
        },
        set,
        get
      )

      expect(res?.success).toEqual(true)
      expect(evmState.ownerAddress).toEqual(fromOwnerAddress)
    })
  })
})