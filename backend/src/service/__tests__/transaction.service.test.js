import Transaction from "../../model/transactionModel";
import { getLiveTransactionsFromDb, getMostRecentTimestamp, saveTransactions } from "../transaction.service";

// mock functions
jest.mock('../../model/transactionModel');

const mockTransactions = [
    { blockNumber: 1, timestamp: 1728808129, hash: 'hash1', ethFee: 0.01, usdtFee: 1.0, pool: 'pool1' },
    { blockNumber: 2, timestamp: 1728808130, hash: 'hash2', ethFee: 0.02, usdtFee: 2.0, pool: 'pool2' },
];

describe('Transaction Collection Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMostRecentTimestamp', () => {
        it('returns the most recent timestamp if a transaction exists', async () => {
            // Mock the chained Transaction query responses from mongodb
            const mockTimestamp = 1728808129;
            const mockTransaction = { timestamp: mockTimestamp };
            Transaction.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTransaction),
            });
        
            const result = await getMostRecentTimestamp();
        
            expect(result).toEqual(mockTimestamp);
            expect(Transaction.findOne).toHaveBeenCalledWith();  // ensure findOne was called
            expect(Transaction.findOne().sort).toHaveBeenCalledWith({ timestamp: -1 });  // ensure sorting is called
        });

        it('returns null if no transactions exist', async () => {
            // Mock mongodb to return null
            Transaction.findOne.mockReturnValue({
              sort: jest.fn().mockResolvedValue(null),
            });
        
            const result = await getMostRecentTimestamp();
        
            expect(result).toBeNull();
            expect(Transaction.findOne).toHaveBeenCalledWith();  // ensure findOne was called
            expect(Transaction.findOne().sort).toHaveBeenCalledWith({ timestamp: -1 });  // ensure sorting is called
        });
        
        it('throws an error if database query fails', async () => {
            const mockError = new Error('Query Error');
            
            // Mock mongodb to throw an error
            Transaction.findOne.mockReturnValue({
              sort: jest.fn().mockRejectedValue(mockError),
            });

            await expect(getMostRecentTimestamp()).rejects.toThrow('Failed to get most recent timestamp: Query Error');
            expect(Transaction.findOne).toHaveBeenCalledWith();  // ensure findOne was called
            expect(Transaction.findOne().sort).toHaveBeenCalledWith({ timestamp: -1 });  // ensure sorting is called
        });
    });

    describe('getLiveTransactionsFromDb', () => {
        it('returns transactions from the database', async () => {
            // Mock mongodb chained query
            Transaction.find.mockReturnValue({
              sort: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue(mockTransactions),
            });
        
            const pageNumber = 1;
            const pageSize = 2;
            const pool = 'dummyPool';
            const result = await getLiveTransactionsFromDb({ pageNumber, pageSize, pool });
        
            expect(result).toEqual(mockTransactions);
            // Ensure queries are called with the correct arguments
            expect(Transaction.find).toHaveBeenCalledWith({ pool });
            expect(Transaction.find().sort).toHaveBeenCalledWith({ timestamp: -1 });
            expect(Transaction.find().skip).toHaveBeenCalledWith((pageNumber - 1) * pageSize);
            expect(Transaction.find().limit).toHaveBeenCalledWith(pageSize);
        });

        it('throws an error if database query fails', async () => {
            // Mock mongodb chained query to throw an error
            const mockError = new Error('Query Error');
            Transaction.find.mockReturnValue({
              sort: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              limit: jest.fn().mockRejectedValue(mockError),
            });
        
            const pageNumber = 1;
            const pageSize = 2;
            const pool = 'dummyPool';
        
            // Call the function and expect it to throw the error
            await expect(getLiveTransactionsFromDb({ pageNumber, pageSize, pool }))
              .rejects.toThrow('Error getting live transactions from database: Query Error');
        
            // Ensure queries are called with the correct arguments
            expect(Transaction.find).toHaveBeenCalledWith({ pool });
            expect(Transaction.find().sort).toHaveBeenCalledWith({ timestamp: -1 });
            expect(Transaction.find().skip).toHaveBeenCalledWith((pageNumber - 1) * pageSize);
            expect(Transaction.find().limit).toHaveBeenCalledWith(pageSize);
          });
    })

    describe('saveTransactions', () => {
        it('saves each transaction to the database', async () => {
            // Mock the save function
            Transaction.prototype.save = jest.fn().mockResolvedValue();
    
            await saveTransactions(mockTransactions);
  
            // 2 transactions created correctly      
            expect(Transaction).toHaveBeenCalledTimes(2);
            expect(Transaction).toHaveBeenCalledWith(mockTransactions[0]);
            expect(Transaction).toHaveBeenCalledWith(mockTransactions[1]);
        
            // Check that the save method was called for each transaction
            expect(Transaction.prototype.save).toHaveBeenCalledTimes(2);
        });

        it('handle errors thrown by save method', async () => {
            // Mock the save method to throw an error
            Transaction.prototype.save = jest.fn().mockRejectedValue(new Error('Error'));
        
            // Verify no errors thrown
            await expect(saveTransactions(mockTransactions)).resolves.not.toThrow();
        
            // Check that the save method continued to call despite errors
            expect(Transaction.prototype.save).toHaveBeenCalledTimes(2);
          });
    });
});
