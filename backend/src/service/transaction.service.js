import { getApiKey } from "../utils/etherscan.js";
import axios from 'axios';

export const WETH_USDC_CONTRACT_ADDRESS = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

/**
 * Retrieves the contract address for the specified pool type.
 *
 * @param {string} pool - The type of pool (e.g. 'WETH-USDC').
 * @returns {string} The contract address for the specified pool.
 * @throws {Error} Throws an error if the pool type is invalid.
 */
export function getContractAddress(pool) {
  switch (pool) {
    case 'WETH-USDC':
      return WETH_USDC_CONTRACT_ADDRESS;
    default:
      throw new Error("Invalid Pool type");
  }
}

export function getEthFromGas(gasUsed, gasPrice) {
  return (gasUsed * gasPrice) / 1e18;
}

/**
 * Queries the Etherscan api for the block number that was mined at a certain timestamp.
 * @param {number} timestamp - The integer representing the Unix timestamp in seconds.
 * @returns {Promise<number>} - The resultant block number.
 */
export async function getBlockNumberByTimestamp(timestamp) {
  let response;
  try {
    const apiUrl = 'https://api.etherscan.io/api';

    response = await axios.get(apiUrl, {
      params: {
        module: 'block',
        action: 'getblocknobytime',
        timestamp: timestamp,
        closest: 'after',
        apikey: getApiKey(),
      }
    });

  } catch (error) {
    console.error('Error querying Block number from Etherscan API: ', error.message);
    throw new Error('Failed to fetch Block number from Etherscan API.');
  }

  if (response.data.status === "0") {
    // invalid response 
    throw new Error(response.data.result);
  }

  return response.data.result;

}

export async function getTransactions({startBlock, endBlock, pool, page=1, offset=100}) {
  const apiUrl = 'https://api.etherscan.io/api';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        module: "account",
        action: "tokentx",
        address: getContractAddress(pool),
        page,
        offset,
        startblock: startBlock,
        endblock: endBlock,
        sort: "desc",
        apikey: getApiKey(),
      }
    });

    return response.data.result.map(transaction => {
      return {
        blockNumber: transaction.blockNumber,
        timestamp: transaction.timestamp,
        hash: transaction.hash,
        ethFee: getEthFromGas(transaction.gasUsed, transaction.gasPrice),
      };
    });

  } catch (error) {
    console.error('Error querying transaction from Etherscan API: ', error.message);
    throw new Error('Failed to fetch transaction from Etherscan API.');
  }
}

export function getAllTransactions(startBlock, endBlock, pool) {
  const transactions = [];
  let page = 1;
  while (true) {
    const result = getTransactions({startBlock, endBlock, pool, page});
    if (result.size() === 0) {
      break;
    }

    transactions.push(...result);
  }

  return transactions;
}

export async function getEthUsdtPriceAtTimestamp(timestamp) {
  const apiUrl = 'https://api.binance.com/api/v3/klines';
  try {
    const response = await axios.get(apiUrl, {
      params: {
        symbol: 'ETHUSDT',
        interval: '1s',
        startTime: timestamp * 1000, // convert to miliseconds
        endTime: timestamp * 1000,
      }
    });

    return parseFloat(response.data[0][1]) // get openPrice of 1st interval
  } catch (error) {
    console.error('Error querying price from Binance API: ', error);
    throw new Error('Failed to fetch price from Binance API.');
  }
}

