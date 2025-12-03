import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletConnection } from './components/WalletConnection';
import { TradingSidebar } from './components/TradingSidebar';
import { OrderForm } from './components/OrderForm';
import { ActiveOrdersList } from './components/ActiveOrdersList';
import { OrderBookView } from './components/OrderBookView';
import { TradingPairsProvider } from './components/TradingPairsProvider';
import { OrderTabProvider } from './contexts/OrderTabContext';
import { EventNotifications } from './components/EventNotifications';

function App() {
  const account = useCurrentAccount();

  return (
    <TradingPairsProvider>
      <OrderTabProvider>
      <div className="min-vh-100 bg-light">
        <EventNotifications />
        <WalletConnection />
        
        <Container className="py-4">
          {!account ? (
            <Alert variant="info">
              Please connect your wallet to continue. Supported wallets: Sui Wallet, Suiet, and Slush Wallet.
            </Alert>
          ) : (
            <Row>
              {/* Sidebar with trading pairs */}
              <Col md={3} className="mb-4">
                <TradingSidebar />
              </Col>
              {/* Main content area */}
              <Col md={9}>
                <Row className="mb-4">
                  <Col md={12}>
                    <OrderBookView />
                  </Col>
                </Row>
                <Row className="my-4">
                  <Col md={5} className="mb-4">
                    <OrderForm />
                  </Col>
                  <Col md={7} className="mb-4">
                    <ActiveOrdersList />
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </Container>
        
        <footer className="text-center py-3 mt-5 bg-dark text-light">
          <Container>
            <small>Orlim - Built for Sui Hackathon 2025</small>
          </Container>
        </footer>
      </div>
      </OrderTabProvider>
    </TradingPairsProvider>
  );
}

export default App;
