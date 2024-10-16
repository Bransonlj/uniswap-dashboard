/**
 * Handles errors from Axios requests and formats an error message.
 *
 * @param {Object} error - The error object returned by Axios.
 * @param {string} prefix - A string to prefix the error message.
 * @throws {Error} Throws a new Error with a formatted error message.
 */
export function handleAxiosError(error, prefix='Axios Error') {
  let message;
  if (error.response) {
    message = `${prefix} - ${error.message} ${error.response.data.msg}`;
  } else {
    // Handle non-Axios errors (e.g., network errors)
    message = `${prefix} - Network or unknown error: ${error.message}`
  }

  throw new Error(message);
}