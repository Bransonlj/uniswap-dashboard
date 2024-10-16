import axios from "axios";
import { getEtherscanApiKey } from "../../config/config";
import { ETHERSCAN_API_URL, getAllTransactions, getBlockNumberByTimestamp, getContractAddress, getTransactions, WETH_USDC_CONTRACT_ADDRESS } from "../etherscan.service";
import { getEthFromGas } from "../../utils/ether";

// mock functions
jest.mock('axios');
jest.mock('../../config/config', () => ({
  getEtherscanApiKey: jest.fn(),
}));
jest.mock('../../utils/ether', () => ({
  getEthFromGas: jest.fn(),
}));

describe('Etherscan API Service', () => {
  // common mocks and variables
  const dummyTimeStamp = 1728808129;
  const mockApiKey = 'mockApiKey';
  const mockTransactionResult = {
    blockNumber: '12345',
    timestamp: dummyTimeStamp,
    hash: '0x123456789',
    gasUsed: '1000000',
    gasPrice: '1000000000000',
  };
  const mockEthFee = 123;

  beforeEach(() => {
    getEtherscanApiKey.mockReturnValue(mockApiKey);
    getEthFromGas.mockReturnValue(mockEthFee);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getContractAddress' , () => {
    it('returns the contractAddress successfully', () => {
      expect(getContractAddress('WETH-USDC')).toBe(WETH_USDC_CONTRACT_ADDRESS);
    });

    it('throws error for invalid pool type', () => {
      expect(() => getContractAddress('invalid string').toThrow());
    })
  });

  describe('getBlockNumberByTimestamp', () => {
    it('returns the block number when API is called successfully', async () => {
      const expectedBlockNumber = '123456';

      axios.get.mockResolvedValue({
        data: {
          status: '1',
          result: expectedBlockNumber,
        }
      });

      const blockNumber = await getBlockNumberByTimestamp(dummyTimeStamp);
  
      // Verify that the correct block number is returned
      expect(blockNumber).toBe(expectedBlockNumber);
  
      // Verify axios.get was called with the correct params
      expect(axios.get).toHaveBeenCalledWith(ETHERSCAN_API_URL, {
        params: {
          module: 'block',
          action: 'getblocknobytime',
          timestamp: dummyTimeStamp,
          closest: 'after',
          apikey: mockApiKey,
        }
      });
    });

    it('throws an error when API responds with status 0', async () => {
      const expectedErrorMessage = 'Invalid timestamp';
      axios.get.mockResolvedValue({
        data: {
          status: '0',
          result: expectedErrorMessage
        }
      });
  
      await expect(getBlockNumberByTimestamp(dummyTimeStamp)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws an error when API call fails', async () => {
      axios.get.mockRejectedValue(new Error('Error'));

      await expect(getBlockNumberByTimestamp(dummyTimeStamp)).rejects.toThrow(
        'Failed to fetch Block number from Etherscan API.'
      );
    });
  });

  describe('getTransactions', () => {
    it('returns transactions when API call is successful', async () => {
      const params = {
        startBlock: 100000,
        endBlock: 200000,
        pool: 'WETH-USDC',
        page: 1,
        offset: 100
      };

      // mock same data structure returned from API
      axios.get.mockResolvedValue({
        data: {
          result: [
            mockTransactionResult,
          ]
        }
      });
  
      const result = await getTransactions(params);
  
      expect(result).toEqual([
        {
          blockNumber: mockTransactionResult.blockNumber,
          timestamp: mockTransactionResult.timestamp,
          hash: mockTransactionResult.hash,
          ethFee: mockEthFee,
        }
      ]);
  
      // verify API called with right params
      expect(axios.get).toHaveBeenCalledWith(ETHERSCAN_API_URL, {
        params: {
          module: "account",
          action: "tokentx",
          address: getContractAddress(params.pool),
          page: params.page,
          offset: params.offset,
          startblock: params.startBlock,
          endblock: params.endBlock,
          sort: "desc",
          apikey: mockApiKey,
        }
      });
    });

    it('throws an error when API call fails', async () => {
      axios.get.mockRejectedValue(new Error('Error'));
  
      await expect(getTransactions({
        startBlock: 100000,
        endBlock: 200000,
        pool: 'WETH-USDC',
        page: 1,
        offset: 100
      })).rejects.toThrow('Failed to fetch transaction from Etherscan API.');
    });
  });

  describe('getAllTransactions', () => {
    it('returns all transactions across all pages', async () => {


      const mockTransaction = {
        blockNumber: mockTransactionResult.blockNumber,
        timestamp: mockTransactionResult.timestamp,
        hash: mockTransactionResult.hash,
        ethFee: mockEthFee,
      }

      axios.get.mockResolvedValueOnce({
        data: {
          result: [mockTransactionResult, mockTransactionResult]
        }
      }).mockResolvedValueOnce({
        data: {
          result: [mockTransactionResult]
        }
      }).mockResolvedValueOnce({
        data: {
          result: []
        }
      });

      const transactions = await getAllTransactions({ 
        startBlock: 10000,  // dummy params
        endBlock: 200000, 
        pool: 'WETH-USDC', 
      }); 
      // verify all results compiled
      expect(transactions).toEqual([mockTransaction, mockTransaction, mockTransaction]);
      // verify api stops fetching after empty result
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
  });
});