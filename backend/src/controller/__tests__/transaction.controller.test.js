import { getPriceAtTimestamp } from "../../service/binance.service";
import { getBlockNumberByTimestamp, getTransactions } from "../../service/etherscan.service";
import { getLiveTransactionsFromDb } from "../../service/transaction.service";
import { getLiveTransactions, getManyTransactions, getPrice } from "../transaction.controller";

// mocks
jest.mock("../../service/binance.service");
jest.mock("../../service/transaction.service");
jest.mock("../../service/etherscan.service");

const mockTransactions = [
  { blockNumber: 1, timestamp: 1728808129, hash: 'hash1', ethFee: 0.01, usdtFee: 1.0, pool: 'pool1' },
  { blockNumber: 2, timestamp: 1728808130, hash: 'hash2', ethFee: 0.02, usdtFee: 2.0, pool: 'pool2' },
];

describe('Transaction Controller', () => {
  let req, res;

  beforeEach(() => {
    // reset req and res
    req = {
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe('getManyTransactions', () => {
    const mockQuery = {
      start: '1728808129', // params are string during request
      end: '1728808130',  
      pool: 'WETH-USDC',
      page: '1',
      offset: '10',
  
    }

    it('returns transactions for valid query parameters', async () => {
      // setup mock values
      req.query = mockQuery;
      const mockStartBlock = 1000;
      const mockEndBlock = 2000;
      const mockPrice = 20000;
      const mockTimestamp = 1728808129;
      const mockEthFee = 0.01;

      // mock service function calls
      getBlockNumberByTimestamp.mockResolvedValueOnce(mockStartBlock);
      getBlockNumberByTimestamp.mockResolvedValueOnce(mockEndBlock);
      getTransactions.mockResolvedValueOnce([{
        timestamp: mockTimestamp,
        ethFee: mockEthFee,
      }]);
      getPriceAtTimestamp.mockResolvedValueOnce(mockPrice);
  
      await getManyTransactions(req, res);
  
      // validate result response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        result: [{ 
          timestamp: mockTimestamp, 
          ethFee: mockEthFee, 
          usdtFee: mockEthFee * mockPrice,
        }],
      });
  
      // validate service function calls
      expect(getBlockNumberByTimestamp).toHaveBeenCalledTimes(2);
      expect(getBlockNumberByTimestamp.mock.calls[0][0]).toEqual(mockQuery.start);
      expect(getBlockNumberByTimestamp.mock.calls[1][0]).toEqual(mockQuery.end);
      expect(getTransactions).toHaveBeenCalledWith({
        startBlock: mockStartBlock,
        endBlock: mockEndBlock,
        pool: mockQuery.pool,
        page: mockQuery.page,
        offset: mockQuery.offset,
      });
      expect(getPriceAtTimestamp).toHaveBeenCalledWith({ timestamp: mockTimestamp, symbol: 'ETHUSDT' });
    });

    it('returns 400 error for missing required parameters', async () => {
      await getManyTransactions(req, res); // call without query params
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required parameters' });
    });

    it('returns a 400 error if start timestamp is not earlier than end timestamp', async () => {
      req.query.start = mockQuery.start;
      req.query.end = mockQuery.start; // same time as start
      req.query.pool = mockQuery.pool;
  
      await getManyTransactions(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "'start' timestamp must be earlier than 'end' timestamp" });
    });

    it('returns a 500 error if any service function throws an error', async () => {
      req.query = mockQuery;
      getBlockNumberByTimestamp.mockRejectedValueOnce(new Error('Error')); // mock throw error
  
      await getManyTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching transactions: Error' });
    });
  });

  describe('getLiveTransactions', () => {
    const mockQuery = {
      pool: 'WETH-USDC',
      page: '1', // params are string in during request
      offset: '10',
    }
    it('returns live transactions for valid query parameters', async () => {
      req.query = mockQuery;
      
      getLiveTransactionsFromDb.mockResolvedValue(mockTransactions);
  
      await getLiveTransactions(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: mockTransactions });
      expect(getLiveTransactionsFromDb).toHaveBeenCalledWith({
        pageNumber: Number(mockQuery.page),
        pageSize: Number(mockQuery.offset),
        pool: mockQuery.pool,
      });
    });
  
    it('returns live transactions with default values for missing parameters', async () => {
      req.query.pool = mockQuery.pool;
  
      getLiveTransactionsFromDb.mockResolvedValue(mockTransactions);
  
      await getLiveTransactions(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: mockTransactions });
      expect(getLiveTransactionsFromDb).toHaveBeenCalledWith({
        pageNumber: 1, // default page number
        pageSize: 50,  // default offset
        pool: mockQuery.pool,
      });
    });

    it('returns 400 error for missing parameters', async () => {
      console.log(req);
      await getLiveTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required parameters' });
    });
  
    it('returns 500 error when getLiveTransactionsFromDb method throws an error', async () => {
      req.query = mockQuery;
      
      getLiveTransactionsFromDb.mockRejectedValue(new Error('Error'));
  
      await getLiveTransactions(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching live transactions: Error' });
    });
  });

  describe('getPrice', () => {
    const mockQuery = {
      time: '1728808129', // timestamp is string during request.
      symbol: 'ETHUSDT'
    };

    it('returns the price for valid timestamp and symbol', async () => {
      req.query = mockQuery;
      const mockPrice = 3000;
      
      // Mock the getPriceAtTimestamp function
      getPriceAtTimestamp.mockResolvedValue(mockPrice);

      await getPrice(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: { price: mockPrice } });
      expect(getPriceAtTimestamp).toHaveBeenCalledWith({ timestamp: Number(mockQuery.time), symbol: mockQuery.symbol });
    });

    it('returns 400 error for missing parameters', async () => {
      await getPrice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required parameters' });
    });

    it('returns 400 error for invalid timestamp', async () => {
      req.query.time = 'invalid_timestamp';
      req.query.symbol = 'ETHUSDT';

      await getPrice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid timestamp' });
    });

    it('should return a 500 error if getPriceAtTimestamp throws an error', async () => {
      req.query = mockQuery;
      getPriceAtTimestamp.mockRejectedValue(new Error('Error'));

      await getPrice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching price: Error' });
    });
  });
});