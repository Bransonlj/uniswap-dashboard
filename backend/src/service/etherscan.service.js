import { getEtherscanApiKey } from "../config/config.js";
import { handleAxiosError } from "../utils/axiosUtils.js";
import { getEthFromGas } from "../utils/ether.js";
import axios from 'axios';

export const WETH_USDC_CONTRACT_ADDRESS = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';
export const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
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

/**
 * Queries the Etherscan API for the block number that was mined at a certain timestamp.
 * 
 * @param {number} timestamp - The integer representing the Unix timestamp in seconds.
 * @returns {Promise<number>} - The resultant block number.
 */
export async function getBlockNumberByTimestamp(timestamp) {
  let response;
  const params = {
    module: 'block',
    action: 'getblocknobytime',
    timestamp: timestamp,
    closest: 'after',
    apikey: getEtherscanApiKey(),
  };
  try {
    response = await axios.get(ETHERSCAN_API_URL, {
      params
    });

  } catch (error) {
    handleAxiosError(error, 'Error querying Block number from Etherscan API');
  }

  if (response.data.status === "0") {
    // invalid response 
    throw new Error(response.data.result);
  }

  return response.data.result;

}
/**
 * Queries the Etherscan API for transactions corresponding to the specific address, block range 
 * and paginated options.
 *
 * @param {Object} options - The options params for the method.
 * @param {number} options.startBlock - The block number to start fetching transactions from.
 * @param {number} options.endBlock - The block number to end fetching transactions at.
 * @param {string} options.pool - The pool name (e.g. 'WETH-USDC').
 * @param {number} options.page - The page number for paginated results.
 * @param {number} options.offset - The number of transactions per page.
 * @returns {Promise<Object[]>} List of transactions.
 */
export async function getTransactions({startBlock, endBlock, pool, page=1, offset=100}) {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: "account",
        action: "tokentx",
        address: getContractAddress(pool),
        page,
        offset,
        startblock: startBlock,
        endblock: endBlock,
        sort: "desc",
        apikey: getEtherscanApiKey(),
      }
    });

    return response.data.result.map(transaction => {
      return {
        blockNumber: transaction.blockNumber,
        timestamp: transaction.timeStamp,
        hash: transaction.hash,
        ethFee: getEthFromGas(transaction.gasUsed, transaction.gasPrice),
      };
    });

  } catch (error) {
    handleAxiosError(error, 'Error querying transaction from Etherscan API');
  }
}
