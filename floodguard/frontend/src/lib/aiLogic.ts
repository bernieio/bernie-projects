// === RISK SCORING ===

interface RiskParams {
    waterLevel: number; // 0-1 (meters or relative scale)
    rainfall: number; // mm/h
    populationDensity: number; // p/km²
    reportFrequency: number; // r/h
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function calculateRiskScore(params: RiskParams): number {
    // Step 1: Normalize inputs
    const normalized_rainfall = clamp(params.rainfall / 200, 0, 1);
    const normalized_density = clamp(params.populationDensity / 10000, 0, 1);
    const normalized_reports = clamp(params.reportFrequency / 50, 0, 1);

    // Step 2: Weighted sum
    const risk =
        params.waterLevel * 0.4 +
        normalized_rainfall * 0.25 +
        normalized_density * 0.2 +
        normalized_reports * 0.15;

    return clamp(risk, 0, 1);
}

// === RESOURCE MATCHING ===

interface Offer {
    id: string;
    type: string;
    lat: number;
    lng: number;
}

interface Request {
    id: string;
    type: string;
    lat: number;
    lng: number;
    urgency: number; // 1-10
    peopleCount: number;
}

interface Match {
    offerId: string;
    requestId: string;
    score: number;
}

interface Edge {
    offerId: string;
    requestId: string;
    cost: number;
}

export function matchResources(offers: Offer[], requests: Request[]): Match[] {
    // Step 1: Build all edges with costs - O(n*m)
    const edges: Edge[] = [];
    for (const offer of offers) {
        for (const request of requests) {
            if (offer.type !== request.type) {
                continue;
            }

            // Haversine distance
            const distance = haversine(offer.lat, offer.lng, request.lat, request.lng);

            // Cost function
            // Higher urgency = lower cost (urgency is 1-10, so 1/urgency is 1 to 0.1)
            // Wait, if urgency is high (10), 1/10 = 0.1. If urgency is low (1), 1/1 = 1.
            // So higher urgency reduces cost. Correct.
            const urgency_weight = 1 / Math.max(request.urgency, 1);
            const people_weight = (100 - Math.min(request.peopleCount, 100)) * 0.003;
            const cost = distance * 0.7 * urgency_weight + people_weight;

            edges.push({ offerId: offer.id, requestId: request.id, cost });
        }
    }

    // Step 2: Sort by cost ascending - O(E log E)
    edges.sort((a, b) => a.cost - b.cost);

    // Step 3: Greedy selection - O(E)
    const matched_offers = new Set<string>();
    const matched_requests = new Set<string>();
    const final_matches: Match[] = [];

    for (const edge of edges) {
        if (matched_offers.has(edge.offerId) || matched_requests.has(edge.requestId)) {
            continue;
        }

        matched_offers.add(edge.offerId);
        matched_requests.add(edge.requestId);

        const score = 1 / (1 + edge.cost); // Convert cost to score [0,1]
        final_matches.push({
            offerId: edge.offerId,
            requestId: edge.requestId,
            score: score,
        });
    }

    return final_matches;
}

// === GEOSPATIAL UTILITIES ===

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
