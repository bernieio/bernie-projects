import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { FLOODGUARD_PACKAGE, FLOODGUARD_STATE, FLOODGUARD_MODULE } from './config';
import { getSuiClient } from './clients';

// Parameter interfaces - NO sender needed (entry functions handle transfers)
interface RegisterDisasterParams {
    location: string;
    severity: number;
    walrusBlobId: string;
}

interface SubmitResourceOfferParams {
    resourceType: number;
    quantity: number;
    location: string;
}

interface SubmitResourceRequestParams {
    resourceType: number;
    quantity: number;
    location: string;
    urgency: number;
}

export class FloodGuardClient {
    client: SuiClient;
    package: string;
    state: string;
    module: string;

    constructor() {
        this.client = getSuiClient();
        this.package = FLOODGUARD_PACKAGE;
        this.state = FLOODGUARD_STATE;
        this.module = FLOODGUARD_MODULE;
    }

    // === REGISTER DISASTER ===
    async registerDisaster(params: RegisterDisasterParams): Promise<Transaction> {
        const tx = new Transaction();

        // Call entry function - automatically handles object transfer
        tx.moveCall({
            target: `${this.package}::${this.module}::register_disaster_entry`,
            arguments: [
                tx.object(this.state),
                tx.pure.string(params.location),
                tx.pure.u8(params.severity),
                tx.pure.string(params.walrusBlobId),
            ],
        });

        return tx;
    }

    // === SUBMIT RESOURCE OFFER ===
    async submitResourceOffer(params: SubmitResourceOfferParams): Promise<Transaction> {
        const tx = new Transaction();

        // Call entry function - automatically handles object transfer
        tx.moveCall({
            target: `${this.package}::${this.module}::offer_resource_entry`,
            arguments: [
                tx.object(this.state),
                tx.pure.u8(params.resourceType),
                tx.pure.u64(params.quantity),
                tx.pure.string(params.location),
            ],
        });

        return tx;
    }

    // === SUBMIT RESOURCE REQUEST ===
    async submitResourceRequest(params: SubmitResourceRequestParams): Promise<Transaction> {
        const tx = new Transaction();

        // Call entry function - automatically handles object transfer
        tx.moveCall({
            target: `${this.package}::${this.module}::request_resource_entry`,
            arguments: [
                tx.object(this.state),
                tx.pure.u8(params.resourceType),
                tx.pure.u64(params.quantity),
                tx.pure.string(params.location),
                tx.pure.u8(params.urgency),
            ],
        });

        return tx;
    }

    // === CREATE MATCH ===
    async createMatch(offerId: string, requestId: string): Promise<Transaction> {
        const tx = new Transaction();

        // Call entry function - automatically handles object transfer
        tx.moveCall({
            target: `${this.package}::${this.module}::create_match_entry`,
            arguments: [
                tx.object(this.state),
                tx.object(offerId),    // ResourceOffer ID
                tx.object(requestId),  // ResourceRequest ID
            ],
        });

        return tx;
    }

    // === VERIFY DELIVERY ===
    async verifyDelivery(matchId: string, deliveryProofBlobId: string): Promise<Transaction> {
        const tx = new Transaction();

        tx.moveCall({
            target: `${this.package}::${this.module}::verify_delivery`,
            arguments: [
                tx.object(this.state),
                tx.object(matchId),
                tx.pure.string(deliveryProofBlobId),
            ],
        });

        return tx;
    }

    // === FETCH OWNED OBJECTS ===
    async getOwnedResourceObjects(address: string) {
        try {
            const objects = await this.client.getOwnedObjects({
                owner: address,
                filter: {
                    MatchAny: [
                        { StructType: `${this.package}::${this.module}::ResourceOffer` },
                        { StructType: `${this.package}::${this.module}::ResourceRequest` }
                    ]
                },
                options: {
                    showContent: true,
                    showType: true,
                }
            });

            const offers: any[] = [];
            const requests: any[] = [];

            for (const obj of objects.data) {
                if (obj.data?.content?.dataType === 'moveObject') {
                    const type = obj.data.type;
                    const fields = obj.data.content.fields as any;

                    if (type?.includes('::ResourceOffer')) {
                        offers.push({
                            id: obj.data.objectId,
                            resourceType: fields.resource_type,
                            quantity: fields.quantity,
                            location: fields.location?.fields?.value || fields.location,
                            active: fields.active,
                            provider: fields.provider
                        });
                    } else if (type?.includes('::ResourceRequest')) {
                        requests.push({
                            id: obj.data.objectId,
                            resourceType: fields.resource_type,
                            quantity: fields.quantity,
                            location: fields.location?.fields?.value || fields.location,
                            urgency: fields.urgency,
                            fulfilled: fields.fulfilled,
                            requester: fields.requester
                        });
                    }
                }
            }

            return { offers, requests };
        } catch (error) {
            console.error("Error fetching owned objects:", error);
            return { offers: [], requests: [] };
        }
    }

    // === VIEW FUNCTIONS ===
    async getTotalDisasters(): Promise<number> {
        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${this.package}::${this.module}::total_disasters`,
                arguments: [tx.object(this.state)],
            });

            const result = await this.client.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
            });

            if (result.results && result.results[0]?.returnValues) {
                const bytes = result.results[0].returnValues[0][0];
                const value = new DataView(new Uint8Array(bytes).buffer).getBigUint64(0, true);
                return Number(value);
            }
            return 0;
        } catch (error) {
            console.error("Error fetching total disasters:", error);
            return 0;
        }
    }

    async getTotalMatches(): Promise<number> {
        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${this.package}::${this.module}::total_matches`,
                arguments: [tx.object(this.state)],
            });

            const result = await this.client.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
            });

            if (result.results && result.results[0]?.returnValues) {
                const bytes = result.results[0].returnValues[0][0];
                const value = new DataView(new Uint8Array(bytes).buffer).getBigUint64(0, true);
                return Number(value);
            }
            return 0;
        } catch (error) {
            console.error("Error fetching total matches:", error);
            return 0;
        }
    }

    async isPaused(): Promise<boolean> {
        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${this.package}::${this.module}::is_paused`,
                arguments: [tx.object(this.state)],
            });

            const result = await this.client.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
            });

            if (result.results && result.results[0]?.returnValues) {
                const bytes = result.results[0].returnValues[0][0];
                return bytes[0] === 1;
            }
            return false;
        } catch (error) {
            console.error("Error fetching paused status:", error);
            return false;
        }
    }
}
