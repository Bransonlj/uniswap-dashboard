import axios from "axios";
import { BINANCE_API_URL, getPriceAtTimestamp } from "../binance.service";

// mock functions
jest.mock('axios');
const dummySymbol = 'TEST-USD';
const dummyTimeStamp = 1728808129;
const mockOpenPriceStr = "9640.7";
const mockResponse = [
    [
      1591258320000,      	// Open time
      mockOpenPriceStr,       	 	// Open
      "9642.4",       	 	// High
      "9640.6",       	 	// Low
      "9642.0",      	 	 	// Close (or latest price)
      "206", 			 		// Volume
      1591258379999,       	// Close time
      "2.13660389",    		// Base asset volume
      48,             		// Number of trades
      "119",    				// Taker buy volume
      "1.23424865",      		// Taker buy base asset volume
      "0" 					// Ignore.
    ]
]

describe('Binance API Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getPriceAtTimestamp', () => {
        it('returns the price as a float when API is called successfully', async () => {
            axios.get.mockResolvedValue({
              data: mockResponse,
            });
      
            const price = await getPriceAtTimestamp({ timestamp: dummyTimeStamp, symbol: dummySymbol });
        
            // Verify that the correct price is returned
            expect(price).toBe(parseFloat(mockOpenPriceStr));
        
            // Verify axios.get was called with the correct params
            expect(axios.get).toHaveBeenCalledWith(BINANCE_API_URL, {
              params: {
                symbol: dummySymbol,
                interval: '1s',
                startTime: dummyTimeStamp * 1000,
                endTime: dummyTimeStamp * 1000,
              }
            });
        });

        it('throws an error when API call fails', async () => {
            axios.get.mockRejectedValue(new Error('Error'));
      
            await expect(getPriceAtTimestamp({ timestamp: dummyTimeStamp, symbol: dummySymbol })).rejects.toThrow(
              'Error querying price from Binance API - Network or unknown error: Error'
            );
        });
    });
});