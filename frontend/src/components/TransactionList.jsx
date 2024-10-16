import React from 'react'

export default function TransactionList({ transactions }) {
  return (
    <div>
      {transactions.map(transaction => (
        <div>{new Date(transaction.timestamp * 1000).toISOString()}</div>
      ))}
    </div>
  )
}
