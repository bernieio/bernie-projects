/**
 * Integration Tests for Order Workflows
 * Tests complete order lifecycle: create, modify, cancel
 */

import { ContractService } from '../../src/services/contractService';
import { DeepBookService } from '../../src/services/deepbookService';
import { SuiService } from '../../src/services/suiService';
import { CONTRACTS } from '../../src/constants/contracts';
import { Transaction } from '@mysten/sui/transactions';

// Mock dependencies
global.fetch = jest.fn();

describe('Order Workflows Integration Tests', () => {
  let contractService: ContractService;
  let deepBookService: DeepBookService;
  let suiService: SuiService;
  let mockSuiClient: any;

  const mockOrderManagerId = '0x1234567890abcdef1234567890abcdef12345678';
  const mockUserAddress = '0xuser1234567890abcdef1234567890abcdef1234';
  const testPoolId = CONTRACTS.DEEPBOOK.POOLS.SUI_USDC;
  const clockObjectId = '0x6';

  beforeEach(() => {
    contractService = new ContractService();
    mockSuiClient = {
      getObject: jest.fn(),
      getOwnedObjects: jest.fn(),
      signAndExecuteTransaction: jest.fn(),
    };
    suiService = new SuiService(mockSuiClient);
    deepBookService = new DeepBookService(mockSuiClient, mockUserAddress, 'mainnet');
    (fetch as jest.Mock).mockClear();
  });

  describe('Complete Order Lifecycle', () => {
    it('should create order manager, place order, and cancel order', () => {
      // Step 1: Create Order Manager
      const createManagerTx = contractService.createOrderManagerTx(clockObjectId);
      expect(createManagerTx).toBeInstanceOf(Transaction);

      // Step 2: Place Limit Order
      const placeOrderTx = contractService.placeOrderTx({
        orderManager: mockOrderManagerId,
        poolId: testPoolId,
        price: 2.5,
        quantity: 1000000000, // 1 SUI
        isBid: true,
        clockObjectId,
      });
      expect(placeOrderTx).toBeInstanceOf(Transaction);

      // Step 3: Cancel Order
      const cancelOrderTx = contractService.cancelOrderTx({
        orderManager: mockOrderManagerId,
        orderId: '1234567890',
        clockObjectId,
      });
      expect(cancelOrderTx).toBeInstanceOf(Transaction);
    });

    it('should handle order modification workflow', () => {
      // Place order
      const placeOrderTx = contractService.placeOrderTx({
        orderManager: mockOrderManagerId,
        poolId: testPoolId,
        price: 2.5,
        quantity: 1000000000,
        isBid: true,
        clockObjectId,
      });
      expect(placeOrderTx).toBeDefined();

      // Modify order
      const modifyOrderTx = contractService.modifyOrderTx({
        orderManager: mockOrderManagerId,
        orderId: '1234567890',
        newPrice: 2.7,
        newQuantity: 2000000000,
        clockObjectId,
      });
      expect(modifyOrderTx).toBeInstanceOf(Transaction);
    });

    it('should handle batch cancel workflow', () => {
      // Place multiple orders
      const orderIds = ['1', '2', '3', '4', '5'];
      
      orderIds.forEach(() => {
        const tx = contractService.placeOrderTx({
          orderManager: mockOrderManagerId,
          poolId: testPoolId,
          price: 2.5,
          quantity: 1000000000,
          isBid: true,
          clockObjectId,
        });
        expect(tx).toBeDefined();
      });

      // Batch cancel all orders
      const batchCancelTx = contractService.batchCancelOrdersTx({
        orderManager: mockOrderManagerId,
        orderIds,
        clockObjectId,
      });
      expect(batchCancelTx).toBeInstanceOf(Transaction);
    });
  });

  describe('OCO Order Workflow', () => {
    it('should create OCO order with take profit and stop loss', () => {
      const ocoTx = contractService.placeOCOOrderTx({
        orderManager: mockOrderManagerId,
        poolId: testPoolId,
        order1Price: 2.6, // Take profit
        order1Quantity: 1000000000,
        order1IsBid: true,
        order2Price: 2.4, // Stop loss
        order2Quantity: 1000000000,
        order2IsBid: false,
        clockObjectId,
      });

      expect(ocoTx).toBeInstanceOf(Transaction);
    });
  });

  describe('TIF Order Workflow', () => {
    it('should create IOC (Immediate-or-Cancel) order', () => {
      const iocTx = contractService.placeTIFOrderTx({
        orderManager: mockOrderManagerId,
        poolId: testPoolId,
        price: 2.5,
        quantity: 1000000000,
        isBid: true,
        tifType: 'IOC',
        baseCoin: '0xbasecoin123',
        quoteCoin: '0xquotecoin123',
        clockObjectId,
      });

      expect(iocTx).toBeInstanceOf(Transaction);
    });

    it('should create FOK (Fill-or-Kill) order', () => {
      const fokTx = contractService.placeTIFOrderTx({
        orderManager: mockOrderManagerId,
        poolId: testPoolId,
        price: 2.5,
        quantity: 1000000000,
        isBid: true,
        tifType: 'FOK',
        baseCoin: '0xbasecoin123',
        quoteCoin: '0xquotecoin123',
        clockObjectId,
      });

      expect(fokTx).toBeInstanceOf(Transaction);
    });
  });

  describe('Order Receipt Workflow', () => {
    it('should create order receipt and cancel by receipt', () => {
      // Place order
      const placeOrderTx = contractService.placeOrderTx({
        orderManager: mockOrderManagerId,
        poolId: testPoolId,
        price: 2.5,
        quantity: 1000000000,
        isBid: true,
        clockObjectId,
      });
      expect(placeOrderTx).toBeDefined();

      // Create order receipt
      const createReceiptTx = contractService.createOrderReceiptTx({
        orderManager: mockOrderManagerId,
        orderId: '1234567890',
      });
      expect(createReceiptTx).toBeInstanceOf(Transaction);

      // Cancel by receipt
      const cancelByReceiptTx = contractService.cancelOrderByReceiptTx({
        orderManager: mockOrderManagerId,
        orderReceiptId: '0xreceipt123',
        clockObjectId,
      });
      expect(cancelByReceiptTx).toBeInstanceOf(Transaction);
    });
  });

  describe('Order Book Integration', () => {
    it('should fetch order book and place order at market price', async () => {
      const mockOrderBook = {
        bids: [
          { price: '2.49', quantity: '1000', orders: 5 },
          { price: '2.48', quantity: '2000', orders: 3 },
        ],
        asks: [
          { price: '2.51', quantity: '1500', orders: 4 },
          { price: '2.52', quantity: '2500', orders: 6 },
        ],
        mid_price: 2.5,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockOrderBook,
      });

      // Fetch order book
      const orderBook = await deepBookService.getFullOrderBook(testPoolId);
      expect(orderBook.midPrice).toBe(2.5);
      expect(orderBook.bids.length).toBeGreaterThan(0);
      expect(orderBook.asks.length).toBeGreaterThan(0);

      // Place order at market price (mid price)
      const marketOrderTx = contractService.placeOrderTx({
        orderManager: mockOrderManagerId,
        poolId: testPoolId,
        price: orderBook.midPrice,
        quantity: 1000000000,
        isBid: true,
        clockObjectId,
      });
      expect(marketOrderTx).toBeInstanceOf(Transaction);
    });
  });

  describe('Multiple Trading Pairs', () => {
    it('should handle orders for different pools', () => {
      const pools = [
        CONTRACTS.DEEPBOOK.POOLS.SUI_USDC,
        CONTRACTS.DEEPBOOK.POOLS.DEEP_SUI,
      ];

      pools.forEach((poolId) => {
        const tx = contractService.placeOrderTx({
          orderManager: mockOrderManagerId,
          poolId,
          price: 2.5,
          quantity: 1000000000,
          isBid: true,
          clockObjectId,
        });
        expect(tx).toBeInstanceOf(Transaction);
      });
    });
  });

  describe('Error Handling in Workflows', () => {
    it('should handle invalid pool ID gracefully', () => {
      expect(() => {
        contractService.placeOrderTx({
          orderManager: mockOrderManagerId,
          poolId: 'invalid-pool-id',
          price: 2.5,
          quantity: 1000000000,
          isBid: true,
          clockObjectId,
        });
      }).not.toThrow(); // Service should handle invalid pool ID format
    });

    it('should handle order book fetch failure gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const orderBook = await deepBookService.getFullOrderBook(testPoolId);
      
      // Should return empty order book instead of throwing
      expect(orderBook.bids).toEqual([]);
      expect(orderBook.asks).toEqual([]);
    });
  });
});

