import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import QueryForm, { defaultOffset, defaultPage, defaultPool } from '../QueryForm';
import { getLiveTransactions, getTransactions } from '../../services/transactionService';
import '@testing-library/jest-dom';

// mock functions
jest.mock('../../services/transactionService', () => ({
  getLiveTransactions: jest.fn(),
  getTransactions: jest.fn(),
}));
jest.mock('../ErrorBlock', () => ({ message }) => <div>{message}</div>);

const mockLiveTransactions = [
  { blockNumber: 1, timestamp: 1728808129, hash: 'hash1', ethFee: 0.01, usdtFee: 1.0, pool: 'pool1' },
  { blockNumber: 2, timestamp: 1728808130, hash: 'hash2', ethFee: 0.02, usdtFee: 2.0, pool: 'pool2' },
];

const mockHistoricalTransactions = [
  { blockNumber: 10, timestamp: 1728808131, hash: 'hash3', ethFee: 0.03, usdtFee: 3.0, pool: 'pool3' },
  { blockNumber: 11, timestamp: 1728808132, hash: 'hash4', ethFee: 0.04, usdtFee: 4.0, pool: 'pool4' },
];


describe('QueryForm Component', () => {
  const setTransactionsMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('fetches live transaction data initially upon render', async () => {
    getLiveTransactions.mockResolvedValue(mockLiveTransactions);

    render(<QueryForm setTransactions={setTransactionsMock} />);

    await waitFor(() => expect(getLiveTransactions).toHaveBeenCalledTimes(1));
    expect(getTransactions).not.toHaveBeenCalled();
    expect(setTransactionsMock).toHaveBeenCalledWith(mockLiveTransactions);
  });

  it('fetches historical transactions upon search', async () => {
    const dummyStartDate = '2020-10-10T00:00';
    const dummyEndDate = '2020-10-11T00:00';
    getTransactions.mockResolvedValue(mockHistoricalTransactions);

    render(<QueryForm setTransactions={setTransactionsMock} />);

    // Wait for the live transactions to be fetched first
    await waitFor(() => expect(getTransactions).not.toHaveBeenCalled);

    // Simulate entering a date range and clicking Search
    fireEvent.change(screen.getByLabelText('Start date:'), { target: { value: dummyStartDate } });
    fireEvent.change(screen.getByLabelText('End date:'), { target: { value: dummyEndDate } });
    fireEvent.click(screen.getByText('Search'));

    // Wait for the  historical transactions to be fetched
    await waitFor(() => expect(getTransactions).toHaveBeenCalledTimes(1));
    expect(getTransactions).toHaveBeenCalledWith({
      startDate: new Date(dummyStartDate), // convert dates to expected format
      endDate: new Date(dummyEndDate), 
      pool: defaultPool, 
      page: defaultPage, 
      offset: defaultOffset,
    });

    // Verify setTransactions is called with the historical mock data
    expect(setTransactionsMock).toHaveBeenCalledWith(mockHistoricalTransactions);
  });

  it('displays error when fetching transactions fails', async () => {
    const mockErrorMessage = 'Failed to fetch transactions';
    getLiveTransactions.mockRejectedValue(new Error(mockErrorMessage));

    render(<QueryForm setTransactions={setTransactionsMock} />);

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(mockErrorMessage)).toBeInTheDocument();
    });
  });
});
