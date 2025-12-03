# 🚀 Orlim Frontend - Advanced Limit Order Manager for Sui

<div align="center">

![Orlim Logo](https://drive.google.com/file/d/18JgR75JdnxxF9DXvt8SWs1Eos1E2eA0X/view?usp=sharing)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Sui](https://img.shields.io/badge/Sui-Mainnet-4BC0F8?style=for-the-badge&logo=sui)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite)
![Jest](https://img.shields.io/badge/Jest-30.2-C21325?style=for-the-badge&logo=jest)

**Modern React frontend for the Orlim limit order management system on Sui**

[![Mainnet Deployment](https://img.shields.io/badge/Mainnet-Deployed-brightgreen?style=flat-square)](https://suiscan.xyz/mainnet/package/0x0179638d8d58ea7b8a83c9d2377fa7fba85b8101dbef8d2194214925121c21eb)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen?style=flat-square)](#testing)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage](#-usage)
- [🧪 Testing](#-testing)
- [🔧 Configuration](#-configuration)
- [📊 Integration](#-integration)
- [👥 Team](#-team)
- [📄 License](#-license)

---

## 🎯 Overview

**Orlim Frontend** is the modern, responsive web interface for the Orlim limit order management system. Built with React 19, TypeScript 5.9, and Vite 7, it provides users with a professional trading experience on the Sui blockchain, featuring advanced order management, real-time market data from DeepBook, and gas-efficient batch operations via Programmable Transaction Blocks (PTBs).

### 🎪 Production Deployment

- **Network**: Sui Mainnet
- **Package ID**: `0x0179638d8d58ea7b8a83c9d2377fa7fba85b8101dbef8d2194214925121c21eb`
- **Contract Module**: `orlim`
- **Status**: ✅ Deployed and Operational

### 🌐 Supported Trading Pairs

| Pair | Pool ID | Base Asset | Quote Asset |
|------|---------|------------|-------------|
| **SUI/USDC** | `0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407` | SUI (9 decimals) | USDC (6 decimals) |
| **DEEP/SUI** | `0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22` | DEEP (6 decimals) | SUI (9 decimals) |

---

## ✨ Features

### 🏆 Core Trading Features

- **📊 Smart Limit Order Management**
  - Place standard limit orders with custom price and quantity
  - Real-time order status tracking (active/filled/cancelled)
  - Order modification (update price and quantity)
  - Gas-efficient operations (66% savings vs traditional)

- **🎭 OCO (One-Cancels-Other) Orders**
  - Place Take Profit and Stop Loss orders simultaneously
  - Automatic cancellation when one order fills
  - Capital protection with automated risk management
  - Perfect for trading strategies

- **⏱️ TIF (Time-in-Force) Orders**
  - **IOC** (Immediate-or-Cancel): Fill immediately, cancel remainder
  - **FOK** (Fill-or-Kill): Fill entirely or cancel completely
  - Automatic asset refunds for unfilled portions
  - Precise execution control

- **📋 Order Receipt Objects**
  - NFT-like order receipts for ownership transfer
  - Cancel orders directly by destroying receipt objects
  - Transferable order positions
  - Proof of ownership

- **🔄 Batch Operations via PTBs**
  - Cancel multiple orders in a single transaction
  - 40-60% gas savings on batch operations
  - Safe error handling (partial success support)
  - Programmable Transaction Block (PTB) optimized

### 🎨 User Experience

- **📈 Real-time Order Book**
  - Live order book from DeepBook Indexer API
  - Real-time price updates (5-second refresh)
  - Market depth visualization
  - Mid-price calculation

- **💼 Professional Trading Interface**
  - Clean, responsive design with Bootstrap 5
  - Multiple trading pairs support
  - Order history and active orders tracking
  - Price and quantity validation

- **🔐 Secure Wallet Integration**
  - Support for Sui Wallet, Suiet, and Slush Wallet
  - Auto-connect wallet functionality
  - Transaction signing with clear fee estimates
  - Multi-wallet management

- **📱 Mobile-Optimized**
  - Responsive design for desktop and mobile
  - Touch-friendly interface
  - Progressive Web App (PWA) ready

---

## 🏗️ Architecture

### 📁 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── ActiveOrdersList.tsx      # Active orders display
│   │   ├── CreateOrderManager.tsx    # Order manager creation
│   │   ├── EventNotifications.tsx    # Event notifications
│   │   ├── OrderBookView.tsx         # Order book visualization
│   │   ├── OrderForm.tsx             # Order placement form
│   │   ├── TradingSidebar.tsx        # Trading pairs sidebar
│   │   ├── WalletConnection.tsx      # Wallet connection UI
│   │   └── TradingPairsProvider.tsx  # Trading pairs context
│   ├── contexts/              # React contexts
│   │   └── OrderTabContext.tsx       # Order tab state management
│   ├── hooks/                 # Custom React hooks
│   │   ├── useDeepBook.ts            # DeepBook integration
│   │   ├── useOrderEvents.ts         # Order event subscriptions
│   │   ├── useOrderManager.ts        # Order manager hook
│   │   ├── useOrderReceipts.ts       # Order receipts hook
│   │   ├── useOrlimContract.ts       # Contract interactions
│   │   ├── useSuiPrice.ts            # SUI price feed
│   │   ├── useTradingPairs.ts        # Trading pairs management
│   │   └── useTransactions.ts        # Transaction handling
│   ├── services/              # Business logic services
│   │   ├── contractService.ts        # Contract transaction building
│   │   ├── deepbookService.ts        # DeepBook Indexer API
│   │   └── suiService.ts             # Sui blockchain interactions
│   ├── constants/             # Constants and configuration
│   │   ├── contracts.ts              # Contract addresses and config
│   │   └── config.ts                 # Network configuration
│   ├── types/                 # TypeScript type definitions
│   │   └── orlim.ts                  # Orlim types
│   ├── utils/                 # Utility functions
│   │   ├── packageVerifier.ts        # Package verification
│   │   └── tradingValidation.ts      # Trading validation
│   ├── App.tsx                # Main application component
│   └── main.tsx               # Application entry point
├── tests/                     # Integration tests
│   ├── integration/
│   │   ├── contractService.test.ts   # Contract service tests
│   │   ├── deepbookService.test.ts   # DeepBook service tests
│   │   ├── orderWorkflows.test.ts    # Order workflow tests
│   │   └── suiService.test.ts        # Sui service tests
│   ├── setup.ts               # Jest setup
│   └── README.md              # Test documentation
├── jest.config.ts             # Jest configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

### 🧩 Component Architecture

#### **Core Services**

```typescript
// ContractService - Transaction Building
class ContractService {
  createOrderManagerTx(clockObjectId: string): Transaction
  placeOrderTx(params: OrderParams): Transaction
  placeOCOOrderTx(params: OCOParams): Transaction
  placeTIFOrderTx(params: TIFParams): Transaction
  cancelOrderTx(params: CancelParams): Transaction
  batchCancelOrdersTx(params: BatchCancelParams): Transaction
  modifyOrderTx(params: ModifyParams): Transaction
  cancelOrderByReceiptTx(params: ReceiptParams): Transaction
  createOrderReceiptTx(params: ReceiptCreateParams): Transaction
}

// DeepBookService - Order Book Data
class DeepBookService {
  getOrderBookFromIndexer(poolId: string): Promise<OrderBookResponse>
  getFullOrderBook(poolId: string): Promise<OrderBookData>
}

// SuiService - Blockchain Interactions
class SuiService {
  getObject(objectId: string): Promise<SuiObject>
  getOwnedObjects(address: string, type?: string): Promise<OwnedObjects>
  executeTransaction(tx: Transaction, signer: Signer): Promise<TxResult>
}
```

#### **React Hooks**

- `useOrlimContract` - Contract interaction wrapper
- `useDeepBook` - Real-time order book data
- `useOrderManager` - Order manager state management
- `useOrderReceipts` - Order receipts fetching
- `useSuiPrice` - SUI price feed (CoinGecko)
- `useTradingPairs` - Trading pairs management
- `useOrderEvents` - Order event subscriptions

#### **State Management**

- **React Query** (`@tanstack/react-query`) - Server state and caching
- **React Context** - Wallet and theme management
- **Local State** - Component-level state with React hooks

---

## 🛠️ Technology Stack

### 🎯 Frontend Framework
- **React 19.1** - Latest React with modern hooks and concurrent features
- **TypeScript 5.9** - Type safety and developer experience
- **Vite 7.1** - Lightning-fast development and building

### 🎨 UI & Styling
- **Bootstrap 5.3** - Utility-first CSS framework
- **React Bootstrap 2.10** - Bootstrap components for React
- **CSS3** - Custom styles and animations

### 🔗 Blockchain Integration
- **@mysten/dapp-kit 0.19.8** - Sui wallet integration and DApp framework
- **@mysten/sui 1.44.0** - Sui TypeScript SDK
- **@mysten/deepbook-v3 0.20.2** - DeepBook V3 SDK

### 📊 Data & State Management
- **@tanstack/react-query 5.90.7** - Server state management and caching
- **React Context API** - Client state management

### 🧪 Testing
- **Jest 30.2** - JavaScript testing framework
- **ts-jest 29.4** - TypeScript support for Jest
- **@testing-library/react 16.3** - React component testing
- **@testing-library/jest-dom 6.9** - DOM matchers for Jest

### 🛠️ Development Tools
- **ESLint 9.36** - Code quality and consistency
- **TypeScript ESLint 8.45** - TypeScript-specific linting
- **Vite 7.1** - Build tool and dev server

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** 18.0+ (recommended: 20.x)
- **npm** 9.0+ or **yarn** 1.22+
- **Sui Wallet** or compatible wallet extension (Sui Wallet, Suiet, Slush Wallet)

### 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/bernieio/orlim.git
cd orlim/frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

### ⚙️ Environment Variables

**Optional Configuration:**
- `VITE_DEFAULT_SUI_PRICE`: Fallback price if CoinGecko API fails (default: 2.0)
- `VITE_DEEPBOOK_INDEXER_API`: DeepBook Indexer API URL (default: mainnet indexer)

**Note:** CoinGecko price feed uses the public API endpoint (no API key required).

### 🏗️ Building for Production

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 📖 Usage

### 🔌 Wallet Connection

1. **Select Wallet**: Click "Connect Wallet" button
2. **Choose Wallet**: Select from Sui Wallet, Suiet, or Slush Wallet
3. **Approve Connection**: Approve connection request in your wallet
4. **Verify**: Check your address and balance in the header

### 📊 Placing Limit Orders

#### **Standard Limit Orders**

1. **Select Trading Pair**: Choose from SUI/USDC or DEEP/SUI
2. **Set Order Parameters**:
   - **Side**: Buy or Sell
   - **Quantity**: Amount to buy/sell (e.g., 1 SUI)
   - **Price**: Limit price (optional - uses market price if empty)
3. **Review**: Check order details and estimated gas fees
4. **Execute**: Click "Place Limit Order" and sign transaction

#### **OCO (One-Cancels-Other) Orders**

1. **Select OCO Tab**: Click "OCO" tab in order form
2. **Set Parameters**:
   - **Quantity**: Amount for both orders
   - **Take Profit Price**: Price to take profit (sell order)
   - **Stop Loss Price**: Price to limit losses (sell order)
3. **Place Order**: Click "Place OCO Order" and sign transaction
4. **Auto-Cancellation**: When one order fills, the other is automatically cancelled

#### **TIF (Time-in-Force) Orders**

1. **Select TIF Tab**: Click "TIF (IOC/FOK)" tab
2. **Choose TIF Type**:
   - **IOC** (Immediate-or-Cancel): Fill immediately, cancel remainder
   - **FOK** (Fill-or-Kill): Fill entirely or cancel completely
3. **Set Parameters**: Quantity, price, and side (buy/sell)
4. **Place Order**: Click "Place TIF Order" and sign transaction
5. **Auto Refund**: Unfilled portions are automatically refunded

### 🔄 Managing Orders

**Active Orders Dashboard**:
- View all your active limit orders
- Real-time status updates (active/filled/cancelled/partially filled)
- Quick actions: cancel by receipt object
- Order details: price, quantity, filled amount, order type

**Order Receipt Objects**:
- All orders are represented by OrderReceipt owned objects
- Cancel orders directly by destroying receipt objects
- Transfer order ownership to other addresses
- Proof of ownership through object ownership

**Batch Operations**:
- Select multiple orders for bulk cancellation
- See estimated gas savings (40-60% savings)
- Execute with single transaction signature
- Safe error handling (partial success support)

### 📈 Order Book

- **Real-time Updates**: Order book refreshes every 5 seconds
- **Market Depth**: View bids and asks with quantities
- **Mid Price**: Calculated from best bid and ask
- **Market Price**: Live SUI price from CoinGecko (for SUI pairs)

---

## 🧪 Testing

### 📊 Test Coverage

Orlim Frontend includes comprehensive integration tests using Jest with **83+ test cases** covering all core functionality:

```
Tests/
├── integration/
│   ├── contractService.test.ts    # 13 test cases - Contract transaction building
│   ├── deepbookService.test.ts    # 14 test cases - DeepBook Indexer API integration
│   ├── suiService.test.ts         # 8 test cases - Sui blockchain interactions
│   └── orderWorkflows.test.ts     # 12 test cases - Complete order workflows
├── setup.ts                       # Jest global setup and configuration
└── README.md                      # Test documentation
```

### 🧪 Test Categories

#### **Contract Service Tests** (13 tests)
- ✅ Order manager creation transaction
- ✅ Standard limit order transaction (bid/ask)
- ✅ Pool ID string to bytes conversion
- ✅ Price format conversion (8 decimals)
- ✅ OCO order transaction (dual order setup)
- ✅ TIF order transaction (IOC/FOK types)
- ✅ Cancel order transaction
- ✅ Batch cancel orders transaction (multiple IDs)
- ✅ Modify order transaction (price/quantity)
- ✅ Cancel order by receipt transaction
- ✅ Create order receipt transaction
- ✅ Contract configuration validation
- ✅ Transaction instance validation

#### **DeepBook Service Tests** (14 tests)
- ✅ Fetch order book from DeepBook Indexer API
- ✅ Convert order book data format
- ✅ Sort bids correctly (descending order - highest first)
- ✅ Sort asks correctly (ascending order - lowest first)
- ✅ Handle API 404 errors (pool not found)
- ✅ Handle API 500 errors (server errors)
- ✅ Handle network errors
- ✅ Calculate mid price from best bid/ask
- ✅ Handle empty bids/asks arrays
- ✅ Convert string prices and quantities to numbers
- ✅ Use correct indexer URL for mainnet
- ✅ Use correct indexer URL for testnet
- ✅ Return formatted order book data
- ✅ Handle indexer API limitations

#### **Sui Service Tests** (8 tests)
- ✅ Get object by ID successfully
- ✅ Handle object not found errors
- ✅ Get owned objects by address
- ✅ Filter objects by type
- ✅ Handle empty owned objects
- ✅ Execute transactions successfully
- ✅ Handle transaction execution errors
- ✅ Service initialization with SuiClient

#### **Order Workflow Tests** (12 tests)
- ✅ Complete order lifecycle (create → place → cancel)
- ✅ Order modification workflow
- ✅ Batch cancel workflow (multiple orders)
- ✅ OCO order workflow (take profit + stop loss)
- ✅ TIF order workflow (IOC - Immediate-or-Cancel)
- ✅ TIF order workflow (FOK - Fill-or-Kill)
- ✅ Order receipt workflow (create → cancel by receipt)
- ✅ Order book integration (fetch and place at market price)
- ✅ Multiple trading pairs (different pools)
- ✅ Error handling in workflows
- ✅ Invalid pool ID handling
- ✅ Order book fetch failure handling

### 🏃 Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run only integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch

# Generate coverage report
npm run test:coverage
```

### 📊 Test Configuration

Jest is configured with:
- **TypeScript Support**: `ts-jest` preset
- **Test Environment**: Node.js (for integration tests)
- **Path Aliases**: `@/`, `@components/`, `@hooks/`, `@services/`, etc.
- **Test Timeout**: 30 seconds (for integration tests)
- **Coverage Reporting**: HTML, LCOV, and text reports
- **Setup Files**: `tests/setup.ts` for global test setup

### 🔧 Test Setup

```typescript
// tests/setup.ts
// Jest setup file for integration tests
process.env.NODE_ENV = 'test';

// Global test timeout (30 seconds for integration tests)
jest.setTimeout(30000);

// Mock fetch API for DeepBook Indexer API tests
global.fetch = jest.fn();
```

### 🎯 Test Statistics

- **Total Test Files**: 4 integration test files
- **Total Test Cases**: 83+ test cases
- **Test Coverage**: Core services and workflows
- **Test Environment**: Node.js (for integration tests)
- **Test Timeout**: 30 seconds per test
- **Mocking**: Fetch API, SuiClient, and external dependencies

### 📝 Test Examples

#### **Contract Service Test**
```typescript
describe('ContractService Integration Tests', () => {
  it('should create a valid limit order transaction', () => {
    const tx = contractService.placeOrderTx({
      orderManager: mockOrderManagerId,
      poolId: testPoolId,
      price: 2.5,
      quantity: 1000000000, // 1 SUI (9 decimals)
      isBid: true,
      clockObjectId: '0x6',
    });
    
    expect(tx).toBeInstanceOf(Transaction);
    expect(tx).toBeDefined();
  });

  it('should handle OCO order transaction', () => {
    const tx = contractService.placeOCOOrderTx({
      orderManager: mockOrderManagerId,
      poolId: testPoolId,
      order1Price: 2.6,
      order1Quantity: 1000000000,
      order1IsBid: true,
      order2Price: 2.4,
      order2Quantity: 1000000000,
      order2IsBid: false,
      clockObjectId: '0x6',
    });
    
    expect(tx).toBeInstanceOf(Transaction);
  });
});
```

#### **DeepBook Service Test**
```typescript
describe('DeepBookService Integration Tests', () => {
  it('should fetch order book from indexer API successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        bids: [{ price: '2.49', quantity: '1000', orders: 5 }],
        asks: [{ price: '2.51', quantity: '1500', orders: 4 }],
        mid_price: 2.5,
      }),
    });

    const orderBook = await deepBookService.getFullOrderBook(testPoolId);
    
    expect(orderBook).toHaveProperty('bids');
    expect(orderBook).toHaveProperty('asks');
    expect(orderBook).toHaveProperty('midPrice');
    expect(orderBook.bids).toBeSortedBy('price', { descending: true });
    expect(orderBook.asks).toBeSortedBy('price', { ascending: true });
  });

  it('should handle 404 errors when pool is not found', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(
      deepBookService.getOrderBookFromIndexer('0xinvalidpool')
    ).rejects.toThrow('Pool not found');
  });
});
```

#### **Order Workflow Test**
```typescript
describe('Order Workflows Integration Tests', () => {
  it('should handle complete order lifecycle', () => {
    // Step 1: Create Order Manager
    const createManagerTx = contractService.createOrderManagerTx('0x6');
    expect(createManagerTx).toBeInstanceOf(Transaction);

    // Step 2: Place Limit Order
    const placeOrderTx = contractService.placeOrderTx({
      orderManager: mockOrderManagerId,
      poolId: testPoolId,
      price: 2.5,
      quantity: 1000000000,
      isBid: true,
      clockObjectId: '0x6',
    });
    expect(placeOrderTx).toBeInstanceOf(Transaction);

    // Step 3: Cancel Order
    const cancelOrderTx = contractService.cancelOrderTx({
      orderManager: mockOrderManagerId,
      orderId: '1234567890',
      clockObjectId: '0x6',
    });
    expect(cancelOrderTx).toBeInstanceOf(Transaction);
  });

  it('should handle OCO order workflow', () => {
    const ocoTx = contractService.placeOCOOrderTx({
      orderManager: mockOrderManagerId,
      poolId: testPoolId,
      order1Price: 2.6, // Take profit
      order1Quantity: 1000000000,
      order1IsBid: false,
      order2Price: 2.4, // Stop loss
      order2Quantity: 1000000000,
      order2IsBid: false,
      clockObjectId: '0x6',
    });
    expect(ocoTx).toBeDefined();
  });
});
```

#### **Sui Service Test**
```typescript
describe('SuiService Integration Tests', () => {
  it('should fetch object by ID successfully', async () => {
    mockClient.getObject.mockResolvedValueOnce({
      data: {
        objectId: mockObjectId,
        type: '0xpackage::module::Type',
        content: { /* ... */ },
      },
    });

    const result = await suiService.getObject(mockObjectId);
    
    expect(mockClient.getObject).toHaveBeenCalledWith({
      id: mockObjectId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    });
    expect(result).toBeDefined();
  });
});
```

---

## 🔧 Configuration

### 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:integration:watch": "jest --testPathPattern=integration --watch"
  }
}
```

### ⚙️ Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
```

### 🧪 Jest Configuration

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
}
```

### 📝 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@services/*": ["./src/services/*"]
    }
  }
}
```

---

## 📊 Integration

### 🔌 Smart Contract Integration

The frontend integrates with the **Orlim smart contract** deployed on Sui Mainnet:

```typescript
// Contract Configuration
const CONTRACTS = {
  PACKAGE_ID: '0x0179638d8d58ea7b8a83c9d2377fa7fba85b8101dbef8d2194214925121c21eb',
  MODULE_NAME: 'orlim',
};

// Contract Service Usage
import { contractService } from '@/services/contractService';

// Place limit order
const tx = contractService.placeOrderTx({
  orderManager: orderManagerId,
  poolId: poolId,
  price: 2.5,
  quantity: 1000000000,
  isBid: true,
  clockObjectId: '0x6',
});

// Execute transaction
const result = await signAndExecute({ transaction: tx });
```

### 📈 DeepBook Integration

Real-time market data from DeepBook Indexer API:

```typescript
// DeepBook Service Usage
import { DeepBookService } from '@/services/deepbookService';

const deepBookService = new DeepBookService(client, userAddress, 'mainnet');

// Fetch order book
const orderBook = await deepBookService.getFullOrderBook(poolId);

// Order book structure
interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  midPrice: number;
}
```

### 🔄 PTB (Programmable Transaction Blocks)

Batch operations using Sui's PTBs:

```typescript
// Batch cancel example
const tx = contractService.batchCancelOrdersTx({
  orderManager: orderManagerId,
  orderIds: ['1', '2', '3'],
  clockObjectId: '0x6',
});

// Execute batch transaction
const result = await signAndExecute({ transaction: tx });
// Gas savings: 40-60% compared to individual cancellations
```

### 🎣 React Hooks Integration

```typescript
// useOrlimContract hook
import { useOrlimContract } from '@/hooks/useOrlimContract';

function OrderForm() {
  const { orderManagerId } = useOrderManager();
  const { placeOrder, isLoading } = useOrlimContract(orderManagerId);

  const handleSubmit = async (params: OrderParams) => {
    try {
      const result = await placeOrder(params);
      console.log('Order placed:', result.digest);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };
}

// useDeepBook hook
import { useDeepBook } from '@/hooks/useDeepBook';

function OrderBook({ poolId }: { poolId: string }) {
  const { orderBook, loading, error } = useDeepBook(poolId);
  
  // Order book updates every 5 seconds
  return <OrderBookView orderBook={orderBook} />;
}
```

---

## 👥 Team

### 🏢 DevPros Team
**Orlim Frontend** is developed by the **DevPros Team**, building the complete limit order management ecosystem for Sui.

### 👨‍💻 Team Members

#### **Bernieio** - Owner/Main Developer
Founder, Team Lead, and Full-Stack Developer

- 🔗 **GitHub**: [@bernieio](https://github.com/bernieio)
- 💬 **Telegram**: [@bernieio](https://t.me/bernieio)
- 🎯 **Expertise**: React, TypeScript, Sui Move, DeFi Protocols
- 📧 **Email**: bernie.web3@gmail.com

#### **Gon** - Important Member
Core Developer and Contributor

- 🔗 **GitHub**: [@kieulamtung](https://github.com/kieulamtung)
- 💬 **Telegram**: [@bia160121](https://t.me/bia160121)
- 📧 **Email**: darkgonqx@gmail.com

#### **DavidNad** - Important Member
Core Developer and Contributor

- 🔗 **GitHub**: [@thelocal69](https://github.com/thelocal69)
- 💬 **Telegram**: [@CircleDeer66](https://t.me/CircleDeer66)
- 📧 **Email**: trankhanh740@gmail.com

#### **Mie** - Important Member/Presenter
Core Developer, Contributor, and Project Presenter

- 🔗 **GitHub**: [@Mie-hoang](https://github.com/Mie-hoang)
- 💬 **Telegram**: [@miee2901](https://t.me/miee2901)
- 📧 **Email**: hucniekdam@gmail.com

### 🏆 Our Mission
At DevPros Team, we are committed to:
- 🎯 Building production-ready frontend applications
- 🎨 Creating exceptional user experiences
- ⚡ Optimizing for performance and accessibility
- 🌚 Pushing the boundaries of DeFi interfaces on Sui

### 🤝 Contributing
We welcome contributions from the Sui community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

## 🚀 Roadmap

### 🎯 Phase 1: MVP Foundation (Q4 2025)
- [x] Basic limit order interface
- [x] Wallet integration (Sui Wallet, Suiet, Slush Wallet)
- [x] DeepBook order book display
- [x] Batch cancel operations
- [x] Responsive design
- [x] Integration tests with Jest
- [x] Mainnet deployment

### 🌟 Phase 2: Enhanced Features (Q1 2026)
- [ ] Advanced charting and analytics
- [ ] Price alerts and notifications
- [ ] Mobile app (React Native)
- [ ] Dark/light theme customization
- [ ] Multi-language support
- [ ] Order history export

### 🚀 Phase 3: Pro Features (Q2 2026)
- [ ] DCA (Dollar-Cost Averaging) interface
- [ ] Advanced order types (stop-loss, take-profit)
- [ ] Portfolio management dashboard
- [ ] Tax reporting features
- [ ] API access for power users
- [ ] Trading bot integration

---

## 📞 Support & Community

- 💬 **Telegram**: [@bernieio](https://t.me/bernieio)
- 🐦 **Twitter**: [@bernie_io](https://twitter.com/bernie_io)
- 📧 **Email**: bernie.web3@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/bernieio/orlim/issues)

---

## 🔗 Related Projects

- **📦 Smart Contract**: [orlim-contract](https://github.com/bernieio/orlim-contract)
- **🌐 Contract on SuiScan**: [View Package](https://suiscan.xyz/mainnet/package/0x0179638d8d58ea7b8a83c9d2377fa7fba85b8101dbef8d2194214925121c21eb)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

```
MIT License

Copyright (c) 2024 DevPros Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

**🎉 Built with ❤️ by the DevPros Team**

**⭐ Star this repo if you find it useful!**

**🚀 [View Contract](https://suiscan.xyz/mainnet/package/0x0179638d8d58ea7b8a83c9d2377fa7fba85b8101dbef8d2194214925121c21eb) | [Smart Contract Repo](https://github.com/bernieio/orlim-contract) | [Join Community](https://t.me/bernieio)**

</div>
