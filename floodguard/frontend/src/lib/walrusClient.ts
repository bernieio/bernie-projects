import { WalrusClient as WalrusSdkClient } from '@mysten/walrus';

export interface WalrusUploadResult {
    blobId: string;
    size: number;
    timestamp: number;
}

/**
 * WalrusClient - HTTP-based client for Walrus testnet
 * Uses direct HTTP API calls to Walrus Publisher and Aggregator
 */
export class WalrusClient {
    // Multiple publishers for failover reliability
    private publishers = [
        'https://publisher.walrus-testnet.walrus.space',
        'https://publisher.testnet.walrus.atalma.io',
        'https://publisher.walrus-testnet.h2o-nodes.com',
        'https://sm1-walrus-testnet-publisher.stakesquid.com',
    ];

    private aggregatorUrl = 'https://aggregator.walrus-testnet.walrus.space';
    private currentPublisherIndex = 0;

    /**
     * Upload blob to Walrus using HTTP API with automatic failover
     * This bypasses SDK complexity and works directly with the testnet
     */
    async uploadBlob(file: File): Promise<string> {
        console.log('📦 Preparing Walrus upload...');

        // Convert File to bytes
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Try each publisher in sequence until one succeeds
        let lastError: Error | null = null;

        for (let i = 0; i < this.publishers.length; i++) {
            const publisherUrl = this.publishers[(this.currentPublisherIndex + i) % this.publishers.length];

            try {
                console.log(`🚀 Uploading to Walrus Publisher (${i + 1}/${this.publishers.length}): ${publisherUrl}`);

                // ✅ CRITICAL FIX: Use /v1/blobs instead of /v1/store
                // ✅ ENHANCEMENT: Use epochs=5 for longer storage (instead of 1)
                const response = await fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
                    method: 'PUT',
                    body: bytes,
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Walrus Publisher error:', {
                        publisher: publisherUrl,
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                        body: errorText
                    });

                    // Try next publisher
                    lastError = new Error(`Publisher ${publisherUrl} failed: ${response.status} ${response.statusText}`);
                    continue;
                }

                const data = await response.json();
                console.log('Walrus response:', data);

                // Extract blob ID from response
                let blobId = '';
                if (data.newlyCreated?.blobObject?.blobId) {
                    blobId = data.newlyCreated.blobObject.blobId;
                } else if (data.alreadyCertified?.blobId) {
                    blobId = data.alreadyCertified.blobId;
                } else if (data.blobObject?.blobId) {
                    blobId = data.blobObject.blobId;
                } else {
                    console.error('Unexpected Walrus response structure:', data);
                    lastError = new Error('Invalid response from Walrus Publisher');
                    continue;
                }

                console.log('✅ Walrus upload successful:', {
                    blobId,
                    size: file.size,
                    publisher: publisherUrl,
                    epochs: 5
                });

                // Update current publisher for next upload
                this.currentPublisherIndex = (this.currentPublisherIndex + i) % this.publishers.length;

                return blobId;

            } catch (error: any) {
                console.error(`❌ Upload failed for ${publisherUrl}:`, error.message);
                lastError = error;
                // Continue to next publisher
            }
        }

        // All publishers failed
        console.error('❌ All Walrus publishers failed!');
        throw new Error(`Failed to upload to Walrus after trying ${this.publishers.length} publishers: ${lastError?.message}`);
    }

    /**
     * Read blob from Walrus using HTTP aggregator
     */
    async readBlob(blobId: string): Promise<Uint8Array> {
        try {
            const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return new Uint8Array(arrayBuffer);
        } catch (error: any) {
            console.error('Walrus read error:', error);
            throw new Error(`Failed to read blob: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Read blob and convert to object URL for display
     */
    async readBlobAsUrl(blobId: string): Promise<string> {
        try {
            const blob = await this.readBlob(blobId);
            const blobObj = new Blob([blob as any]);
            const url = URL.createObjectURL(blobObj);
            return url;
        } catch (error: any) {
            console.error('Walrus read error:', error);
            throw new Error(`Failed to read blob: ${error.message || 'Unknown error'}`);
        }
    }
}
