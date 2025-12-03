// Network configuration
export const NETWORK_CONFIG = {
  defaultNetwork: 'mainnet' as const,
  networks: {
    testnet: {
      name: 'testnet',
      url: 'https://fullnode.testnet.sui.io:443',
    },
    mainnet: {
      name: 'mainnet',
      url: 'https://fullnode.mainnet.sui.io:443',
    },
    devnet: {
      name: 'devnet',
      url: 'https://fullnode.devnet.sui.io:443',
    },
  },
} as const;

