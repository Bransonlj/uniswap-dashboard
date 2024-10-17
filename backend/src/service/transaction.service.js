import Transaction from "../model/transactionModel.js";

/**
 * Returns the timestamp of the record with the most recent timestamp in the Transaction Collection.
 * @returns {number} The most recent timestamp.
 */
export async function getMostRecentTimestamp() {
  try {
    // Find one document, sorted by `timestamp` in descending order
    const mostRecentTransaction = await Transaction.findOne().sort({ timestamp: -1 });

    // Return null if no transactions in the collection
    if (!mostRecentTransaction) {
      console.log('No transactions found, "Transaction" Collection is empty');
      return null;
    }

    return mostRecentTransaction.timestamp;
  } catch (error) {
    throw new Error('Failed to get most recent timestamp: ' + error.message);
  }
};

export async function getLiveTransactionsFromDb({pageNumber, pageSize, pool}) {
  try {
    const skip = (pageNumber - 1) * pageSize;

    const transactions = await Transaction.find({ pool })
      .sort({ timestamp: -1})
      .skip(skip)
      .limit(pageSize);

    return transactions; 
  } catch (error) {
    throw new Error('Error getting live transactions from database: ' + error.message);
  }
}

/**
 * Saves a list of transactions to Mongodb Transaction model
 * @param {*} transactions 
 */
export async function saveTransactions(transactions) {
  transactions.forEach(async (transaction) => {
    try {
      const newTransaction = new Transaction({
        blockNumber: transaction.blockNumber,
        timestamp: transaction.timestamp,
        hash: transaction.hash,
        ethFee: transaction.ethFee,
        usdtFee: transaction.usdtFee,
        pool: transaction.pool,
      });
      await newTransaction.save();
      console.log('Transaction recorded to Database:', newTransaction.timestamp);
    } catch (error) {
      console.error('Error recording Transaction', error.message);
    }
  });
}