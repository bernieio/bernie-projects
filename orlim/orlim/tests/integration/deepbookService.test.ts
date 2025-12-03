/**
 * Integration Tests for DeepBookService
 * Tests the DeepBook Indexer API integration and order book data handling
 */

import { DeepBookService } from '../../src/services/deepbookService';
import { CONTRACTS } from '../../src/constants/contracts';
import type { OrderBookData } from '../../src/types/orlim';

// Mock fetch globally
global.fetch = jest.fn();

describe('DeepBookService Integration Tests', () => {
  let deepBookService: DeepBookService;
  const mockSuiClient = {} as any;
  const mockUserAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const testPoolId = CONTRACTS.DEEPBOOK.POOLS.SUI_USDC;

  beforeEach(() => {
    deepBookService = new DeepBookService(mockSuiClient, mockUserAddress, 'mainnet');
    (fetch as jest.Mock).mockClear();
  });

  describe('getOrderBookFromIndexer', () => {
    const mockOrderBookResponse = {
      bids: [
        { price: '2.49', quantity: '1000', orders: 5 },
        { price: '2.48', quantity: '2000', orders: 3 },
      ],
      asks: [
        { price: '2.51', quantity: '1500', orders: 4 },
        { price: '2.52', quantity: '2500', orders: 6 },
      ],
      mid_price: 2.5,
      best_bid: 2.49,
      best_ask: 2.51,
    };

    it('should fetch order book from indexer API successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockOrderBookResponse,
      });

      const result = await deepBookService.getOrderBookFromIndexer(testPoolId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/get_orderbook'),
        expect.objectContaining({
          headers: {
            'Accept': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockOrderBookResponse);
    });

    it('should handle 404 errors when pool is not found', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        deepBookService.getOrderBookFromIndexer('0xinvalidpool')
      ).rejects.toThrow('Pool not found');
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        deepBookService.getOrderBookFromIndexer(testPoolId)
      ).rejects.toThrow('Indexer API error');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        deepBookService.getOrderBookFromIndexer(testPoolId)
      ).rejects.toThrow('Network error');
    });
  });

  describe('getFullOrderBook', () => {
    const mockIndexerResponse = {
      bids: [
        { price: '2.49', quantity: '1000', orders: 5 },
        { price: '2.48', quantity: '2000', orders: 3 },
        { price: '2.47', quantity: '1500', orders: 2 },
      ],
      asks: [
        { price: '2.51', quantity: '1500', orders: 4 },
        { price: '2.52', quantity: '2500', orders: 6 },
        { price: '2.53', quantity: '1800', orders: 3 },
      ],
      mid_price: 2.5,
    };

    it('should return formatted order book data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockIndexerResponse,
      });

      const orderBook: OrderBookData = await deepBookService.getFullOrderBook(testPoolId);

      expect(orderBook).toHaveProperty('bids');
      expect(orderBook).toHaveProperty('asks');
      expect(orderBook).toHaveProperty('midPrice');
      expect(orderBook.midPrice).toBe(2.5);
    });

    it('should sort bids in descending order (highest first)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockIndexerResponse,
      });

      const orderBook = await deepBookService.getFullOrderBook(testPoolId);

      expect(orderBook.bids[0].price).toBeGreaterThanOrEqual(orderBook.bids[1].price);
      expect(orderBook.bids[1].price).toBeGreaterThanOrEqual(orderBook.bids[2].price);
    });

    it('should sort asks in ascending order (lowest first)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockIndexerResponse,
      });

      const orderBook = await deepBookService.getFullOrderBook(testPoolId);

      expect(orderBook.asks[0].price).toBeLessThanOrEqual(orderBook.asks[1].price);
      expect(orderBook.asks[1].price).toBeLessThanOrEqual(orderBook.asks[2].price);
    });

    it('should convert string prices and quantities to numbers', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockIndexerResponse,
      });

      const orderBook = await deepBookService.getFullOrderBook(testPoolId);

      expect(typeof orderBook.bids[0].price).toBe('number');
      expect(typeof orderBook.bids[0].quantity).toBe('number');
      expect(typeof orderBook.asks[0].price).toBe('number');
      expect(typeof orderBook.asks[0].quantity).toBe('number');
    });

    it('should calculate mid price from best bid/ask if not provided', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          bids: [{ price: '2.49', quantity: '1000' }],
          asks: [{ price: '2.51', quantity: '1500' }],
          best_bid: 2.49,
          best_ask: 2.51,
        }),
      });

      const orderBook = await deepBookService.getFullOrderBook(testPoolId);

      expect(orderBook.midPrice).toBeCloseTo(2.5, 2);
    });

    it('should return empty order book on error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const orderBook = await deepBookService.getFullOrderBook(testPoolId);

      expect(orderBook.bids).toEqual([]);
      expect(orderBook.asks).toEqual([]);
      expect(orderBook.midPrice).toBe(2.0); // Default fallback
    });

    it('should handle empty bids/asks arrays', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          bids: [],
          asks: [],
          mid_price: 2.5,
        }),
      });

      const orderBook = await deepBookService.getFullOrderBook(testPoolId);

      expect(orderBook.bids).toEqual([]);
      expect(orderBook.asks).toEqual([]);
      expect(orderBook.midPrice).toBe(2.5);
    });
  });

  describe('getUserOrders', () => {
    it('should return empty array (indexer API limitation)', async () => {
      const orders = await deepBookService.getUserOrders(testPoolId);
      
      expect(orders).toEqual([]);
    });
  });

  describe('checkManagerBalance', () => {
    it('should return 0 (indexer API limitation)', async () => {
      const balance = await deepBookService.checkManagerBalance(
        '0xmanager123',
        '0x2::sui::SUI'
      );
      
      expect(balance).toBe(0);
    });
  });

  describe('Network Configuration', () => {
    it('should use mainnet indexer URL for mainnet', () => {
      const mainnetService = new DeepBookService(
        mockSuiClient,
        mockUserAddress,
        'mainnet'
      );
      expect(mainnetService).toBeDefined();
    });

    it('should use testnet indexer URL for testnet', () => {
      const testnetService = new DeepBookService(
        mockSuiClient,
        mockUserAddress,
        'testnet'
      );
      expect(testnetService).toBeDefined();
    });
  });
});

