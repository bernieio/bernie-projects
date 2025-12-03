import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Container, Navbar } from 'react-bootstrap';

export function WalletConnection() {
  const account = useCurrentAccount();

  return (
    <Navbar bg="dark" variant="dark" className="mb-4">
      <Container>
        <Navbar.Brand>
          <strong>Orlim</strong> - Limit Order Manager
        </Navbar.Brand>
        <div className="d-flex align-items-center gap-3">
          {account && (
            <span className="text-light">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </span>
          )}
          <ConnectButton />
        </div>
      </Container>
    </Navbar>
  );
}

