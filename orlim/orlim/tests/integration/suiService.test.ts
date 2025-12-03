/**
 * Integration Tests for SuiService
 * Tests Sui blockchain interactions and object queries
 */

import { SuiService } from '../../src/services/suiService';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Mock SuiClient
jest.mock('@mysten/sui/client', () => ({
  SuiClient: jest.fn(),
  getFullnodeUrl: jest.fn(),
}));

describe('SuiService Integration Tests', () => {
  let suiService: SuiService;
  let mockClient: jest.Mocked<SuiClient>;

  beforeEach(() => {
    // Create a mock SuiClient
    mockClient = {
      getObject: jest.fn(),
      getOwnedObjects: jest.fn(),
      signAndExecuteTransaction: jest.fn(),
    } as any;

    suiService = new SuiService(mockClient);
  });

  describe('getObject', () => {
    const mockObjectId = '0x1234567890abcdef1234567890abcdef12345678';
    const mockObjectResponse = {
      data: {
        objectId: mockObjectId,
        type: '0x2::coin::Coin<0x2::sui::SUI>',
        content: {
          dataType: 'moveObject',
          fields: {
            balance: '1000000000',
          },
        },
        owner: {
          AddressOwner: '0xowner123',
        },
      },
    };

    it('should fetch object by ID successfully', async () => {
      mockClient.getObject.mockResolvedValueOnce(mockObjectResponse as any);

      const result = await suiService.getObject(mockObjectId);

      expect(mockClient.getObject).toHaveBeenCalledWith({
        id: mockObjectId,
        options: {
          showContent: true,
          showOwner: true,
          showType: true,
        },
      });
      expect(result).toEqual(mockObjectResponse);
    });

    it('should handle object not found errors', async () => {
      mockClient.getObject.mockRejectedValueOnce(new Error('Object not found'));

      await expect(suiService.getObject(mockObjectId)).rejects.toThrow(
        'Object not found'
      );
    });
  });

  describe('getOwnedObjects', () => {
    const mockAddress = '0xowner1234567890abcdef1234567890abcdef12';
    const mockObjectsResponse = {
      data: [
        {
          data: {
            objectId: '0xobj1',
            type: '0xpackage::module::Type',
          },
        },
        {
          data: {
            objectId: '0xobj2',
            type: '0xpackage::module::Type',
          },
        },
      ],
      hasNextPage: false,
      nextCursor: null,
    };

    it('should fetch owned objects by address successfully', async () => {
      mockClient.getOwnedObjects.mockResolvedValueOnce(mockObjectsResponse as any);

      const result = await suiService.getOwnedObjects(mockAddress);

      expect(mockClient.getOwnedObjects).toHaveBeenCalledWith({
        owner: mockAddress,
        filter: undefined,
        options: {
          showContent: true,
          showType: true,
        },
      });
      expect(result).toEqual(mockObjectsResponse);
    });

    it('should filter objects by type when type is provided', async () => {
      const typeFilter = '0xpackage::module::OrderManager';
      mockClient.getOwnedObjects.mockResolvedValueOnce(mockObjectsResponse as any);

      await suiService.getOwnedObjects(mockAddress, typeFilter);

      expect(mockClient.getOwnedObjects).toHaveBeenCalledWith({
        owner: mockAddress,
        filter: {
          StructType: typeFilter,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });
    });

    it('should handle empty owned objects', async () => {
      const emptyResponse = {
        data: [],
        hasNextPage: false,
        nextCursor: null,
      };
      mockClient.getOwnedObjects.mockResolvedValueOnce(emptyResponse as any);

      const result = await suiService.getOwnedObjects(mockAddress);

      expect(result.data).toEqual([]);
    });
  });

  describe('executeTransaction', () => {
    const mockTransaction = {
      build: jest.fn(),
    } as any;
    const mockSigner = {
      sign: jest.fn(),
    } as any;
    const mockTransactionResponse = {
      digest: '0xtxdigest123',
      effects: {
        status: { status: 'success' },
      },
      objectChanges: [],
      events: [],
    };

    it('should execute transaction successfully', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValueOnce(
        mockTransactionResponse as any
      );

      const result = await suiService.executeTransaction(mockTransaction, mockSigner);

      expect(mockClient.signAndExecuteTransaction).toHaveBeenCalledWith({
        transaction: mockTransaction,
        signer: mockSigner,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      });
      expect(result).toEqual(mockTransactionResponse);
    });

    it('should handle transaction execution errors', async () => {
      mockClient.signAndExecuteTransaction.mockRejectedValueOnce(
        new Error('Transaction failed')
      );

      await expect(
        suiService.executeTransaction(mockTransaction, mockSigner)
      ).rejects.toThrow('Transaction failed');
    });

    it('should include all required options in transaction execution', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValueOnce(
        mockTransactionResponse as any
      );

      await suiService.executeTransaction(mockTransaction, mockSigner);

      expect(mockClient.signAndExecuteTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          options: {
            showEffects: true,
            showObjectChanges: true,
            showEvents: true,
          },
        })
      );
    });
  });

  describe('Service Initialization', () => {
    it('should initialize with SuiClient', () => {
      const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' });
      const service = new SuiService(client);

      expect(service).toBeDefined();
    });
  });
});

