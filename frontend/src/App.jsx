import React, { useState } from 'react'
import QueryForm from './components/QueryForm'
import TransactionList from './components/TransactionList'
import Summary from './components/Summary';

export default function App() {

  const [transactions, setTransactions] = useState([]);

  return (
    <div>
      <Summary></Summary>
      <QueryForm setTransactions={setTransactions}></QueryForm>
      <TransactionList transactions={transactions}></TransactionList>
    </div>
  )
}
