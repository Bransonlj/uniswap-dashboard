import React, { useState } from 'react'
import QueryForm from './components/QueryForm'
import TransactionList from './components/TransactionList'
import Summary from './components/Summary';

export default function App() {

  const [transactions, setTransactions] = useState([]);

  return (
    <div className='flex justify-center'>
      <div className='flex flex-col items-center max-w-5xl'>
        <div className='flex flex-row justify-center'>
          <QueryForm setTransactions={setTransactions}></QueryForm>
          <Summary></Summary>
        </div>
        <TransactionList transactions={transactions}></TransactionList>
      </div>
    </div>
  )
}
