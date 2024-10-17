import React from 'react'

export default function TransactionList({ transactions }) {
  return (
    <div className='p-4 bg-indigo-500 border-2 border-indigo-700 rounded-xl w-full'>
       <table className='table-fixed border-collapse w-full'>
        <thead>
          <tr className='text-white'>
            <th className='w-1/12'>Index</th>
            <th className='w-3/12'>Time</th>
            <th className='w-2/12'>Fee - USDT</th>
            <th className='w-2/12'>Fee - ETH</th>
            <th className='w-2/12'>Hash</th>
            <th className='w-2/12'>Block</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr className='bg-white border-indigo-500 border-2' key={index}>
              <td className='text-center p-2 bg-indigo-100 font-semibold'>{index + 1}</td>
              <td className='text-center p-2 '>{new Date(transaction.timestamp * 1000).toLocaleString('en-SG')}</td>
              <td className='text-center p-2 bg-indigo-100 font-semibold'>{transaction.usdtFee}</td>
              <td className='text-center p-2 font-semibold'>{transaction.ethFee}</td>
              <td className='text-center p-2 bg-indigo-100'>{transaction.hash}</td>
              <td className='text-center p-2'>{transaction.blockNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
