import type { TradingPair, TradingParams } from '../types/orlim';

/**
 * Convert raw value to human-readable based on decimals
 */
export function fromRawValue(rawValue: number, decimals: number): number {
  return rawValue / Math.pow(10, decimals);
}

/**
 * Convert human-readable value to raw value based on decimals
 */
export function toRawValue(value: number, decimals: number): number {
  return Math.floor(value * Math.pow(10, decimals));
}

/**
 * Validate quantity against min_size
 */
export function validateMinSize(
  quantity: number,
  tradingParams: TradingParams,
  baseDecimals: number
): { valid: boolean; error?: string } {
  const rawQuantity = toRawValue(quantity, baseDecimals);
  if (rawQuantity < tradingParams.min_size) {
    const minSizeHuman = fromRawValue(tradingParams.min_size, baseDecimals);
    return {
      valid: false,
      error: `Minimum quantity is ${minSizeHuman.toFixed(Math.min(baseDecimals, 6))}`,
    };
  }
  return { valid: true };
}

/**
 * Validate quantity is a multiple of lot_size
 */
export function validateLotSize(
  quantity: number,
  tradingParams: TradingParams,
  baseDecimals: number
): { valid: boolean; error?: string } {
  // Convert human-readable quantity to raw value
  const rawQuantity = Math.round(quantity * Math.pow(10, baseDecimals));
  // Check if quantity is a multiple of lot_size (with small tolerance for floating point errors)
  const remainder = rawQuantity % tradingParams.lot_size;
  // Allow small floating point errors (within 1% of lot_size)
  const tolerance = tradingParams.lot_size * 0.01;
  if (remainder > tolerance && (tradingParams.lot_size - remainder) > tolerance) {
    const lotSizeHuman = fromRawValue(tradingParams.lot_size, baseDecimals);
    return {
      valid: false,
      error: `Quantity must be a multiple of ${lotSizeHuman.toFixed(Math.min(baseDecimals, 6))}`,
    };
  }
  return { valid: true };
}

/**
 * Validate price against tick_size
 */
export function validateTickSize(
  price: number,
  tradingParams: TradingParams,
  quoteDecimals: number
): { valid: boolean; error?: string } {
  // Convert human-readable price to raw value
  const rawPrice = Math.round(price * Math.pow(10, quoteDecimals));
  // Check if price is a multiple of tick_size (with small tolerance for floating point errors)
  const remainder = rawPrice % tradingParams.tick_size;
  // Allow small floating point errors (within 1% of tick_size)
  const tolerance = tradingParams.tick_size * 0.01;
  if (remainder > tolerance && (tradingParams.tick_size - remainder) > tolerance) {
    const tickSizeHuman = fromRawValue(tradingParams.tick_size, quoteDecimals);
    return {
      valid: false,
      error: `Price must be a multiple of ${tickSizeHuman.toFixed(Math.min(quoteDecimals, 8))}`,
    };
  }
  return { valid: true };
}

/**
 * Validate order parameters for a trading pair
 */
export function validateOrderParams(
  quantity: number,
  price: number,
  pair: TradingPair
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate quantity
  const minSizeCheck = validateMinSize(quantity, pair.trading_params, pair.base_asset.decimals);
  if (!minSizeCheck.valid && minSizeCheck.error) {
    errors.push(minSizeCheck.error);
  }

  const lotSizeCheck = validateLotSize(quantity, pair.trading_params, pair.base_asset.decimals);
  if (!lotSizeCheck.valid && lotSizeCheck.error) {
    errors.push(lotSizeCheck.error);
  }

  // Validate price
  const tickSizeCheck = validateTickSize(price, pair.trading_params, pair.quote_asset.decimals);
  if (!tickSizeCheck.valid && tickSizeCheck.error) {
    errors.push(tickSizeCheck.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format number according to token decimals
 * This function assumes the input amount is already in human-readable format
 */
export function formatTokenAmount(amount: number, decimals: number, precision?: number): string {
  if (precision !== undefined) {
    return amount.toFixed(precision);
  }
  // Auto precision based on decimals
  if (decimals >= 9) {
    return amount.toFixed(6);
  } else if (decimals >= 6) {
    return amount.toFixed(4);
  } else {
    return amount.toFixed(2);
  }
}

