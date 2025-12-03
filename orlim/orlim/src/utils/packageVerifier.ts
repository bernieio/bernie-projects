import { SuiClient } from '@mysten/sui/client';
import { CONTRACTS } from '../constants/contracts';

/**
 * Verify if package exists on the current network
 */
export async function verifyPackageExists(
  client: SuiClient,
  packageId: string = CONTRACTS.PACKAGE_ID
): Promise<{ exists: boolean; error?: string }> {
  try {
    const packageObject = await client.getObject({
      id: packageId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (packageObject.error) {
      return {
        exists: false,
        error: packageObject.error.code || 'Package not found',
      };
    }

    return { exists: true };
  } catch (error: any) {
    return {
      exists: false,
      error: error.message || 'Failed to verify package',
    };
  }
}

/**
 * Get helpful error message based on error code
 */
export function getPackageErrorMessage(error: string): string {
  if (error.includes('does not exist')) {
    return `Package ${CONTRACTS.PACKAGE_ID} does not exist on this network. Please ensure the contract is published on testnet, or switch to the correct network.`;
  }
  if (error.includes('Epoch')) {
    return 'The package may have been published on a different network. Please check if you need to publish the contract to testnet first.';
  }
  return error;
}

