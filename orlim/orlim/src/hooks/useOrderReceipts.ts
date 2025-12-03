import { useSuiClientQuery, useCurrentAccount } from '@mysten/dapp-kit';
import { CONTRACTS } from '../constants/contracts';
import type { OrderReceipt, OrderReceiptData } from '../types/orlim';

// Helper to parse OrderReceiptData from Sui object content
function parseOrderReceiptData(content: any): OrderReceiptData | null {
  if (!content || !content.fields) return null;

  const fields = content.fields;
  
  try {
    return {
      order_id: fields.order_id || fields.order_data?.fields?.order_id || '0',
      deepbook_order_id: fields.deepbook_order_id || fields.order_data?.fields?.deepbook_order_id || '0',
      pool_id: fields.pool_id || fields.order_data?.fields?.pool_id || '',
      price: fields.price || fields.order_data?.fields?.price || '0',
      quantity: fields.quantity || fields.order_data?.fields?.quantity || '0',
      original_quantity: fields.original_quantity || fields.order_data?.fields?.original_quantity || '0',
      is_bid: fields.is_bid !== undefined ? fields.is_bid : (fields.order_data?.fields?.is_bid ?? false),
      order_type: fields.order_type || fields.order_data?.fields?.order_type || { value: 0 },
      time_in_force: fields.time_in_force || fields.order_data?.fields?.time_in_force || { value: 0 },
      created_at: fields.created_at || fields.order_data?.fields?.created_at || '0',
      is_active: fields.is_active !== undefined ? fields.is_active : (fields.order_data?.fields?.is_active ?? true),
      is_fully_filled: fields.is_fully_filled !== undefined ? fields.is_fully_filled : (fields.order_data?.fields?.is_fully_filled ?? false),
      cancelled_at: fields.cancelled_at || fields.order_data?.fields?.cancelled_at || null,
      oco_group_id: fields.oco_group_id || fields.order_data?.fields?.oco_group_id || null,
      expires_at: fields.expires_at || fields.order_data?.fields?.expires_at || null,
    };
  } catch (error) {
    console.error('Error parsing OrderReceiptData:', error);
    return null;
  }
}

export function useOrderReceipts() {
  const account = useCurrentAccount();
  
  // Query user's OrderReceipt objects (Owned Objects)
  const { data: receiptsData, refetch, isLoading, error } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address || '',
      filter: {
        StructType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::OrderReceipt`,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    },
    {
      enabled: !!account,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  // Parse OrderReceipts
  const receipts: OrderReceipt[] = (receiptsData?.data || [])
    .map((item: any) => {
      const content = item.data?.content;
      if (!content) return null;

      const receiptData = parseOrderReceiptData(content);
      if (!receiptData) return null;

      return {
        objectId: item.data?.objectId || '',
        data: receiptData,
        owner: item.data?.owner?.AddressOwner || account?.address || '',
        version: item.data?.version || '',
      };
    })
    .filter((receipt: OrderReceipt | null): receipt is OrderReceipt => receipt !== null);

  // Filter active receipts
  const activeReceipts = receipts.filter(r => r.data.is_active && !r.data.is_fully_filled);
  
  // Group by order type
  const standardReceipts = receipts.filter(r => r.data.order_type.value === 0);
  const ocoReceipts = receipts.filter(r => r.data.order_type.value === 1);
  const tifReceipts = receipts.filter(r => r.data.order_type.value === 2);

  return {
    receipts,
    activeReceipts,
    standardReceipts,
    ocoReceipts,
    tifReceipts,
    isLoading,
    error,
    refetch,
  };
}

