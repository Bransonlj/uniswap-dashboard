import axios from 'axios';
import { handleAxiosError } from '../utils/axiosUtils.js';

export const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

/**
 * Fetches the price of ETH in USDT at a specific timestamp from the Binance API.
 *
 * @param {number} timestamp - The timestamp in seconds to get the price.
 * @returns {Promise<number>} - The price of ETH in USDT at the given timestamp.
 */
export async function getPriceAtTimestamp({ timestamp, symbol }) {

  try {
    const response = await axios.get(BINANCE_API_URL, {
      params: {
        symbol,
        interval: '1s',
        startTime: timestamp * 1000, // convert to miliseconds
        endTime: timestamp * 1000,
      }
    });

    return parseFloat(response.data[0][1]) // get openPrice of 1st interval
  } catch (error) {
    handleAxiosError(error, 'Error querying price from Binance API');
  }
}