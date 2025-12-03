// TypeScript types for Orlim contract and frontend

// OrderReceiptData from contract (stored in OrderReceipt object)
export interface OrderReceiptData {
  order_id: string;
  deepbook_order_id: string;
  pool_id: string; // vector<u8> as hex string
  price: string;
  quantity: string;
  original_quantity: string;
  is_bid: boolean;
  order_type: OrderType;
  time_in_force: TimeInForce;
  created_at: string;
  is_active: boolean;
  is_fully_filled: boolean;
  cancelled_at?: string | null;
  oco_group_id?: string | null;
  expires_at?: string | null;
}

// OrderReceipt object (Owned Object)
export interface OrderReceipt {
  objectId: string;
  data: OrderReceiptData;
  owner: string;
  version: string;
}

// OrderType enum
export type OrderType = {
  value: number; // 0 = STANDARD, 1 = OCO, 2 = TIF
};

// TimeInForce enum
export type TimeInForce = {
  value: number; // 0 = GTC, 1 = IOC, 2 = FOK
};

// OCO Group
export interface OCOGroup {
  group_id: string;
  order1_id: string;
  order2_id: string;
  is_active: boolean;
}

export interface OrderManager {
  id: string;
  owner: string;
  active_orders: string[];
  total_orders_created: string;
  is_paused: boolean;
  created_at: string;
}

export interface PlaceOrderParams {
  pool_id: string;
  price: number;
  quantity: number;
  is_bid: boolean;
}

// OCO Order params
export interface PlaceOCOOrderParams {
  pool_id: string;
  take_profit_price: number;
  stop_loss_price: number;
  quantity: number;
  is_bid: boolean;
}

// TIF Order params
export interface PlaceTIFOrderParams {
  pool_id: string;
  price: number;
  quantity: number;
  is_bid: boolean;
  tif_type: 'IOC' | 'FOK'; // Immediate-or-Cancel or Fill-or-Kill
}

export interface CancelOrderParams {
  order_id: string;
}

export interface BatchCancelParams {
  order_ids: string[];
}

export interface ModifyOrderParams {
  order_id: string;
  new_price: number;
  new_quantity: number;
}

// DeepBook types
export interface DeepBookOrder {
  orderId: string;
  price: number;
  quantity: number;
  filledQuantity: number;
  isBid: boolean;
  status: 'open' | 'filled' | 'cancelled';
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  orders: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  midPrice: number;
}

// Trading Pair types
export interface AssetInfo {
  id: string;
  decimals: number;
  symbol: string;
  name: string;
}

export interface TradingParams {
  min_size: number;
  lot_size: number;
  tick_size: number;
}

export interface TradingPair {
  pool_id: string;
  pool_name: string;
  base_asset: AssetInfo;
  quote_asset: AssetInfo;
  trading_params: TradingParams;
}

export type PairTab = {
  id: string;
  pair: TradingPair;
  isPinned: boolean;
};

