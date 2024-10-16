/**
 * Calculates the transaction fee in Ether based on gas used and gas price.
 * 
 * @param {number} gasUsed - The amount of gas used.
 * @param {number} gasPrice - The price of gas.
 * @returns {number} The transaction fee in Ether.
 */
export function getEthFromGas(gasUsed, gasPrice) {
  return (gasUsed * gasPrice) / 1e18;
}