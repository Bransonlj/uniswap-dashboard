import React from 'react'

export default function TransactionList({ transactions }) {
  return (
    <div>
       <table>
        <thead>
          <tr>
            <th>Index</th>
            <th>Time</th>
            <th>Fee - USDT</th>
            <th>Fee - ETH</th>
            <th>Hash</th>
            <th>Block</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{new Date(transaction.timestamp * 1000).toISOString()}</td>
              <td>{transaction.usdtFee}</td>
              <td>{transaction.ethFee}</td>
              <td>{transaction.hash}</td>
              <td>{transaction.blockNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
