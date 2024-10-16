import { getBlockNumberByTimestamp, getTransactions } from "../service/etherscan.service.js";

export async function getManyTransactions(req, res) {
  try {
    const { start, end, pool, page, offset } = req.query;

    if (!start || !end || !pool) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Fetch start and end block for given timestamps
    const startBlock = await getBlockNumberByTimestamp(start);
    const endBlock = await getBlockNumberByTimestamp(end);

    console.log(startBlock, endBlock);
    const result = await getTransactions({startBlock, endBlock, pool, page, offset});

    // convert result eth fee to usdt

    return res.status(200).json({ result }); 
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'An error occurred while fetching transactions.' });
  }
}
