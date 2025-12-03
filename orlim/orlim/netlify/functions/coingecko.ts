import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// CoinGecko Public API endpoint
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd';

// Response type for CoinGecko API
interface CoinGeckoResponse {
  sui?: {
    usd: number;
  };
}

// Response type for our function
interface PriceResponse {
  price: number;
  timestamp: number;
  error?: string;
}

/**
 * Netlify Function to proxy CoinGecko API requests
 * This helps avoid CORS issues and provides better rate limiting control
 */
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> => {
  // Set CORS headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=20', // Cache for 20 seconds
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Fetch price from CoinGecko
    const response = await fetch(COINGECKO_API, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Orlim-LimitOrderManager/1.0',
      },
    });

    if (!response.ok) {
      // Handle rate limit (429) or other errors
      if (response.status === 429) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'CoinGecko API rate limit exceeded. Please try again later.',
          } as PriceResponse),
        };
      }

      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoResponse = await response.json();
    const suiPrice = data.sui?.usd;

    if (!suiPrice || suiPrice <= 0) {
      throw new Error('Invalid price data from CoinGecko');
    }

    // Return successful response
    const priceResponse: PriceResponse = {
      price: suiPrice,
      timestamp: Date.now(),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(priceResponse),
    };
  } catch (error: any) {
    console.error('Error fetching CoinGecko price:', error);

    // Return error response
    const errorResponse: PriceResponse = {
      price: 0,
      timestamp: Date.now(),
      error: error.message || 'Failed to fetch SUI price',
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse),
    };
  }
};

