// FloodGuard Protocol - Deployed Contract Information
// Transaction Digest: 9GdNPWLZDS7K5pBDkQMVsntJ4AUxxwrjJXdDtFK5NCxN
// Deployed: 2025-11-25 (Phase 1 Complete - Entry functions with proper object handling)

export const FLOODGUARD_PACKAGE = "0x0a08864e671c8e99ac1fd813b75c096eed6a269e9eabd51a363606d686e31e0f";
export const FLOODGUARD_STATE = "0x70242084c65c26ed75c972a3d15454655055838d3a499c12bc52ab98698040b1";
export const FLOODGUARD_MODULE = "floodguard_protocol";

export const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
export const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

// Mapbox Configuration
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
export const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";

// Default map center (Ho Chi Minh City, Vietnam)
export const DEFAULT_MAP_CENTER: [number, number] = [106.6297, 10.8231];
export const DEFAULT_MAP_ZOOM = 12;

// Resource Types Enum (matches smart contract)
export enum ResourceType {
    FOOD = 0,
    WATER = 1,
    MEDICAL = 2,
    SHELTER = 3,
    TRANSPORTATION = 4,
    RESCUE = 5,
    COMMUNICATION = 6
}
