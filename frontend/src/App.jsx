import React, { useState } from 'react'
import QueryForm from './components/QueryForm'
import TransactionList from './components/TransactionList'

export default function App() {

  const [transactions, setTransactions] = useState([]);

  return (
    <div>
      <QueryForm setTransactions={setTransactions}></QueryForm>
      <TransactionList transactions={transactions}></TransactionList>
    </div>
  )
}
