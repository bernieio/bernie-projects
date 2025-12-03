// Contract addresses and configuration
import type { TradingPair } from '../types/orlim';

export const CONTRACTS = {
  PACKAGE_ID: '0x0179638d8d58ea7b8a83c9d2377fa7fba85b8101dbef8d2194214925121c21eb',
  MODULE_NAME: 'orlim',
  
  // DeepBook V3 constants (from SDK)
  DEEPBOOK: {
    PACKAGE_ID: '0xdee9', // DeepBook package (auto from SDK)
    INDEXER_API: 'https://deepbook-indexer.mainnet.mystenlabs.com',
    POOLS: {
      // Pool IDs from DeepBook Indexer API (mainnet)
      DEEP_SUI: '0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22', // DEEP/SUI
      SUI_USDC: '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407', // SUI/USDC
    },
    // Default pool to use
    DEFAULT_POOL: 'SUI_USDC',
  },
} as const;

// Trading Pairs Configuration (Mainnet)
export const TRADING_PAIRS: TradingPair[] = [
  {
    pool_id: '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407',
    pool_name: 'SUI_USDC',
    base_asset: {
      id: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      decimals: 9,
      symbol: 'SUI',
      name: 'Sui',
    },
    quote_asset: {
      id: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      decimals: 6,
      symbol: 'USDC',
      name: 'Native USDC Token',
    },
    trading_params: {
      min_size: 1000000000, // 1 SUI (9 decimals)
      lot_size: 100000000, // 0.1 SUI
      tick_size: 10, // 0.00001 USDC (6 decimals)
    },
  },
  {
    pool_id: '0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22',
    pool_name: 'DEEP_SUI',
    base_asset: {
      id: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
      decimals: 6,
      symbol: 'DEEP',
      name: 'DeepBook Token',
    },
    quote_asset: {
      id: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      decimals: 9,
      symbol: 'SUI',
      name: 'Sui',
    },
    trading_params: {
      min_size: 10000000, // 10 DEEP (6 decimals)
      lot_size: 1000000, // 1 DEEP (6 decimals)
      tick_size: 10000000, // 0.01 SUI (9 decimals)
    },
  },
];

// Helper function to get pair by pool_id
export function getTradingPairByPoolId(poolId: string): TradingPair | undefined {
  return TRADING_PAIRS.find((pair) => pair.pool_id === poolId);
}

// Helper function to get pair by pool_name
export function getTradingPairByName(poolName: string): TradingPair | undefined {
  return TRADING_PAIRS.find((pair) => pair.pool_name === poolName);
}

// Error codes (sequential numbering)
export const ERROR_CODES = {
  EORDER_NOT_FOUND: 0,
  EINVALID_PRICE: 1,
  EINVALID_QUANTITY: 2,
  EUNAUTHORIZED: 3,
  ECONTRACT_PAUSED: 4,
  ETIMESTAMP_INVALID: 5,
  EORDER_ALREADY_CANCELLED: 6,
  EOCO_GROUP_NOT_FOUND: 7,
  EORDER_ALREADY_FILLED: 8,
  EINVALID_TIF_TYPE: 9,
  EORDER_EXPIRED: 10,
  EOCO_ORDER_FILLED: 11,
} as const;

