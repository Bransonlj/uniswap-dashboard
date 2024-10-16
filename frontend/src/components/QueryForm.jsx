import React, { useState } from 'react'
import { getTransactions } from '../services/transactionService';

const defaultPool = 'WETH-USDC';

export default function QueryForm({ setTransactions }) {

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offset, setOffset] = useState(50);
  const [page, setPage] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    try {
      setError('');
      setIsLoading(true);
      const transactions = await getTransactions({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        pool: defaultPool,
        page,
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
      <label for="start">Start date:</label>
      <input type="datetime-local" id="start" name="search-start" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <label for="end">End date:</label>
      <input type="datetime-local" id="end" name="search-end" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={handleSearch} disabled={isLoading} >Search</button>
      <select value={offset} onChange={(e) => setOffset(e.target.value)}>
        <option value="50">50</option>
        <option value="75">75</option>
        <option value="100">100</option>
      </select>
      { error && <span>{error}</span>}
    </div>
  )
}
