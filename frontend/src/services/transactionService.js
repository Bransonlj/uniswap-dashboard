import axios from 'axios';

const apiUrl = 'http://localhost:5000/api/transactions'

export async function getTransactions({ startDate, endDate, pool, page, offset }) {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        start: Math.floor(startDate.getTime() / 1000), // convert to unix seconds
        end: Math.floor(endDate.getTime() / 1000),
        pool,
        page,
        offset,
      }
    });

    return response.data.result; 
  } catch (error) {
    let message;
    if (error.response) {
      message = `${error.message} ${error.response.data.message}`;
    } else {
      // Handle non-Axios errors (e.g., network errors)
      message = `Network or unknown error: ${error.message}`
    }
  
    throw new Error(message);
  }
}

/**
 * Fetches the price of the specified cryptocurrency at the specified time
 * @param {Date} param.time - Date object representing the time to fetch price at.
 * @param {string} param.symbol - Symbol of the cryptocurrency.
 * @returns {number} Price.
 */
export async function getPrice({ time, symbol }) {
  try {
    const response = await axios.get(`${apiUrl}/price`, {
      params: {
        time: Math.floor(time.getTime() / 1000) - 1, // convert to unix seconds, 1 second behind so API can keep up
        symbol,
      }
    });

    return response.data.result.price; 
  } catch (error) {
    let message;
    if (error.response) {
      message = `${error.message} ${error.response.data.message}`;
    } else {
      // Handle non-Axios errors (e.g., network errors)
      message = `Network or unknown error: ${error.message}`
    }
  
    throw new Error(message);
  }
}