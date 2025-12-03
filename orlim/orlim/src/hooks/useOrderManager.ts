import { useSuiClientQuery, useCurrentAccount } from '@mysten/dapp-kit';
import { CONTRACTS } from '../constants/contracts';
import type { OrderManager } from '../types/orlim';

export function useOrderManager() {
  const account = useCurrentAccount();
  
  // Query user's OrderManager object
  const { data: orderManagerData, refetch } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address || '',
      filter: {
        StructType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::OrderManager`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!account,
    }
  );

  // Parse OrderManager
  const orderManager = orderManagerData?.data?.[0];
  const orderManagerId = orderManager?.data?.objectId;

  // Get active orders from OrderManager
  const { data: activeOrdersData, refetch: refetchActiveOrders } = useSuiClientQuery(
    'getObject',
    {
      id: orderManagerId || '',
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!orderManagerId,
    }
  );

  // Parse active orders
  const activeOrders: string[] = 
    (activeOrdersData?.data?.content as any)?.fields?.active_orders || [];

  // Parse full OrderManager data
  const orderManagerDetails: OrderManager | null = orderManagerId && activeOrdersData?.data?.content 
    ? {
        id: orderManagerId,
        owner: (activeOrdersData.data.content as any).fields?.owner || account?.address || '',
        active_orders: activeOrders,
        total_orders_created: (activeOrdersData.data.content as any).fields?.total_orders_created || '0',
        is_paused: (activeOrdersData.data.content as any).fields?.is_paused || false,
        created_at: (activeOrdersData.data.content as any).fields?.created_at || '0',
      }
    : null;

  // Refetch both queries
  const refetchAll = async () => {
    await Promise.all([
      refetch(),
      refetchActiveOrders(),
    ]);
  };

  return {
    orderManagerId,
    orderManager: orderManagerDetails,
    activeOrders,
    refetch: refetchAll,
    refetchOrderManager: refetch,
    refetchActiveOrders,
  };
}

