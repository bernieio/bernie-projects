import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { contractService } from '../services/contractService';
import type { PlaceOrderParams, PlaceOCOOrderParams, PlaceTIFOrderParams } from '../types/orlim';

const CLOCK_OBJECT_ID = '0x6'; // Sui Clock object

export function useOrlimContract(orderManagerId: string) {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  // Place Order
  const placeOrder = async (params: PlaceOrderParams) => {
    if (!orderManagerId) {
      throw new Error('Order Manager not found. Please create one first.');
    }

    const tx = contractService.placeOrderTx({
      orderManager: orderManagerId,
      poolId: params.pool_id,
      price: params.price,
      quantity: params.quantity,
      isBid: params.is_bid,
      clockObjectId: CLOCK_OBJECT_ID,
    });

    const result = await signAndExecute({
      transaction: tx,
    });
    return result;
  };

  // Place OCO Order
  const placeOCOOrder = async (params: PlaceOCOOrderParams) => {
    if (!orderManagerId) {
      throw new Error('Order Manager not found. Please create one first.');
    }

    const tx = contractService.placeOCOOrderTx({
      orderManager: orderManagerId,
      poolId: params.pool_id,
      order1Price: params.take_profit_price,
      order1Quantity: params.quantity,
      order1IsBid: false, // Take Profit is sell
      order2Price: params.stop_loss_price,
      order2Quantity: params.quantity,
      order2IsBid: false, // Stop Loss is sell
      clockObjectId: CLOCK_OBJECT_ID,
    });

    const result = await signAndExecute({
      transaction: tx,
    });
    return result;
  };

  // Place TIF Order
  const placeTIFOrder = async (params: PlaceTIFOrderParams & { baseCoin: string; quoteCoin: string }) => {
    if (!orderManagerId) {
      throw new Error('Order Manager not found. Please create one first.');
    }

    const tx = contractService.placeTIFOrderTx({
      orderManager: orderManagerId,
      poolId: params.pool_id,
      price: params.price,
      quantity: params.quantity,
      isBid: params.is_bid,
      tifType: params.tif_type,
      baseCoin: params.baseCoin,
      quoteCoin: params.quoteCoin,
      clockObjectId: CLOCK_OBJECT_ID,
    });

    const result = await signAndExecute({
      transaction: tx,
    });
    return result;
  };

  // Cancel Order
  const cancelOrder = async (orderId: string) => {
    if (!orderManagerId) {
      throw new Error('Order Manager not found.');
    }

    const tx = contractService.cancelOrderTx({
      orderManager: orderManagerId,
      orderId,
      clockObjectId: CLOCK_OBJECT_ID,
    });

    return await signAndExecute({ transaction: tx });
  };

  // Batch Cancel
  const batchCancelOrders = async (orderIds: string[]) => {
    if (!orderManagerId) {
      throw new Error('Order Manager not found.');
    }

    if (orderIds.length === 0) {
      throw new Error('No orders selected for cancellation.');
    }

    const tx = contractService.batchCancelOrdersTx({
      orderManager: orderManagerId,
      orderIds,
      clockObjectId: CLOCK_OBJECT_ID,
    });

    return await signAndExecute({ transaction: tx });
  };

  // Modify Order
  const modifyOrder = async (params: {
    orderId: string;
    newPrice: number;
    newQuantity: number;
  }) => {
    if (!orderManagerId) {
      throw new Error('Order Manager not found.');
    }

    const tx = contractService.modifyOrderTx({
      orderManager: orderManagerId,
      orderId: params.orderId,
      newPrice: params.newPrice,
      newQuantity: params.newQuantity,
      clockObjectId: CLOCK_OBJECT_ID,
    });

    return await signAndExecute({ transaction: tx });
  };

  // Cancel Order by Receipt
  const cancelOrderByReceipt = async (receiptId: string) => {
    if (!orderManagerId) {
      throw new Error('Order Manager not found.');
    }

    const tx = contractService.cancelOrderByReceiptTx({
      orderManager: orderManagerId,
      orderReceiptId: receiptId,
      clockObjectId: CLOCK_OBJECT_ID,
    });

    return await signAndExecute({ transaction: tx });
  };

  return {
    placeOrder,
    placeOCOOrder,
    placeTIFOrder,
    cancelOrder,
    cancelOrderByReceipt,
    batchCancelOrders,
    modifyOrder,
  };
}

