import { getFloodGuardClient } from './singletons';
import { getSuiClient } from './clients';

// Use singleton instance
const floodGuardClient = getFloodGuardClient();

export interface DisasterData {
    id: string;
    location: string; // "lat,lng" format
    severity: number;
    walrus_proof: string;
    reporter: string;
    timestamp: number;
    verified: boolean;
    risk_score: number;
}

export interface ResourceOfferData {
    id: string;
    provider: string;
    resourceType: number;
    quantity: number;
    location: string; // "lat,lng" format
    timestamp: number;
    active: boolean;
}

export interface ResourceRequestData {
    id: string;
    requester: string;
    resourceType: number;
    quantity: number;
    location: string; // "lat,lng" format
    urgency: number;
    timestamp: number;
    fulfilled: boolean;
}

/**
 * Fetch all disasters from the blockchain using events
 */
export async function fetchDisasters(): Promise<DisasterData[]> {
    try {
        const suiClient = getSuiClient();

        // Query DisasterAlert events
        const events = await suiClient.queryEvents({
            query: {
                MoveEventType: `${floodGuardClient.package}::${floodGuardClient.module}::DisasterAlert`
            },
            limit: 50, // Fetch last 50 disasters
            order: 'descending'
        });

        const disasters: DisasterData[] = [];

        for (const event of events.data) {
            if (event.parsedJson) {
                const data = event.parsedJson as any;

                // Extract geohash value
                const location = data.geohash?.value || data.geohash || '';

                disasters.push({
                    id: event.id.txDigest, // Use transaction digest as ID
                    location: location,
                    severity: data.severity || 0,
                    walrus_proof: '', // Not available in event
                    reporter: '', // Not available in event
                    timestamp: parseInt(event.timestampMs || '0'),
                    verified: false,
                    risk_score: data.risk_score || 0
                });
            }
        }

        console.log(`Fetched ${disasters.length} disasters from events`);
        return disasters;
    } catch (error) {
        console.error('Error fetching disasters:', error);
        return [];
    }
}

/**
 * Fetch all resource offers from the blockchain
 */
export async function fetchResourceOffers(): Promise<ResourceOfferData[]> {
    try {
        // TODO: Implement event-based querying for offers
        // No events emitted for offers in current contract
        return [];
    } catch (error) {
        console.error('Error fetching resource offers:', error);
        return [];
    }
}

/**
 * Fetch all resource requests from the blockchain
 */
export async function fetchResourceRequests(): Promise<ResourceRequestData[]> {
    try {
        // TODO: Implement event-based querying for requests
        // No events emitted for requests in current contract
        return [];
    } catch (error) {
        console.error('Error fetching resource requests:', error);
        return [];
    }
}

/**
 * Fetch all dashboard data at once
 */
export async function fetchDashboardData() {
    const [disasters, offers, requests] = await Promise.all([
        fetchDisasters(),
        fetchResourceOffers(),
        fetchResourceRequests()
    ]);

    return {
        disasters,
        offers,
        requests,
        stats: {
            totalDisasters: disasters.length,
            totalOffers: offers.length,
            totalRequests: requests.length,
            activeOffers: offers.filter((o: ResourceOfferData) => o.active).length,
            pendingRequests: requests.filter((r: ResourceRequestData) => !r.fulfilled).length
        }
    };
}
