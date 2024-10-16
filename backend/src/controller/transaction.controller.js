import { getEthUsdtPriceAtTimestamp } from "../service/binance.service.js";
import { getBlockNumberByTimestamp, getTransactions } from "../service/etherscan.service.js";

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
      const price = await getEthUsdtPriceAtTimestamp(transaction.timestamp);
      return {
        ...transaction,
        usdtFee: price * transaction.ethFee,
      }
    }));

    return res.status(200).json({ result: usdtTransactions }); 
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'An error occurred while fetching transactions.' });
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
  
    const price = await getEthUsdtPriceAtTimestamp({ timestamp, symbol });
    
    return res.status(200).json({ result: { price } }); 
  } catch (error) {
    console.error('Error fetching price:', error);
    return res.status(500).json({ message: 'An error occurred while fetching price.' });
  }
}
