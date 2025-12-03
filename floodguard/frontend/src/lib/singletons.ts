import { FloodGuardClient } from './suiClient';
import { WalrusClient } from './walrusClient';
import { AIRiskService } from './aiRiskService';
import { MatchingEngine } from './matchingEngine';

// ============================================================================
// TRUE SINGLETON PATTERN - One instance for entire application
// ============================================================================
// These instances are created once and reused everywhere
// Prevents multiple connection pools and memory leaks

let floodGuardClientInstance: FloodGuardClient | null = null;
let walrusClientInstance: WalrusClient | null = null;
let aiServiceInstance: AIRiskService | null = null;
let matchingEngineInstance: MatchingEngine | null = null;

export function getFloodGuardClient(): FloodGuardClient {
    if (!floodGuardClientInstance) {
        floodGuardClientInstance = new FloodGuardClient();
        console.log('✅ FloodGuardClient singleton created');
    }
    return floodGuardClientInstance;
}

export function getWalrusClient(): WalrusClient {
    if (!walrusClientInstance) {
        walrusClientInstance = new WalrusClient();
        console.log('✅ WalrusClient singleton created');
    }
    return walrusClientInstance;
}

export function getAIRiskService(): AIRiskService {
    if (!aiServiceInstance) {
        aiServiceInstance = new AIRiskService();
        console.log('✅ AIRiskService singleton created');
    }
    return aiServiceInstance;
}

export function getResourceMatcher(): MatchingEngine {
    if (!matchingEngineInstance) {
        matchingEngineInstance = new MatchingEngine();
        console.log('✅ MatchingEngine singleton created');
    }
    return matchingEngineInstance;
}

// Export all getters as a convenience
export const Singletons = {
    getFloodGuardClient,
    getWalrusClient,
    getAIRiskService,
    getResourceMatcher,
};
