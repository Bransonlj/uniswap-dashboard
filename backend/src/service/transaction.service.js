import Transaction from "../model/transactionModel.js";

export async function getMostRecentTimestamp() {
  try {
    // Find one document, sorted by `timestamp` in descending order
    const mostRecentTransaction = await Transaction.findOne().sort({ timestamp: -1 });

    // If no documents are found, return null
    if (!mostRecentTransaction) {
      console.log('No transactions found.');
      return null;
    }

    // Return the most recent timestamp
    return mostRecentTransaction.timestamp;
  } catch (error) {
    throw new Error('Failed to fetch most recent timestamp: ' + error.message);
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
  });
}