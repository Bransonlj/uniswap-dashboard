import React, { useEffect, useState } from 'react'
import { getPrice } from '../services/transactionService';

const defaultSymbol = 'ETHUSDT';

export default function Summary() {

  const [price, setPrice] = useState();
  const [error, setError] = useState('');

  async function fetchPrice() {
    try {
      setError('');
      const price = await getPrice({
        time: new Date(),
        symbol: defaultSymbol,
      });
      setPrice(price);
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    fetchPrice();
  }, [])

  return (
    <div>
      { error && <h2>{error}</h2> }
      { !error && <h2>ETH-USDT: {price}</h2> }
      </div>
  )
}
