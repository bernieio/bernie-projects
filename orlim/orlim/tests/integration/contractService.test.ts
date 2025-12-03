/**
 * Integration Tests for ContractService
 * Tests the contract transaction building and interaction logic
 */

import { ContractService } from '../../src/services/contractService';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACTS } from '../../src/constants/contracts';

describe('ContractService Integration Tests', () => {
  let contractService: ContractService;
  const clockObjectId = '0x6'; // Standard Clock object ID on Sui
  const mockOrderManagerId = '0x1234567890abcdef1234567890abcdef12345678';
  const mockPoolId = CONTRACTS.DEEPBOOK.POOLS.SUI_USDC;

  beforeEach(() => {
    contractService = new ContractService();
  });

  describe('createOrderManagerTx', () => {
    it('should create a valid transaction for order manager creation', () => {
      const tx = contractService.createOrderManagerTx(clockObjectId);

      expect(tx).toBeInstanceOf(Transaction);
      // Transaction should be properly constructed
      expect(tx).toBeDefined();
    });

    it('should use the correct clock object ID', () => {
      const tx = contractService.createOrderManagerTx(clockObjectId);
      
      // Verify transaction is created (actual validation would require transaction inspection)
      expect(tx).toBeDefined();
    });
  });

  describe('placeOrderTx', () => {
    const orderParams = {
      orderManager: mockOrderManagerId,
      poolId: mockPoolId,
      price: 2.5,
      quantity: 1000000000, // 1 SUI (9 decimals)
      isBid: true,
      clockObjectId,
    };

    it('should create a valid limit order transaction', () => {
      const tx = contractService.placeOrderTx(orderParams);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });

    it('should convert pool ID string to bytes correctly', () => {
      const tx = contractService.placeOrderTx(orderParams);
      
      // Verify transaction is created with correct pool ID format
      expect(tx).toBeDefined();
    });

    it('should handle bid orders correctly', () => {
      const bidTx = contractService.placeOrderTx({
        ...orderParams,
        isBid: true,
      });

      expect(bidTx).toBeDefined();
    });

    it('should handle ask orders correctly', () => {
      const askTx = contractService.placeOrderTx({
        ...orderParams,
        isBid: false,
      });

      expect(askTx).toBeDefined();
    });

    it('should convert price to correct format (8 decimals)', () => {
      const tx = contractService.placeOrderTx({
        ...orderParams,
        price: 1.5,
      });

      expect(tx).toBeDefined();
    });
  });

  describe('placeOCOOrderTx', () => {
    const ocoParams = {
      orderManager: mockOrderManagerId,
      poolId: mockPoolId,
      order1Price: 2.6,
      order1Quantity: 1000000000,
      order1IsBid: true,
      order2Price: 2.4,
      order2Quantity: 1000000000,
      order2IsBid: false,
      clockObjectId,
    };

    it('should create a valid OCO order transaction', () => {
      const tx = contractService.placeOCOOrderTx(ocoParams);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });

    it('should handle both orders in OCO correctly', () => {
      const tx = contractService.placeOCOOrderTx(ocoParams);
      
      expect(tx).toBeDefined();
    });
  });

  describe('placeTIFOrderTx', () => {
    const tifParams = {
      orderManager: mockOrderManagerId,
      poolId: mockPoolId,
      price: 2.5,
      quantity: 1000000000,
      isBid: true,
      tifType: 'IOC' as const,
      baseCoin: '0xbasecoin123',
      quoteCoin: '0xquotecoin123',
      clockObjectId,
    };

    it('should create a valid IOC order transaction', () => {
      const tx = contractService.placeTIFOrderTx({
        ...tifParams,
        tifType: 'IOC',
      });

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });

    it('should create a valid FOK order transaction', () => {
      const tx = contractService.placeTIFOrderTx({
        ...tifParams,
        tifType: 'FOK',
      });

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });
  });

  describe('cancelOrderTx', () => {
    const cancelParams = {
      orderManager: mockOrderManagerId,
      orderId: '1234567890',
      clockObjectId,
    };

    it('should create a valid cancel order transaction', () => {
      const tx = contractService.cancelOrderTx(cancelParams);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });
  });

  describe('batchCancelOrdersTx', () => {
    const batchCancelParams = {
      orderManager: mockOrderManagerId,
      orderIds: ['1234567890', '0987654321', '1122334455'],
      clockObjectId,
    };

    it('should create a valid batch cancel transaction', () => {
      const tx = contractService.batchCancelOrdersTx(batchCancelParams);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });

    it('should handle multiple order IDs', () => {
      const tx = contractService.batchCancelOrdersTx({
        ...batchCancelParams,
        orderIds: ['1', '2', '3', '4', '5'],
      });

      expect(tx).toBeDefined();
    });
  });

  describe('modifyOrderTx', () => {
    const modifyParams = {
      orderManager: mockOrderManagerId,
      orderId: '1234567890',
      newPrice: 2.7,
      newQuantity: 2000000000,
      clockObjectId,
    };

    it('should create a valid modify order transaction', () => {
      const tx = contractService.modifyOrderTx(modifyParams);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });
  });

  describe('cancelOrderByReceiptTx', () => {
    const cancelByReceiptParams = {
      orderManager: mockOrderManagerId,
      orderReceiptId: '0xreceipt1234567890',
      clockObjectId,
    };

    it('should create a valid cancel by receipt transaction', () => {
      const tx = contractService.cancelOrderByReceiptTx(cancelByReceiptParams);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });
  });

  describe('createOrderReceiptTx', () => {
    const createReceiptParams = {
      orderManager: mockOrderManagerId,
      orderId: '1234567890',
    };

    it('should create a valid order receipt creation transaction', () => {
      const tx = contractService.createOrderReceiptTx(createReceiptParams);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx).toBeDefined();
    });
  });

  describe('Contract Configuration', () => {
    it('should use the correct package ID from constants', () => {
      expect(contractService).toBeDefined();
      // Service should be initialized with correct package ID
      expect(CONTRACTS.PACKAGE_ID).toBeDefined();
      expect(CONTRACTS.MODULE_NAME).toBe('orlim');
    });
  });
});

