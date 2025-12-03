import { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { contractService } from '../services/contractService';
import { verifyPackageExists, getPackageErrorMessage } from '../utils/packageVerifier';

const CLOCK_OBJECT_ID = '0x6';

export function CreateOrderManager() {
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [packageExists, setPackageExists] = useState(false);

  // Verify package exists on mount
  useEffect(() => {
    const checkPackage = async () => {
      setVerifying(true);
      const result = await verifyPackageExists(client);
      setPackageExists(result.exists);
      if (!result.exists && result.error) {
        setError(getPackageErrorMessage(result.error));
      }
      setVerifying(false);
    };
    checkPackage();
  }, [client]);

  const handleCreate = async () => {
    setError('');
    try {
      const tx = contractService.createOrderManagerTx(CLOCK_OBJECT_ID);
      await signAndExecute({
        transaction: tx,
      });
      setSuccess(true);
      // Refresh will happen automatically via useOrderManager hook
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create Order Manager';
      setError(getPackageErrorMessage(errorMsg));
    }
  };

  if (success) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="success">
            Order Manager created successfully! You can now place orders.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (verifying) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Verifying contract...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <strong>Setup Required</strong>
      </Card.Header>
      <Card.Body>
        <p>You need to create an Order Manager before you can place limit orders.</p>
        
        {error && (
          <Alert variant="danger" className="mt-3">
            <Alert.Heading>Error</Alert.Heading>
            {error}
            <hr />
            <div className="small">
              <strong>Solution:</strong>
              <ul className="mb-0 mt-2">
                <li>Ensure the Orlim contract is published on testnet</li>
                <li>Verify the package ID in <code>src/constants/contracts.ts</code></li>
                <li>Check the transaction on{' '}
                  <a 
                    href={`https://suiscan.xyz/testnet/object/0x9a9f7a59d3024a19aed90be0d7295fc2283c3b0e356a92f7317f08a98a613445`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SuiScan
                  </a>
                </li>
              </ul>
            </div>
          </Alert>
        )}
        
        {!packageExists && !error && (
          <Alert variant="warning" className="mt-3">
            <strong>Package not found on testnet.</strong> Please publish the contract first.
          </Alert>
        )}

        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={isPending || !packageExists}
          className="w-100 mt-3"
        >
          {isPending ? (
            <>
              <Spinner size="sm" className="me-2" />
              Creating...
            </>
          ) : (
            'Create Order Manager'
          )}
        </Button>
      </Card.Body>
    </Card>
  );
}

