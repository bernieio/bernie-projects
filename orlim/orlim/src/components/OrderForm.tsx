import { useState, useMemo, useEffect } from 'react';
import { Card, Form, Button, Alert, InputGroup, Badge, Spinner, Nav, Tab } from 'react-bootstrap';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { contractService } from '../services/contractService';
import { useOrderManager } from '../hooks/useOrderManager';
import { useSuiPrice } from '../hooks/useSuiPrice';
import { useTradingPairs } from '../hooks/useTradingPairs';
import { useOrderTab, type OrderTab } from '../contexts/OrderTabContext';
import { CreateOrderManager } from './CreateOrderManager';
import { validateOrderParams, formatTokenAmount, fromRawValue } from '../utils/tradingValidation';

const CLOCK_OBJECT_ID = '0x6';

export function OrderForm() {
  const { orderManagerId } = useOrderManager();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const { price: suiPrice, loading: priceLoading, error: priceError } = useSuiPrice();
  const { selectedPair } = useTradingPairs();
  const { activeTab, setActiveTab } = useOrderTab();
  
  // Standard order state
  const [quantity, setQuantity] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [isBid, setIsBid] = useState(true);
  
  // OCO order state
  const [ocoTakeProfitPrice, setOcoTakeProfitPrice] = useState('');
  const [ocoStopLossPrice, setOcoStopLossPrice] = useState('');
  const [ocoQuantity, setOcoQuantity] = useState('');
  
  // TIF order state
  const [tifPrice, setTifPrice] = useState('');
  const [tifQuantity, setTifQuantity] = useState('');
  const [tifType, setTifType] = useState<'IOC' | 'FOK'>('IOC');
  const [tifIsBid, setTifIsBid] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when pair changes
  useEffect(() => {
    setQuantity('');
    setPriceInput('');
    setOcoTakeProfitPrice('');
    setOcoStopLossPrice('');
    setOcoQuantity('');
    setTifPrice('');
    setTifQuantity('');
    setError('');
    setSuccess('');
  }, [selectedPair.pool_id]);

  // Auto-calculate Amount from Quantity and Price
  const calculatedAmount = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(priceInput) || (selectedPair.quote_asset.symbol === 'SUI' ? suiPrice : 0);
    return qty * price;
  }, [quantity, priceInput, suiPrice, selectedPair]);

  // Get step size based on decimals
  const quantityStep = useMemo(() => {
    return Math.pow(10, -selectedPair.base_asset.decimals);
  }, [selectedPair.base_asset.decimals]);

  const priceStep = useMemo(() => {
    return Math.pow(10, -selectedPair.quote_asset.decimals);
  }, [selectedPair.quote_asset.decimals]);

  // Handle Standard Order
  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!orderManagerId) {
      setError('Please create an Order Manager first');
      return;
    }

    const quantityNum = parseFloat(quantity);
    const defaultPrice = selectedPair.quote_asset.symbol === 'SUI' ? suiPrice : 0;
    const priceNum = parseFloat(priceInput) || defaultPrice;

    if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    const validation = validateOrderParams(quantityNum, priceNum, selectedPair);
    if (!validation.valid) {
      setError('Validation failed: ' + validation.errors.join(', '));
      return;
    }

    setLoading(true);
    try {
      const tx = contractService.placeOrderTx({
        orderManager: orderManagerId,
        poolId: selectedPair.pool_id,
        price: priceNum,
        quantity: quantityNum,
        isBid: isBid,
        clockObjectId: CLOCK_OBJECT_ID,
      });

      const result = await signAndExecute({ transaction: tx });
      setSuccess(`Order placed! TX: ${result.digest.slice(0, 8)}...`);
      setPriceInput('');
      setQuantity('');
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Handle OCO Order
  const handleOCOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!orderManagerId) {
      setError('Please create an Order Manager first');
      return;
    }

    const qty = parseFloat(ocoQuantity);
    const tpPrice = parseFloat(ocoTakeProfitPrice);
    const slPrice = parseFloat(ocoStopLossPrice);

    if (!ocoQuantity || isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (isNaN(tpPrice) || tpPrice <= 0) {
      setError('Please enter a valid Take Profit price');
      return;
    }

    if (isNaN(slPrice) || slPrice <= 0) {
      setError('Please enter a valid Stop Loss price');
      return;
    }

    // For OCO: both orders should be sell orders (if buying) or buy orders (if selling)
    // Typically: Take Profit = sell at higher price, Stop Loss = sell at lower price
    setLoading(true);
    try {
      const tx = contractService.placeOCOOrderTx({
        orderManager: orderManagerId,
        poolId: selectedPair.pool_id,
        order1Price: tpPrice,
        order1Quantity: qty,
        order1IsBid: false, // Take Profit is a sell order
        order2Price: slPrice,
        order2Quantity: qty,
        order2IsBid: false, // Stop Loss is a sell order
        clockObjectId: CLOCK_OBJECT_ID,
      });

      const result = await signAndExecute({ transaction: tx });
      setSuccess(`OCO Order placed! TX: ${result.digest.slice(0, 8)}...`);
      setOcoTakeProfitPrice('');
      setOcoStopLossPrice('');
      setOcoQuantity('');
    } catch (err: any) {
      setError(err.message || 'Failed to place OCO order');
    } finally {
      setLoading(false);
    }
  };

  // Handle TIF Order
  const handleTIFSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!orderManagerId || !account) {
      setError('Please create an Order Manager and connect wallet first');
      return;
    }

    const qty = parseFloat(tifQuantity);
    const price = parseFloat(tifPrice);

    if (!tifQuantity || isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    // TIF orders require coins - for now, we'll show an error
    // In production, you'd need to fetch user's coins and pass them
    setError('TIF orders require coin objects. This feature needs coin selection UI.');
    return;

    // TODO: Implement coin selection
    // const baseCoin = await getCoinObject(...);
    // const quoteCoin = await getCoinObject(...);
    
    // setLoading(true);
    // try {
    //   const tx = contractService.placeTIFOrderTx({
    //     orderManager: orderManagerId,
    //     poolId: selectedPair.pool_id,
    //     price: price,
    //     quantity: qty,
    //     isBid: tifIsBid,
    //     tifType: tifType,
    //     baseCoin: baseCoin,
    //     quoteCoin: quoteCoin,
    //     clockObjectId: CLOCK_OBJECT_ID,
    //   });
    //   const result = await signAndExecute({ transaction: tx });
    //   setSuccess(`TIF Order placed! TX: ${result.digest.slice(0, 8)}...`);
    // } catch (err: any) {
    //   setError(err.message || 'Failed to place TIF order');
    // } finally {
    //   setLoading(false);
    // }
  };

  if (!orderManagerId) {
    return <CreateOrderManager />;
  }

  const pairLabel = `${selectedPair.base_asset.symbol}/${selectedPair.quote_asset.symbol}`;
  const minSizeHuman = fromRawValue(selectedPair.trading_params.min_size, selectedPair.base_asset.decimals);
  const showSuiPrice = selectedPair.quote_asset.symbol === 'SUI';

  return (
    <Card>
      <Card.Header>
        <strong>Place Limit Order - {pairLabel}</strong>
        {showSuiPrice && (
          <>
            <Badge bg="info" className="ms-2">
              SUI Price: {priceLoading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Loading...
                </>
              ) : (
                `$${suiPrice.toFixed(4)}`
              )}
            </Badge>
          </>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {priceError && showSuiPrice && (
          <Alert variant="warning" className="small">
            {priceError}
          </Alert>
        )}

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k as OrderTab)}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="standard">Standard</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="oco">OCO</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="tif">TIF (IOC/FOK)</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Standard Limit Order Tab */}
            <Tab.Pane eventKey="standard">
              <Form onSubmit={handleStandardSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Limit Order</strong> - {isBid ? 'Buy' : 'Sell'} {selectedPair.base_asset.symbol}
            </Form.Label>
            <Form.Select
              value={isBid ? 'buy' : 'sell'}
              onChange={(e) => setIsBid(e.target.value === 'buy')}
            >
              <option value="buy">Buy {selectedPair.base_asset.symbol} with {selectedPair.quote_asset.symbol}</option>
              <option value="sell">Sell {selectedPair.base_asset.symbol} for {selectedPair.quote_asset.symbol}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantity ({selectedPair.base_asset.symbol})</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                step={quantityStep}
                placeholder={`Enter ${selectedPair.base_asset.symbol} quantity`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <InputGroup.Text>{selectedPair.base_asset.symbol}</InputGroup.Text>
            </InputGroup>
            <Form.Text className="text-muted">
              Minimum: {minSizeHuman} {selectedPair.base_asset.symbol}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
                  <Form.Label>Amount ({selectedPair.quote_asset.symbol})</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                value={calculatedAmount > 0 ? formatTokenAmount(calculatedAmount, selectedPair.quote_asset.decimals) : '0.00'}
                readOnly
                className="bg-light"
              />
              <InputGroup.Text>{selectedPair.quote_asset.symbol}</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
                  <Form.Label>Price ({selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol})</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                step={priceStep}
                placeholder={showSuiPrice ? `Use market price: ${suiPrice.toFixed(4)}` : 'Enter price'}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
              />
              <InputGroup.Text>{selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol}</InputGroup.Text>
            </InputGroup>
            <Form.Text className="text-muted">
                    {showSuiPrice ? `Leave empty to use market price: $${suiPrice.toFixed(4)}` : 'Enter limit price'}
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
                  disabled={loading}
            className="w-100"
          >
            {loading ? 'Placing Order...' : 'Place Limit Order'}
          </Button>
        </Form>
            </Tab.Pane>

            {/* OCO Order Tab */}
            <Tab.Pane eventKey="oco">
              <Form onSubmit={handleOCOSubmit}>
                <Alert variant="info" className="small">
                  <strong>OCO (One-Cancels-Other):</strong> If Take Profit order fills, Stop Loss will be automatically cancelled. Ensures capital safety.
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>Quantity ({selectedPair.base_asset.symbol})</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step={quantityStep}
                      placeholder={`Enter ${selectedPair.base_asset.symbol} quantity`}
                      value={ocoQuantity}
                      onChange={(e) => setOcoQuantity(e.target.value)}
                      required
                    />
                    <InputGroup.Text>{selectedPair.base_asset.symbol}</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Take Profit Price ({selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol})</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step={priceStep}
                      placeholder="e.g., 1.5"
                      value={ocoTakeProfitPrice}
                      onChange={(e) => setOcoTakeProfitPrice(e.target.value)}
                      required
                    />
                    <InputGroup.Text>{selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol}</InputGroup.Text>
                  </InputGroup>
                  <Form.Text className="text-muted">Sell at this price to take profit</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Stop Loss Price ({selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol})</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step={priceStep}
                      placeholder="e.g., 0.8"
                      value={ocoStopLossPrice}
                      onChange={(e) => setOcoStopLossPrice(e.target.value)}
                      required
                    />
                    <InputGroup.Text>{selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol}</InputGroup.Text>
                  </InputGroup>
                  <Form.Text className="text-muted">Sell at this price to limit losses</Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Placing OCO Order...' : 'Place OCO Order'}
                </Button>
              </Form>
            </Tab.Pane>

            {/* TIF Order Tab */}
            <Tab.Pane eventKey="tif">
              <Form onSubmit={handleTIFSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Time-in-Force Order</strong> - {tifIsBid ? 'Buy' : 'Sell'} {selectedPair.base_asset.symbol}
                  </Form.Label>
                  <Form.Select
                    value={tifIsBid ? 'buy' : 'sell'}
                    onChange={(e) => setTifIsBid(e.target.value === 'buy')}
                  >
                    <option value="buy">Buy {selectedPair.base_asset.symbol} with {selectedPair.quote_asset.symbol}</option>
                    <option value="sell">Sell {selectedPair.base_asset.symbol} for {selectedPair.quote_asset.symbol}</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>TIF Type</Form.Label>
                  <Form.Select
                    value={tifType}
                    onChange={(e) => setTifType(e.target.value as 'IOC' | 'FOK')}
                  >
                    <option value="IOC">IOC (Immediate-or-Cancel) - Fill immediately, cancel remainder</option>
                    <option value="FOK">FOK (Fill-or-Kill) - Fill entirely or cancel</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quantity ({selectedPair.base_asset.symbol})</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step={quantityStep}
                      placeholder={`Enter ${selectedPair.base_asset.symbol} quantity`}
                      value={tifQuantity}
                      onChange={(e) => setTifQuantity(e.target.value)}
                      required
                    />
                    <InputGroup.Text>{selectedPair.base_asset.symbol}</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price ({selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol})</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step={priceStep}
                      placeholder="Enter price"
                      value={tifPrice}
                      onChange={(e) => setTifPrice(e.target.value)}
                      required
                    />
                    <InputGroup.Text>{selectedPair.quote_asset.symbol}/{selectedPair.base_asset.symbol}</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Placing TIF Order...' : 'Place TIF Order'}
                </Button>
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
}
