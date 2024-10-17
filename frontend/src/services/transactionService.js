import axios from 'axios';

export const transactionServiceUrl = 'http://localhost:5000/api/transactions';

/**
 * Fetches a list of historical transaction data from the specified pool 
 * between the specified start and end dates with the specified pagination options.
 * 
 * @param {Date} param.startDate - Starting date to fetch data from.
 * @param {Date} param.endDate - Ending date to fetch data till.
 * @param {string} param.pool - Pool to fetch transaction data from.
 * @param {number} param.page - Page number.
 * @param {number} param.offset - Offset, number of entries per page.
 * @returns {Object[]} List of transactions.
 */
export async function getTransactions({ startDate, endDate, pool, page, offset }) {
  try {
    const response = await axios.get(transactionServiceUrl, {
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
 * Fetches a list of live transaction data from the specified pool with the specified pagination options.
 * 
 * @param {string} param.pool - Pool to fetch transaction data from.
 * @param {number} param.page - Page number.
 * @param {number} param.offset - Offset, number of entries per page.
 * @returns {Object[]} List of transactions.
 */
export async function getLiveTransactions({ pool, page, offset }) {
  try {
    const response = await axios.get(`${transactionServiceUrl}/live`, {
      params: {
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
 * Fetches the price of the specified cryptocurrency at the specified time.
 * 
 * @param {Date} param.time - Date object representing the time to fetch price at.
 * @param {string} param.symbol - Symbol of the cryptocurrency.
 * @returns {number} Price.
 */
export async function getPrice({ time, symbol }) {
  try {
    const response = await axios.get(`${transactionServiceUrl}/price`, {
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