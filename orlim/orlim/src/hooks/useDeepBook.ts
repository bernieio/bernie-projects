import { useState, useEffect } from 'react';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { DeepBookService } from '../services/deepbookService';
import type { OrderBookData } from '../types/orlim';

export function useDeepBook(poolKey: string) {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poolKey) {
      setOrderBook(null);
      return;
    }

    // DeepBookService needs an address, use a placeholder if no account
    const deepbookService = new DeepBookService(
      client,
      account?.address || '0x0000000000000000000000000000000000000000000000000000000000000000',
      'testnet' // Using testnet
    );

    const fetchOrderBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await deepbookService.getFullOrderBook(poolKey);
        setOrderBook(data);
      } catch (err: any) {
        console.error('Failed to fetch order book:', err);
        setError(err.message || 'Failed to fetch order book');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [poolKey, account, client]);

  return {
    orderBook,
    loading,
    error,
  };
}

