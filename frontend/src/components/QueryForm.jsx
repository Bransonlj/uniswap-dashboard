import React, { useEffect, useState } from 'react'
import { getLiveTransactions, getTransactions } from '../services/transactionService';
import ErrorBlock from './ErrorBlock';
import LoadingBlock from './LoadingBlock';

const defaultPool = 'WETH-USDC';
const defaultPage = 1;
const buttonStyle = 'bg-indigo-600 border-2 px-2 py-1 rounded-lg border-indigo-600 text-white hover:bg-indigo-400 disabled:bg-gray-200 disabled:border-gray-300';
export default function QueryForm({ setTransactions }) {

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offset, setOffset] = useState(50);
  const [page, setPage] = useState(defaultPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLiveState, setIsLiveState] = useState(true);

  async function handleFetch() {
    setError('');
    setIsLoading(true);
    setTransactions([]);
    try {
      let transactions
      if (isLiveState) {
        transactions = await getLiveTransactions({
          pool: defaultPool,
          page,
          offset,
        })
      } else {
        transactions = await getTransactions({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          pool: defaultPool,
          page,
          offset,
        });
      }

      setTransactions(transactions);
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  function handleSearch() {
    if (!isLiveState && page === defaultPage) {
      // wont trigger useffect hook, manually refresh
      handleFetch();
    } else {
      setPage(defaultPage);
      setIsLiveState(false);
    }
  }

  function clearFilter() {
    setPage(defaultPage);
    setIsLiveState(true);
  }

  useEffect(() => {
    handleFetch();
  }, [isLiveState, page, offset]);

  return (
    <div>
      <div className='border-indigo-500 border-2 rounded-xl p-4 flex flex-row items-center gap-2'>
        <label className='font-semibold'>Start date:</label>
        <input className='border-gray-300 border-2 rounded-md' 
          type="datetime-local" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <label className='font-semibold'>End date:</label>
        <input className='border-gray-300 border-2 rounded-md' 
          type="datetime-local" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />

        <button className={buttonStyle} onClick={handleSearch} disabled={isLoading} >Search</button>
        { isLiveState 
          ? <button className={buttonStyle} 
              onClick={handleFetch}
            >Refresh</button> 
          : <button className={buttonStyle} 
              onClick={clearFilter}
            >Clear Filter</button>
        }
      </div>
      <div className='border-indigo-500 border-2 rounded-xl flex flex-row justify-end items-center gap-4 p-4'>
        { error && <ErrorBlock message={error}></ErrorBlock> }
        { isLoading && <LoadingBlock></LoadingBlock> }
        <select className='p-2 border-2 rounded-lg border-gray-400 bg-gray-100' value={offset} onChange={(e) => setOffset(e.target.value)}>
          <option value="50">50</option>
          <option value="75">75</option>
          <option value="100">100</option>
        </select>
        <button className={buttonStyle}  disabled={page == 1} onClick={() => setPage(page - 1)}>back</button>
        <span className='font-semibold'>Page {page}</span>
        <button className={buttonStyle}  onClick={() => setPage(page + 1)}>next</button>
      </div>
    </div>
  )
}
