import axios from "axios";
import { getLiveTransactions, getPrice, getTransactions, transactionServiceUrl } from "../transactionService";

// mock functions
jest.mock('axios');

const mockTransactions = [
  { blockNumber: 10123, timestamp: 1728808129, hash: 'hash1', ethFee: 0.01, usdtFee: 123.0, pool: 'pool1' },
  { blockNumber: 20123, timestamp: 1728808130, hash: 'hash2', ethFee: 0.02, usdtFee: 456.0, pool: 'pool2' },
];

const dummyParams = {
  startDate: new Date('2020-10-10T00:00'),
  endDate: new Date('2020-10-11T00:00'),
  pool: 'WETH-USDC',
  page: 1,
  offset: 50,
};

const dummyLiveParams = {
  pool: 'WETH-USDC',
  page: 1,
  offset: 50,
};

describe('transactionService Test', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('fetches transactions successfully', async () => {
      axios.get.mockResolvedValue({
        data: {
          result: mockTransactions
        }
      });

      const result = await getTransactions(dummyParams);

      // Verify API called with correct params
      expect(axios.get).toHaveBeenCalledWith(transactionServiceUrl, {
        params: {
          start: Math.floor(dummyParams.startDate.getTime() / 1000),
          end: Math.floor(dummyParams.endDate.getTime() / 1000),
          pool: dummyParams.pool,
          page: dummyParams.page,
          offset: dummyParams.offset,
        }
      });
      expect(result).toEqual(mockTransactions);
    });

    it('throws an error when the request fails', async () => {
      const errorMessage = 'Request failed';
      axios.get.mockRejectedValue({ message: errorMessage });

      // verify error thrown
      await expect(getTransactions(dummyParams)).rejects.toThrow(`Network or unknown error: ${errorMessage}`);
    });
  });
  
  describe('getLiveTransactions', () => {
    it('fetches live transactions successfully', async () => {
      axios.get.mockResolvedValue({
        data: {
          result: mockTransactions
        }
      });

      const result = await getLiveTransactions(dummyLiveParams);

      // Verify API called with correct params
      expect(axios.get).toHaveBeenCalledWith(transactionServiceUrl + '/live', {
        params: dummyLiveParams,
      });
      expect(result).toEqual(mockTransactions);
    });

    it('throws an error when the request fails', async () => {
      const errorMessage = 'Request failed';
      axios.get.mockRejectedValue({ message: errorMessage });

      // verify error thrown
      await expect(getLiveTransactions(dummyLiveParams)).rejects.toThrow(`Network or unknown error: ${errorMessage}`);
    });
  });

  describe('getPrice', () => {
    const getPriceParams = {
      time: new Date('2020-10-10T00:00'),
      symbol: 'ETH-USDT',
    }
    it('fetches the price successfully', async () => {
      const mockPrice = 12345;
      axios.get.mockResolvedValue({
        data: {
          result: {
            price: mockPrice
          }
        }
      });

      const result = await getPrice(getPriceParams);

      // Verify API called with correct params
      expect(axios.get).toHaveBeenCalledWith(transactionServiceUrl + '/price', {
        params: {
          time: Math.floor(getPriceParams.time.getTime() / 1000) - 1,
          symbol: getPriceParams.symbol,
        },
      });
      expect(result).toEqual(mockPrice);
    });

    it('throws an error when the request fails', async () => {
      const errorMessage = 'Request failed';
      axios.get.mockRejectedValue({ message: errorMessage });

      // verify error thrown
      await expect(getPrice(getPriceParams)).rejects.toThrow(`Network or unknown error: ${errorMessage}`);
    });
  });
});
