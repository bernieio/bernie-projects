import { SuiClient } from '@mysten/sui/client';
import { getFullnodeUrl } from '@mysten/sui/client';

// ============================================================================
// SINGLETON SUI CLIENT
// ============================================================================
// Create a single SuiClient instance to be reused across the entire app
// This prevents connection pool exhaustion and improves performance

let suiClientInstance: SuiClient | null = null;

export function getSuiClient(): SuiClient {
    if (!suiClientInstance) {
        suiClientInstance = new SuiClient({
            url: getFullnodeUrl('testnet')
        });
    }
    return suiClientInstance;
}

// ============================================================================
// SINGLETON WALRUS CLIENT  
// ============================================================================
// Note: Walrus SDK doesn't need a persistent client instance
// The SDK handles its own connection management internally
// We just need to ensure we're using the correct API pattern

export { getSuiClient as default };
