import { getPriceAtTimestamp } from "../service/binance.service.js";
import { getBlockNumberByTimestamp, getTransactions } from "../service/etherscan.service.js";
import Transaction from "../model/transactionModel.js";
import { getLiveTransactionsFromDb, getMostRecentTimestamp, saveTransactions } from "../service/transaction.service.js";

/**
 * Handles HTTP requests to fetch multiple transactions based on a time range, pool, and pagination details.
 *
 * @param {Object} req - Express request object.
 * @param {number} req.query.start - The timestamp in seconds to start fetching transactions from.
 * @param {number} req.query.end - The timestamp in seconds to fetch transactions up to.
 * @param {string} req.query.pool - The pool name (e.g. 'WETH-USDC').
 * @param {number} req.query.page - The page number for paginated results.
 * @param {number} req.query.offset - The number of results per page.
 */
export async function getManyTransactions(req, res) {
  try {
    const { start, end, pool, page, offset } = req.query;

    // verify params
    if (!start || !end || !pool) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Validate start and end timestamps
    const startTimestamp = Number(start);
    const endTimestamp = Number(end);
    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return res.status(400).json({ message: 'Invalid start or end timestamp' });
    }

    // Ensure start is earlier than end
    if (startTimestamp >= endTimestamp) {
      return res.status(400).json({ message: "'start' timestamp must be earlier than 'end' timestamp" });
    }

    // Fetch start and end block for given timestamps
    const startBlock = await getBlockNumberByTimestamp(start);
    const endBlock = await getBlockNumberByTimestamp(end);

    const result = await getTransactions({startBlock, endBlock, pool, page, offset});

    // convert result eth fee to usdt
    const usdtTransactions = await Promise.all(result.map(async (transaction) => {
      const price = await getPriceAtTimestamp({ timestamp: transaction.timestamp, symbol: 'ETHUSDT' });
      return {
        ...transaction,
        usdtFee: price * transaction.ethFee,
      }
    }));

    return res.status(200).json({ result: usdtTransactions }); 
  } catch (error) {
    const message = 'Error fetching transactions: ' + error.message;
    console.error(message);
    return res.status(500).json({ message });
  }
}

/**
 * 
 * @param {*} interval Set interval in miliseconds
 * @param {*} pool 
 */
export async function recordLiveTransactions(pool) {
  try {
    const endTimeStamp = Math.floor(Date.now() / 1000);
    let startTimeStamp = await getMostRecentTimestamp();
    /**
     * Limitation is there is alot of transaction data coming from the API, so if this server is down for too long,
     * the amount of data between the most recent transaction saved and when the server starts again may be too large
     * to query from the API effectively (100s of pages).
     * 
     * Therefore for this purpose, we will set a max limit of the time we start querying from when we start the server 
     * to just 5 minutes ago.
     */
    if (!startTimeStamp || endTimeStamp - startTimeStamp > 5 * 60) {
      // no previous record OR more than 5 minutes ago (reached limit), set to 5 minutes ago exactly
      startTimeStamp = endTimeStamp - 5 * 60;
      console.log('live data more than 5 minutes old, fetching from 5 minutes ago only');
    }

    console.log('Recording live data between times:', startTimeStamp, endTimeStamp)
    
    // Fetch start and end block for given timestamps
    const startBlock = await getBlockNumberByTimestamp(startTimeStamp);
    const endBlock = await getBlockNumberByTimestamp(endTimeStamp);

    const result = await getTransactions({startBlock, endBlock, pool});

    // convert result eth fee to usdt
    const usdtTransactions = await Promise.all(result.map(async (transaction) => {
      const price = await getPriceAtTimestamp({ timestamp: transaction.timestamp, symbol: 'ETHUSDT' });
      return {
        ...transaction,
        usdtFee: price * transaction.ethFee,
        pool: pool,
      }
    }));

    saveTransactions(usdtTransactions);

  } catch (error) {
    console.error('Error fetching API data:', error);
  }
};

export async function getLiveTransactions(req, res) {
  try {
    const { pool, page, offset } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(offset, 10) || 50;

    const transactions = await getLiveTransactionsFromDb({
      pageNumber,
      pageSize,
      pool,
    })

    return res.status(200).json({ result: transactions }); 
  } catch (error) {
    const message = 'Error fetching live transactions: ' + error.message;
    console.error(message);
    return res.status(500).json({ message });
  }
}
/**
 * Fetches the price of a specified cryptocurrency at a given timestamp.
 *
 * @param {Object} req - The request object from Express.
 * @param {string} req.query.time - The timestamp for which to fetch the price (in seconds).
 * @param {string} req.query.symbol - The trading pair symbol (e.g., 'ETHUSDT').
 */
export async function getPrice(req, res) {
  try {
    const { time, symbol } = req.query;

    // verify params
    if (!time || !symbol) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
  
    // Validate start and end timestamps
    const timestamp = Number(time);
    if (isNaN(timestamp)) {
      return res.status(400).json({ message: 'Invalid timestamp' });
    }
  
    const price = await getPriceAtTimestamp({ timestamp, symbol });
    
    return res.status(200).json({ result: { price } }); 
  } catch (error) {
    const message = 'Error fetching price: ' + error.message;
    console.error(message);
    return res.status(500).json({ message });
  }
}
