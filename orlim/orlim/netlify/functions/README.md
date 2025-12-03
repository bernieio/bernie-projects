# Netlify Functions

This directory contains serverless functions for the Orlim Limit Order Manager.

## Functions

### `coingecko.ts`

Proxies requests to CoinGecko API to:
- Avoid CORS issues when calling from the frontend
- Provide better rate limiting control
- Add caching headers for better performance

**Endpoint:** `/.netlify/functions/coingecko`

**Method:** GET

**Response:**
```json
{
  "price": 2.15,
  "timestamp": 1234567890,
  "error": null
}
```

**Error Response:**
```json
{
  "price": 0,
  "timestamp": 1234567890,
  "error": "Error message"
}
```

## Development

Netlify Functions are automatically detected and deployed when you push to Netlify.

For local development, use Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

## Dependencies

- `@netlify/functions`: Netlify Functions runtime types

