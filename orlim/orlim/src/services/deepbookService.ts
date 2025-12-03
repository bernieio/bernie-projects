import type { OrderBookData, OrderBookLevel } from '../types/orlim';
import { CONTRACTS } from '../constants/contracts';

// Response type from DeepBook Indexer API
interface IndexerOrderBookResponse {
  bids?: Array<{
    price: string | number;
    quantity: string | number;
    orders?: number;
  }>;
  asks?: Array<{
    price: string | number;
    quantity: string | number;
    orders?: number;
  }>;
  mid_price?: number;
  best_bid?: number;
  best_ask?: number;
}

export class DeepBookService {
  private indexerApi: string;

  constructor(_suiClient: any, _userAddress: string, env: 'testnet' | 'mainnet' | 'devnet') {
    // Use DeepBook Indexer API instead of SDK
    // Indexer provides reliable data that's always up-to-date
    const indexerEnv = env === 'devnet' ? 'testnet' : env;
    this.indexerApi = indexerEnv === 'testnet' 
      ? CONTRACTS.DEEPBOOK.INDEXER_API
      : 'https://deepbook-indexer.mainnet.mystenlabs.com';
  }

  /**
   * Get Order Book from DeepBook Indexer API
   * Uses REST API instead of SDK to avoid "Pool not found" errors
   */
  async getOrderBookFromIndexer(poolId: string): Promise<IndexerOrderBookResponse> {
    try {
      const url = `${this.indexerApi}/get_orderbook?pool_id=${poolId}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Pool not found: ${poolId}. Please check if the pool exists on the indexer.`);
        }
        throw new Error(`Indexer API error: ${response.status} ${response.statusText}`);
      }

      const data: IndexerOrderBookResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching order book from indexer:', error);
      throw error;
    }
  }

  /**
   * Convert indexer response to OrderBookLevel format
   */
  private convertToOrderBookLevels(
    levels: Array<{ price: string | number; quantity: string | number; orders?: number }> | undefined
  ): OrderBookLevel[] {
    if (!levels || !Array.isArray(levels)) {
      return [];
    }

    return levels.map((level) => ({
      price: typeof level.price === 'string' ? parseFloat(level.price) : level.price,
      quantity: typeof level.quantity === 'string' ? parseFloat(level.quantity) : level.quantity,
      orders: level.orders || 1,
    }));
  }

  /**
   * Get Full Order Book (Bids + Asks) from DeepBook Indexer
   * This method uses the indexer REST API instead of SDK to avoid "Pool not found" errors
   */
  async getFullOrderBook(poolId: string): Promise<OrderBookData> {
    try {
      // Fetch order book from indexer API
      const indexerData = await this.getOrderBookFromIndexer(poolId);

      // Convert indexer response to our format
      const bids = this.convertToOrderBookLevels(indexerData.bids);
      const asks = this.convertToOrderBookLevels(indexerData.asks);

      // Sort bids: highest first, asks: lowest first
      bids.sort((a, b) => b.price - a.price);
      asks.sort((a, b) => a.price - b.price);

      // Calculate mid price
      let midPrice = indexerData.mid_price || 2.0;
      
      // If mid_price not provided, calculate from best bid/ask
      if (!indexerData.mid_price) {
        const bestBid = indexerData.best_bid || (bids.length > 0 ? bids[0].price : 0);
        const bestAsk = indexerData.best_ask || (asks.length > 0 ? asks[0].price : 0);
        
        if (bestBid > 0 && bestAsk > 0) {
          midPrice = (bestBid + bestAsk) / 2;
        } else if (bestBid > 0) {
          midPrice = bestBid;
        } else if (bestAsk > 0) {
          midPrice = bestAsk;
        }
      }

      return {
        bids,
        asks,
        midPrice,
      };
    } catch (error: any) {
      console.error('Error fetching full order book from indexer:', error);
      
      // Return empty order book on error (don't throw to avoid breaking UI)
      return {
        bids: [],
        asks: [],
        midPrice: 2.0,
      };
    }
  }

  /**
   * Get User's Orders from DeepBook
   * (This queries on-chain orders, not Orlim receipts)
   * Note: Indexer API may not support user-specific queries
   * Use Orlim OrderManager to track user orders instead
   */
  async getUserOrders(_poolId: string): Promise<any[]> {
    // Indexer API doesn't provide user-specific order queries
    // Track orders via Orlim OrderManager instead
    return [];
  }

  /**
   * Check Balance Manager balance
   * Note: This method is not available via indexer API
   * Use SuiClient directly if needed for on-chain balance checks
   */
  async checkManagerBalance(_managerKey: string, _coinType: string): Promise<number> {
    // Indexer API doesn't provide balance manager queries
    // Use SuiClient.getObject() or similar for on-chain balance checks
    return 0;
  }
}

