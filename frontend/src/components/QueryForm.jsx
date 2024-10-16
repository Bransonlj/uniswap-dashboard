import React, { useState } from 'react'
import { getTransactions } from '../services/transactionService';

const defaultPool = 'WETH-USDC';
const defaultPage = 1;
export default function QueryForm({ setTransactions }) {

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offset, setOffset] = useState(50);
  const [page, setPage] = useState(defaultPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(resetPage=true) {
    setError('');
    setIsLoading(true);
    setTransactions([]);
    const newPage = resetPage ? defaultPage : page;
    if (resetPage) {
      setPage(defaultPage);
    }
    try {
      const transactions = await getTransactions({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        pool: defaultPool,
        page: newPage,
        offset,
      });
      setTransactions(transactions);
    } catch (error) {
      setError(error.message);
    }

    setIsLoading(false);
  }

  return (
    <div>
      <div>
        <button disabled={page == 1} onClick={() => {setPage(page - 1); handleSearch(false);}}>back</button>
        <span>Page {page}</span>
        <button onClick={() => {setPage(page + 1); handleSearch(false);}}>next</button>
      </div>

      <label>Start date:</label>
      <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <label >End date:</label>
      <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={handleSearch} disabled={isLoading} >Search</button>
      <select value={offset} onChange={(e) => setOffset(e.target.value)}>
        <option value="50">50</option>
        <option value="75">75</option>
        <option value="100">100</option>
      </select>
      { error && <span>{error}</span> }
      { isLoading && <span>LOADING</span> }
    </div>
  )
}
