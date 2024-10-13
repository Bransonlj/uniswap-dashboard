import { getBlockNumberByTimestamp, getContractAddress, getEthFromGas, getTransactions, WETH_USDC_CONTRACT_ADDRESS } from "../transaction.service.js";
import { getApiKey } from "../../utils/etherscan.js";
import axios from "axios";

jest.mock('axios');
jest.mock('../../utils/etherscan.js', () => ({
  getApiKey: jest.fn(),
}));

describe('Transaction Service', () => {
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
      const timestamp = 1728808129;
      const mockApiKey = 'test-api-key';

      getApiKey.mockReturnValue(mockApiKey);
      axios.get.mockResolvedValue({
        data: {
          status: '1',
          result: expectedBlockNumber  // Example block number
        }
      });

      const blockNumber = await getBlockNumberByTimestamp(timestamp);
  
      // Verify that the correct block number is returned
      expect(blockNumber).toBe(expectedBlockNumber);
  
      // Ensure axios.get was called with the correct parameters
      expect(axios.get).toHaveBeenCalledWith('https://api.etherscan.io/api', {
        params: {
          module: 'block',
          action: 'getblocknobytime',
          timestamp: timestamp,
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
  
      await expect(getBlockNumberByTimestamp(1728808129)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws an error if it encounters an error while querying the API', async () => {
      axios.get.mockRejectedValue(new Error('Error'));

      await expect(getBlockNumberByTimestamp(1728808129)).rejects.toThrow(
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

      const mockResult = {
        blockNumber: '12345',
        timestamp: '1728808129',
        hash: '0x123456789',
        gasUsed: '1000000',
        gasPrice: '1000000000000',
      };

      axios.get.mockResolvedValue({
        data: {
          result: [
            mockResult,
          ]
        }
      });

      const mockApiKey = 'test-api-key';

      getApiKey.mockReturnValue(mockApiKey);
  
      const result = await getTransactions(params);
  
      expect(result).toEqual([
        {
          blockNumber: mockResult.blockNumber,
          timestamp: mockResult.timestamp,
          hash: mockResult.hash,
          ethFee: 1,
        }
      ]);
  
      expect(axios.get).toHaveBeenCalledWith('https://api.etherscan.io/api', {
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
  })
})