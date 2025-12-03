import { useState } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { contractService } from '../services/contractService';
import { useOrderManager } from '../hooks/useOrderManager';
import { useOrderReceipts } from '../hooks/useOrderReceipts';
import { useOrderTab } from '../contexts/OrderTabContext';
import { CreateOrderManager } from './CreateOrderManager';
import { fromRawValue } from '../utils/tradingValidation';
import { getTradingPairByPoolId } from '../constants/contracts';

const CLOCK_OBJECT_ID = '0x6';

function getOrderTypeLabel(orderType: { value: number }): string {
  switch (orderType.value) {
    case 0:
      return 'Standard';
    case 1:
      return 'OCO';
    case 2:
      return 'TIF';
    default:
      return 'Unknown';
  }
}

function getTIFLabel(tif: { value: number }): string {
  switch (tif.value) {
    case 0:
      return 'GTC';
    case 1:
      return 'IOC';
    case 2:
      return 'FOK';
    default:
      return 'Unknown';
  }
}

function getStatusBadge(receipt: any) {
  if (receipt.data.is_fully_filled) {
    return <Badge bg="success">Filled</Badge>;
  }
  if (receipt.data.cancelled_at) {
    return <Badge bg="secondary">Cancelled</Badge>;
  }
  if (!receipt.data.is_active) {
    return <Badge bg="warning">Inactive</Badge>;
  }
  // Check if partially filled
  const quantity = BigInt(receipt.data.quantity || '0');
  const originalQuantity = BigInt(receipt.data.original_quantity || '0');
  if (quantity < originalQuantity && quantity > 0n) {
    return <Badge bg="info">Partially Filled</Badge>;
  }
  return <Badge bg="primary">Active</Badge>;
}

export function ActiveOrdersList() {
  const { orderManagerId } = useOrderManager();
  const { activeReceipts, isLoading: receiptsLoading, refetch: refetchReceipts } = useOrderReceipts();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { activeTab } = useOrderTab();
  
  const [loading, setLoading] = useState<string | null>(null);

  // Get feature information based on active tab
  const getFeatureInfo = () => {
    switch (activeTab) {
      case 'standard':
        return {
          title: 'Standard Limit Order (Feature 1)',
          description: 'Place traditional limit orders with your desired price and quantity. Orders will be executed when the market price reaches your limit price.',
          details: [
            'Set your own limit price',
            'Orders remain active until filled or cancelled',
            'Full control over execution price'
          ]
        };
      case 'oco':
        return {
          title: 'OCO Order (Feature 2)',
          description: 'One-Cancels-Other (OCO) orders allow you to place two linked orders. If one order fills, the other is automatically cancelled, ensuring capital safety.',
          details: [
            'Place Take Profit and Stop Loss orders simultaneously',
            'Automatic cancellation when one order fills',
            'Protect your capital with automated risk management'
          ]
        };
      case 'tif':
        return {
          title: 'Time-in-Force Order (Feature 3)',
          description: 'Time-in-Force (TIF) orders provide execution control with IOC (Immediate-or-Cancel) and FOK (Fill-or-Kill) options.',
          details: [
            'IOC: Fill immediately, cancel remainder',
            'FOK: Fill entirely or cancel completely',
            'Perfect for precise execution requirements'
          ]
        };
      default:
        return {
          title: 'Order Features',
          description: 'Select a tab to learn about different order types.',
          details: []
        };
    }
  };

  const featureInfo = getFeatureInfo();

  const handleCancelByReceipt = async (receiptId: string) => {
    if (!orderManagerId) {
      alert('Order Manager not found');
      return;
    }

    setLoading(receiptId);
    try {
      const tx = contractService.cancelOrderByReceiptTx({
        orderManager: orderManagerId,
        orderReceiptId: receiptId,
        clockObjectId: CLOCK_OBJECT_ID,
      });

      const result = await signAndExecute({ transaction: tx });
      console.log('Order cancelled successfully:', result);
      
      // Refetch receipts
      await refetchReceipts();
      
      // Show success message
      alert(`Order cancelled! TX: ${result.digest.slice(0, 8)}...`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to cancel order: ' + (err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  if (!orderManagerId) {
    return <CreateOrderManager />;
  }

  if (receiptsLoading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Loading orders...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Your Active Orders</strong>
        <Badge bg="info">{activeReceipts.length} active</Badge>
      </Card.Header>
      <Card.Body>
        {activeReceipts.length === 0 ? (
          <Alert variant="info" className="mb-0 text-center">
            <small>No active orders. Place your first order to see it here.</small>
            <br />
            <small className="text-muted">Orders are tracked via OrderReceipt objects (Owned Objects).</small>
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Order Type</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Filled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeReceipts.map((receipt) => {
                  // Convert pool_id from hex string to pool_id format
                  const poolIdHex = receipt.data.pool_id.startsWith('0x') 
                    ? receipt.data.pool_id 
                    : '0x' + receipt.data.pool_id;
                  const pair = getTradingPairByPoolId(poolIdHex);
                  const price = fromRawValue(Number(receipt.data.price || '0'), pair?.quote_asset.decimals || 8);
                  const quantity = fromRawValue(Number(receipt.data.quantity || '0'), pair?.base_asset.decimals || 9);
                  const originalQuantity = fromRawValue(Number(receipt.data.original_quantity || '0'), pair?.base_asset.decimals || 9);
                  const filledQuantity = originalQuantity - quantity;
                  const filledPercent = originalQuantity > 0 ? ((filledQuantity / originalQuantity) * 100).toFixed(1) : '0';

                  return (
                    <tr key={receipt.objectId}>
                      <td className="font-monospace small">
                        <a
                          href={`https://suiscan.xyz/mainnet/object/${receipt.objectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {receipt.objectId.slice(0, 8)}...
                        </a>
                      </td>
                      <td>
                        <Badge bg={receipt.data.order_type.value === 1 ? 'warning' : receipt.data.order_type.value === 2 ? 'info' : 'secondary'}>
                          {getOrderTypeLabel(receipt.data.order_type)}
                        </Badge>
                        {receipt.data.order_type.value === 2 && (
                          <Badge bg="light" text="dark" className="ms-1">
                            {getTIFLabel(receipt.data.time_in_force)}
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg={receipt.data.is_bid ? 'success' : 'danger'}>
                          {receipt.data.is_bid ? 'Buy' : 'Sell'}
                        </Badge>
                      </td>
                      <td>
                        {price.toFixed(6)}
                        {pair && ` ${pair.quote_asset.symbol}`}
                      </td>
                      <td>
                        {quantity.toFixed(6)}
                        {pair && ` ${pair.base_asset.symbol}`}
                      </td>
                      <td>
                        <small>
                          {filledQuantity > 0 ? `${filledQuantity.toFixed(6)} (${filledPercent}%)` : '0'}
                        </small>
                      </td>
                      <td>{getStatusBadge(receipt)}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleCancelByReceipt(receipt.objectId)}
                          disabled={loading === receipt.objectId || receipt.data.is_fully_filled}
                        >
                          {loading === receipt.objectId ? (
                            <Spinner size="sm" />
                          ) : (
                            'Cancel'
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
        
        <Alert variant="info" className="mt-3">
          <strong>{featureInfo.title}</strong>
          <p className="mb-2 mt-2 small">{featureInfo.description}</p>
          {featureInfo.details.length > 0 && (
            <ul className="mb-0 small">
              {featureInfo.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
          <div className="mt-2 pt-2 border-top">
            <small className="text-muted">
              <strong>Order Ownership (Feature 4):</strong> All orders are represented by OrderReceipt owned objects. 
              You can cancel orders directly by destroying the OrderReceipt object, proving ownership.
            </small>
          </div>
        </Alert>
      </Card.Body>
    </Card>
  );
}
