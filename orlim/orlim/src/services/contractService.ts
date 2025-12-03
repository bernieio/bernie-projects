import { Transaction } from '@mysten/sui/transactions';
import { CONTRACTS } from '../constants/contracts';

export class ContractService {
  private packageId: string;
  private moduleName: string;

  constructor() {
    this.packageId = CONTRACTS.PACKAGE_ID;
    this.moduleName = CONTRACTS.MODULE_NAME;
  }

  // Create Order Manager (first time setup)
  createOrderManagerTx(clockObjectId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::create_order_manager_entry`,
      arguments: [
        tx.object(clockObjectId), // Clock object (0x6)
      ],
    });
    return tx;
  }

  // Place Standard Limit Order
  placeOrderTx(params: {
    orderManager: string;
    poolId: string;
    price: number;
    quantity: number;
    isBid: boolean;
    clockObjectId: string;
  }): Transaction {
    const tx = new Transaction();
    
    // Convert pool_id string to vector<u8>
    const poolIdHex = params.poolId.replace('0x', '');
    const poolIdBytes = poolIdHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::place_limit_order_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.pure.vector('u8', poolIdBytes),
        tx.pure.u64(Math.floor(params.price * 1e8)), // Price with 8 decimals
        tx.pure.u64(params.quantity),
        tx.pure.bool(params.isBid),
        tx.object(params.clockObjectId), // 0x6
      ],
    });
    return tx;
  }

  // Place OCO (One-Cancels-Other) Order
  placeOCOOrderTx(params: {
    orderManager: string;
    poolId: string;
    order1Price: number;
    order1Quantity: number;
    order1IsBid: boolean;
    order2Price: number;
    order2Quantity: number;
    order2IsBid: boolean;
    clockObjectId: string;
  }): Transaction {
    const tx = new Transaction();
    
    const poolIdHex = params.poolId.replace('0x', '');
    const poolIdBytes = poolIdHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::place_limit_order_oco_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.pure.vector('u8', poolIdBytes),
        tx.pure.u64(Math.floor(params.order1Price * 1e8)),
        tx.pure.u64(params.order1Quantity),
        tx.pure.bool(params.order1IsBid),
        tx.pure.u64(Math.floor(params.order2Price * 1e8)),
        tx.pure.u64(params.order2Quantity),
        tx.pure.bool(params.order2IsBid),
        tx.object(params.clockObjectId),
      ],
    });
    return tx;
  }

  // Place TIF (Time-in-Force) Order
  placeTIFOrderTx(params: {
    orderManager: string;
    poolId: string;
    price: number;
    quantity: number;
    isBid: boolean;
    tifType: 'IOC' | 'FOK'; // 1 = IOC, 2 = FOK
    baseCoin: string; // Coin object ID
    quoteCoin: string; // Coin object ID
    clockObjectId: string;
  }): Transaction {
    const tx = new Transaction();
    
    const poolIdHex = params.poolId.replace('0x', '');
    const poolIdBytes = poolIdHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    const tifTypeValue = params.tifType === 'IOC' ? 1 : 2;
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::place_limit_order_tif_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.pure.vector('u8', poolIdBytes),
        tx.pure.u64(Math.floor(params.price * 1e8)),
        tx.pure.u64(params.quantity),
        tx.pure.bool(params.isBid),
        tx.pure.u8(tifTypeValue),
        tx.object(params.baseCoin),
        tx.object(params.quoteCoin),
        tx.object(params.clockObjectId),
      ],
    });
    return tx;
  }

  // Cancel Single Order
  cancelOrderTx(params: {
    orderManager: string;
    orderId: string;
    clockObjectId: string;
  }): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::cancel_limit_order_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.pure.u64(params.orderId),
        tx.object(params.clockObjectId),
      ],
    });
    return tx;
  }

  // Batch Cancel Orders (PTB!)
  batchCancelOrdersTx(params: {
    orderManager: string;
    orderIds: string[];
    clockObjectId: string;
  }): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::cancel_multiple_orders_safe_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.pure.vector('u64', params.orderIds.map(id => BigInt(id))),
        tx.object(params.clockObjectId),
      ],
    });
    return tx;
  }

  // Modify Order
  modifyOrderTx(params: {
    orderManager: string;
    orderId: string;
    newPrice: number;
    newQuantity: number;
    clockObjectId: string;
  }): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::modify_order_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.pure.u64(params.orderId),
        tx.pure.u64(Math.floor(params.newPrice * 1e8)),
        tx.pure.u64(params.newQuantity),
        tx.object(params.clockObjectId),
      ],
    });
    return tx;
  }

  // Cancel Order by OrderReceipt Object (Feature 4: Order Ownership)
  cancelOrderByReceiptTx(params: {
    orderManager: string;
    orderReceiptId: string; // OrderReceipt object ID
    clockObjectId: string;
  }): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::cancel_order_by_object_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.object(params.orderReceiptId), // OrderReceipt owned object
        tx.object(params.clockObjectId),
      ],
    });
    return tx;
  }

  // Create Order Receipt (convert from Table to Owned Object)
  createOrderReceiptTx(params: {
    orderManager: string;
    orderId: string;
  }): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::create_order_receipt_entry`,
      arguments: [
        tx.object(params.orderManager),
        tx.pure.u64(params.orderId),
      ],
    });
    return tx;
  }
}

export const contractService = new ContractService();

