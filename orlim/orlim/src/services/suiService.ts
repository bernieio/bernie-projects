import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export class SuiService {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  // Get object by ID
  async getObject(objectId: string) {
    return await this.client.getObject({
      id: objectId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    });
  }

  // Get owned objects by address
  async getOwnedObjects(address: string, type?: string) {
    return await this.client.getOwnedObjects({
      owner: address,
      filter: type ? { StructType: type } : undefined,
      options: {
        showContent: true,
        showType: true,
      },
    });
  }

  // Execute transaction block
  async executeTransaction(tx: Transaction, signer: any) {
    return await this.client.signAndExecuteTransaction({
      transaction: tx,
      signer,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });
  }
}

