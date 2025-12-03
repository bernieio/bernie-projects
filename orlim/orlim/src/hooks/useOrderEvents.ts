import { useEffect, useState } from 'react';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { CONTRACTS } from '../constants/contracts';

export interface OrderPlacedEvent {
  order_id: string;
  pool_id: string;
  user: string;
  price: string;
  quantity: string;
  is_bid: boolean;
  created_at: string;
}

export interface OrderFilledEvent {
  order_id: string;
  filled_quantity: string;
  remaining_quantity: string;
  user: string;
  filled_at: string;
}

export interface OrderCancelledEvent {
  order_id: string;
  user: string;
  cancelled_at: string;
}

export interface OrderEvent {
  type: 'placed' | 'filled' | 'cancelled' | 'partial_filled';
  data: OrderPlacedEvent | OrderFilledEvent | OrderCancelledEvent;
  timestamp: number;
}

export function useOrderEvents(onEvent?: (event: OrderEvent) => void) {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!account) {
      setIsSubscribed(false);
      return;
    }

    // Subscribe to events
    const unsubscribe = client.subscribeEvent({
      filter: {
        MoveModule: {
          package: CONTRACTS.PACKAGE_ID,
          module: CONTRACTS.MODULE_NAME,
        },
      },
      onMessage: (event) => {
        try {
          const eventType = event.type;
          const parsedJson = typeof event.parsedJson === 'object' && event.parsedJson !== null
            ? event.parsedJson
            : JSON.parse(event.parsedJson as string);

          let orderEvent: OrderEvent | null = null;

          // Parse different event types
          if (eventType.includes('OrderPlaced')) {
            orderEvent = {
              type: 'placed',
              data: {
                order_id: parsedJson.order_id?.toString() || '',
                pool_id: parsedJson.pool_id || '',
                user: parsedJson.user || '',
                price: parsedJson.price?.toString() || '',
                quantity: parsedJson.quantity?.toString() || '',
                is_bid: parsedJson.is_bid || false,
                created_at: parsedJson.created_at?.toString() || '',
              } as OrderPlacedEvent,
              timestamp: Date.now(),
            };
          } else if (eventType.includes('OrderFilled') || eventType.includes('OrderPartialFilled')) {
            orderEvent = {
              type: eventType.includes('Partial') ? 'partial_filled' : 'filled',
              data: {
                order_id: parsedJson.order_id?.toString() || '',
                filled_quantity: parsedJson.filled_quantity?.toString() || parsedJson.quantity?.toString() || '',
                remaining_quantity: parsedJson.remaining_quantity?.toString() || '0',
                user: parsedJson.user || '',
                filled_at: parsedJson.filled_at?.toString() || parsedJson.created_at?.toString() || '',
              } as OrderFilledEvent,
              timestamp: Date.now(),
            };
          } else if (eventType.includes('OrderCancelled')) {
            orderEvent = {
              type: 'cancelled',
              data: {
                order_id: parsedJson.order_id?.toString() || '',
                user: parsedJson.user || '',
                cancelled_at: parsedJson.cancelled_at?.toString() || '',
              } as OrderCancelledEvent,
              timestamp: Date.now(),
            };
          }

          if (orderEvent) {
            // Only show events for current user
            if (orderEvent.data.user === account.address) {
              setEvents((prev) => [orderEvent!, ...prev].slice(0, 50)); // Keep last 50 events
              
              // Call callback if provided
              if (onEvent) {
                onEvent(orderEvent);
              }
            }
          }
        } catch (error) {
          console.error('Error parsing event:', error);
        }
      },
    });

    setIsSubscribed(true);

    return () => {
      unsubscribe.then((unsub) => unsub());
      setIsSubscribed(false);
    };
  }, [client, account, onEvent]);

  return {
    events,
    isSubscribed,
    clearEvents: () => setEvents([]),
  };
}

