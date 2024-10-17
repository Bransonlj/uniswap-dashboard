import { render, screen } from '@testing-library/react';
import TransactionList from '../TransactionList';
import '@testing-library/jest-dom';

// mock transaction data
const mockTransactions = [
  { blockNumber: 10123, timestamp: 1728808129, hash: 'hash1', ethFee: 0.01, usdtFee: 123.0, pool: 'pool1' },
  { blockNumber: 20123, timestamp: 1728808130, hash: 'hash2', ethFee: 0.02, usdtFee: 456.0, pool: 'pool2' },
];

describe('TransactionList Component', () => {
  it('renders the transactions table correctly', () => {
    // Render the TransactionList component with the mock transactions
    render(<TransactionList transactions={mockTransactions} />);

    // Check that the table headers are rendered correctly
    expect(screen.getByText('Index')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Fee - USDT')).toBeInTheDocument();
    expect(screen.getByText('Fee - ETH')).toBeInTheDocument();
    expect(screen.getByText('Hash')).toBeInTheDocument();
    expect(screen.getByText('Block')).toBeInTheDocument();

    // Check that the correct number of rows is rendered
    expect(screen.getAllByRole('row')).toHaveLength(mockTransactions.length + 1); // +1 for the header row

    // Check that the transaction data rows are rendered correctly
    mockTransactions.forEach((transaction) => {
      expect(screen.getByText(new Date(transaction.timestamp * 1000).toLocaleString('en-SG'))).toBeInTheDocument();
      expect(screen.getByText(transaction.usdtFee)).toBeInTheDocument();
      expect(screen.getByText(transaction.ethFee)).toBeInTheDocument();
      expect(screen.getByText(transaction.hash)).toBeInTheDocument();
      expect(screen.getByText(transaction.blockNumber)).toBeInTheDocument();
    });
  });

  it('renders an empty table when transactions is empty', () => {
    // Render the component with an empty transactions array
    render(<TransactionList transactions={[]} />);

    // Check that the table is still rendered with the header row
    expect(screen.getByText('Index')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Fee - USDT')).toBeInTheDocument();
    expect(screen.getByText('Fee - ETH')).toBeInTheDocument();
    expect(screen.getByText('Hash')).toBeInTheDocument();
    expect(screen.getByText('Block')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(1); // only header row 
  });
});
