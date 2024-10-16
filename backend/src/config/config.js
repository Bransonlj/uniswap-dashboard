/**
 * Retrieves the Etherscan API key from environment variables.
 * 
 * @returns {string} The Etherscan API key.
 * @throws {Error} If the API key is not in the environment variables.
 */
export function getEtherscanApiKey() {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    throw new Error('environment does not contain variable: "ETHERSCAN_API_KEY"');
  }
  return apiKey;
}
