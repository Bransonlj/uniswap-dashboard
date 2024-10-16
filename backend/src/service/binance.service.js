import axios from 'axios';

export const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

export async function getEthUsdtPriceAtTimestamp(timestamp) {

  try {
    const response = await axios.get(BINANCE_API_URL, {
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