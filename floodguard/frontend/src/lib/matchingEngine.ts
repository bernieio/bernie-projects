import { getFloodGuardClient } from './singletons';
import * as turf from '@turf/turf';

export interface MatchProposal {
    offerId: string;
    requestId: string;
    resourceType: number;
    score: number;
    distance: number; // in km
    offerQuantity: number;
    requestQuantity: number;
    urgency: number;
}

export class MatchingEngine {
    private client = getFloodGuardClient();

    constructor() {
        // Use singleton client
    }

    /**
     * Find matches for a specific user's offers and requests
     * In a real system, this would run on a backend with an indexer.
     * Here, we match the user's own offers/requests for demonstration.
     */
    async findMatches(userAddress: string): Promise<MatchProposal[]> {
        const { offers, requests } = await this.client.getOwnedResourceObjects(userAddress);
        const matches: MatchProposal[] = [];

        console.log(`Running matching engine for ${userAddress}`);
        console.log(`Found ${offers.length} offers and ${requests.length} requests`);

        for (const request of requests) {
            if (request.fulfilled) continue;

            for (const offer of offers) {
                if (!offer.active) continue;
                if (offer.resourceType !== request.resourceType) continue;

                // Calculate match score
                const match = this.calculateMatch(offer, request);
                if (match) {
                    matches.push(match);
                }
            }
        }

        // Sort by score descending
        return matches.sort((a, b) => b.score - a.score);
    }

    private calculateMatch(offer: any, request: any): MatchProposal | null {
        // Parse locations "lat,lng"
        const offerLoc = this.parseLocation(offer.location);
        const requestLoc = this.parseLocation(request.location);

        if (!offerLoc || !requestLoc) return null;

        // Calculate distance in km
        const from = turf.point([offerLoc.lng, offerLoc.lat]);
        const to = turf.point([requestLoc.lng, requestLoc.lat]);
        const distance = turf.distance(from, to, { units: 'kilometers' });

        // Score calculation (0-100)
        // Factors:
        // 1. Urgency (1-5): Higher is better
        // 2. Distance: Lower is better
        // 3. Quantity: Closer match is better

        // Normalize distance score (max 100km considered "far")
        const distanceScore = Math.max(0, 100 - distance);

        // Normalize urgency (20 points per level)
        const urgencyScore = request.urgency * 20;

        // Total score
        const score = (distanceScore * 0.6) + (urgencyScore * 0.4);

        return {
            offerId: offer.id,
            requestId: request.id,
            resourceType: offer.resourceType,
            score: Math.round(score),
            distance: Math.round(distance * 10) / 10,
            offerQuantity: parseInt(offer.quantity),
            requestQuantity: parseInt(request.quantity),
            urgency: request.urgency
        };
    }

    private parseLocation(locStr: string): { lat: number, lng: number } | null {
        try {
            if (typeof locStr !== 'string') return null;
            const [lat, lng] = locStr.split(',').map(Number);
            if (isNaN(lat) || isNaN(lng)) return null;
            return { lat, lng };
        } catch (e) {
            return null;
        }
    }
}
