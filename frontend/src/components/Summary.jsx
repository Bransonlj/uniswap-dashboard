import React, { useEffect, useState } from 'react'
import { getPrice } from '../services/transactionService';
import ErrorBlock from './ErrorBlock';
import LoadingBlock from './LoadingBlock';

const defaultSymbol = 'ETHUSDT';

/**
 *Component handles fetching and displaying key summary information like live prices.
 */
export default function Summary() {

  const [price, setPrice] = useState();
  const [error, setError] = useState('');

  /**
   * handles fetching the price of a cryptocurrency and handles errors
   */
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
    <div className='grow flex flex-col justify-center items-center border-4 rounded-lg border-indigo-600 bg-indigo-500 p-4'>
      { !price && <LoadingBlock></LoadingBlock>}
      { error && <ErrorBlock message={error}></ErrorBlock> }
      { !error && price && <>
          <h2 className='font-semibold text-white'>ETH-USDT</h2>
          <h2 className='font-bold text-yellow-500'>{price}</h2>
        </> 
      }
    </div>
  )
}
