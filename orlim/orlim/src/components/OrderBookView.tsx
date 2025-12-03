import { Card, Table, Badge, Spinner } from 'react-bootstrap';
import { useDeepBook } from '../hooks/useDeepBook';
import { useSuiPrice } from '../hooks/useSuiPrice';
import { useTradingPairs } from '../hooks/useTradingPairs';
import { formatTokenAmount } from '../utils/tradingValidation';

export function OrderBookView() {
  const { selectedPair } = useTradingPairs();
  const { orderBook, loading, error } = useDeepBook(selectedPair.pool_id);
  const { price: marketPrice, loading: priceLoading } = useSuiPrice();
  
  const pairLabel = `${selectedPair.base_asset.symbol}/${selectedPair.quote_asset.symbol}`;
  const showMarketPrice = selectedPair.quote_asset.symbol === 'SUI';

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Loading order book...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <p className="text-danger">Error loading order book: {error}</p>
        </Card.Body>
      </Card>
    );
  }

  if (!orderBook) {
    return (
      <Card>
        <Card.Body>
          <p className="text-muted">Connect wallet to view order book</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <strong>Order Book - {pairLabel}</strong>
        {showMarketPrice && (
          <>
            <Badge bg="secondary" className="ms-2">
              Market: {priceLoading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  ...
                </>
              ) : (
                `$${marketPrice.toFixed(4)}`
              )}
            </Badge>
            {!priceLoading && (
              <small className="text-muted ms-2">
                (live)
              </small>
            )}
          </>
        )}
      </Card.Header>
      <Card.Body className="p-0">
        <div className="row g-0">
          {/* Asks */}
          <div className="col-6 border-end">
            <div className="p-2 bg-danger bg-opacity-10">
              <strong className="text-danger">Asks</strong>
            </div>
            <Table size="sm" className="mb-0" responsive="sm">
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {orderBook.asks.slice(0, 10).map((level, idx) => (
                  <tr key={idx} title={`Total: ${formatTokenAmount(level.price * level.quantity, selectedPair.quote_asset.decimals)} ${selectedPair.quote_asset.symbol}`}>
                    <td className="text-danger">
                      {formatTokenAmount(level.price, selectedPair.quote_asset.decimals, 6)}
                    </td>
                    <td>{formatTokenAmount(level.quantity, selectedPair.base_asset.decimals, 2)}</td>
                  </tr>
                ))}
                {orderBook.asks.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-muted">
                      No asks
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Bids */}
          <div className="col-6">
            <div className="p-2 bg-success bg-opacity-10">
              <strong className="text-success">Bids</strong>
            </div>
            <Table size="sm" className="mb-0" responsive="sm">
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {orderBook.bids.slice(0, 10).map((level, idx) => (
                  <tr key={idx} title={`Total: ${formatTokenAmount(level.price * level.quantity, selectedPair.quote_asset.decimals)} ${selectedPair.quote_asset.symbol}`}>
                    <td className="text-success">
                      {formatTokenAmount(level.price, selectedPair.quote_asset.decimals, 6)}
                    </td>
                    <td>{formatTokenAmount(level.quantity, selectedPair.base_asset.decimals, 2)}</td>
                  </tr>
                ))}
                {orderBook.bids.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-muted">
                      No bids
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

