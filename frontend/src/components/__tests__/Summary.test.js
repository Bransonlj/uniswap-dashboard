import { render, screen, waitFor, cleanup } from '@testing-library/react';
import Summary from '../Summary';
import { getPrice } from '../../services/transactionService';
import '@testing-library/jest-dom';

// mock functions
jest.mock('../../services/transactionService');
jest.mock('../LoadingBlock', () => () => <div>Loading</div>);
jest.mock('../ErrorBlock', () => ({ message }) => <div>{message}</div>);

describe('Summary Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('displays the loading message initially', () => {
    render(<Summary />);
    
    // Assert that the LoadingBlock is shown initially
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('displays the price when fetched successfully', async () => {
    // Mock a successful response
    getPrice.mockResolvedValue('2500');

    render(<Summary />);

    // Wait for the price to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('2500')).toBeInTheDocument();
    });
  });

  it('displays an error message when fetching price fails', async () => {
    // Mock a failed response
    const mockErrorMessage = 'Failed to fetch price';
    getPrice.mockRejectedValue(new Error(mockErrorMessage));

    render(<Summary />);

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(mockErrorMessage)).toBeInTheDocument();
    });
  });
});
