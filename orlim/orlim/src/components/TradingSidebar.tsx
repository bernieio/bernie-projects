import { Card, ListGroup, Badge } from 'react-bootstrap';
import { useTradingPairs } from '../hooks/useTradingPairs';
import { useSuiPrice } from '../hooks/useSuiPrice';
import { useDeepBook } from '../hooks/useDeepBook';
import './TradingSidebar.css';

export function TradingSidebar() {
  const { activeTabs, selectedPairId, selectPairByTabId } = useTradingPairs();
  const { price: suiPrice } = useSuiPrice();
  // Only fetch order book for selected pair to avoid multiple API calls
  const selectedTab = activeTabs.find((tab) => tab.id === selectedPairId);
  const { orderBook: selectedOrderBook } = useDeepBook(selectedTab?.pair.pool_id || activeTabs[0]?.pair.pool_id || '');

  return (
    <Card className="h-100">
      <Card.Header>
        <strong>Trading Pairs</strong>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {activeTabs.map((tab) => {
            // Only show order book data for selected pair to optimize performance
            const orderBookData = tab.id === selectedPairId ? selectedOrderBook : null;
            return (
              <PairTabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === selectedPairId}
                onSelect={() => selectPairByTabId(tab.id)}
                suiPrice={suiPrice}
                orderBook={orderBookData}
              />
            );
          })}
        </ListGroup>
      </Card.Body>
      {/* Future: Add "+ Add Pair" button here */}
      {/* <Card.Footer>
        <Button variant="outline-primary" size="sm" className="w-100">
          + Add Pair
        </Button>
      </Card.Footer> */}
    </Card>
  );
}

interface PairTabItemProps {
  tab: {
    id: string;
    pair: {
      pool_id: string;
      pool_name: string;
      base_asset: { symbol: string };
      quote_asset: { symbol: string };
    };
  };
  isActive: boolean;
  onSelect: () => void;
  suiPrice: number;
  orderBook: { midPrice: number; bids: Array<{ quantity: number }>; asks: Array<{ quantity: number }> } | null;
}

function PairTabItem({ tab, isActive, onSelect, suiPrice, orderBook }: PairTabItemProps) {
  const pairLabel = `${tab.pair.base_asset.symbol}/${tab.pair.quote_asset.symbol}`;

  // Calculate volume from order book (simplified) - only if order book is loaded
  const volume = orderBook
    ? orderBook.bids.slice(0, 5).reduce((sum, level) => sum + level.quantity, 0) +
      orderBook.asks.slice(0, 5).reduce((sum, level) => sum + level.quantity, 0)
    : 0;

  // Get price preview (mid price or last price)
  const pricePreview = orderBook?.midPrice || 0;

  return (
    <ListGroup.Item
      action
      active={isActive}
      onClick={onSelect}
      className="pair-tab-item"
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>{pairLabel}</strong>
          {tab.pair.quote_asset.symbol === 'SUI' && (
            <small className="d-block text-muted">
              ${suiPrice.toFixed(4)}
            </small>
          )}
        </div>
        <div className="text-end">
          {pricePreview > 0 && (
            <Badge bg={isActive ? 'light' : 'secondary'} className="mb-1">
              {pricePreview.toFixed(6)}
            </Badge>
          )}
          {volume > 0 && (
            <small className="d-block text-muted">
              Vol: {volume.toFixed(2)}
            </small>
          )}
        </div>
      </div>
    </ListGroup.Item>
  );
}

