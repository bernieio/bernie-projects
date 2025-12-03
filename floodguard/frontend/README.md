# FloodGuard Protocol - Frontend

> **AI-Powered Decentralized Disaster Response Dashboard**  
> Built with Next.js 16, Sui Blockchain, and Walrus Storage

![FloodGuard Banner](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js) ![Sui](https://img.shields.io/badge/Sui-Testnet-blue?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

---

## 🌊 Overview

FloodGuard Frontend is a production-ready web application for coordinating disaster response efforts using blockchain technology. It provides real-time disaster reporting, AI-powered resource matching, and decentralized evidence storage.

### ✨ Key Features

- **🎯 Real-time Dashboard** - Live updates of disasters, resources, and matches
- **🤖 AI Risk Scoring** - Multi-factor risk assessment using water level, population density, and temporal clustering
- **🔗 Blockchain Integration** - Transparent, immutable disaster records on Sui
- **📦 Walrus Storage** - Decentralized evidence storage with 4 publisher fallback
- **⚡ Smart Matching** - Greedy bipartite algorithm for optimal resource allocation
- **🗺️ Mapbox Integration** - Interactive geohash-based location selection
- **🔄 Auto-Refresh** - 30-second polling for dashboard updates
- **📱 Responsive Design** - Mobile-first UI with modern aesthetics

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Sui Wallet browser extension
- Testnet SUI tokens ([faucet](https://faucet.testnet.sui.io/))

### Installation

```bash
# Clone repository
git clone https://github.com/0xsotaoss/floodguard.git
cd floodguard/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Configuration

Create `.env` file with:

```env
# Mapbox (required for location selection)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Sui Network (default: testnet)
NEXT_PUBLIC_SUI_NETWORK=testnet

# FloodGuard Contract (deployed on Sui testnet)
NEXT_PUBLIC_FLOODGUARD_PACKAGE=0x...
NEXT_PUBLIC_FLOODGUARD_STATE=0x...
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | React meta-framework with SSR/SSG |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework |
| **Blockchain** | Sui SDK (@mysten/sui) | On-chain interactions |
| **Wallet** | DApp Kit (@mysten/dapp-kit) | Wallet connection & signing |
| **Storage** | Walrus (@mysten/walrus) | Decentralized blob storage |
| **Maps** | Mapbox GL JS | Interactive map & geohash |
| **State** | React Hooks + Zustand | Local state management |
| **Icons** | Lucide React | Modern icon library |

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard with tabs
│   │   │   ├── layout.tsx      # Tab navigation
│   │   │   ├── page.tsx        # Overview (LiveDashboard)
│   │   │   ├── offer/page.tsx  # Resource offering
│   │   │   └── match/page.tsx  # Match engine
│   │   ├── report/page.tsx     # Disaster reporting
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   │   └── LiveDashboard.tsx
│   │   ├── location/           # Location picker
│   │   │   └── LocationInput.tsx
│   │   ├── Header.tsx          # Navigation header
│   │   ├── ReportFlood.tsx     # Disaster report form
│   │   ├── OfferForm.tsx       # Resource offer form
│   │   ├── MatchDashboard.tsx  # Resource matching UI
│   │   └── ContractStats.tsx   # On-chain statistics
│   └── lib/
│       ├── clients.ts          # Sui client singleton
│       ├── singletons.ts       # Service singletons
│       ├── suiClient.ts        # FloodGuardClient
│       ├── walrusClient.ts     # Walrus HTTP client
│       ├── aiRiskService.ts    # AI risk scoring
│       ├── matchingEngine.ts   # Resource matching
│       ├── dashboardData.ts    # Data fetching
│       └── config.ts           # Contract addresses
└── public/
    └── logo.svg                # FloodGuard logo
```

---

## 🔥 Performance Optimizations

### Phase 1: Critical Fixes (Completed ✅)

**Problem:** 10x performance degradation after v2 upgrade

**Solutions Implemented:**

1. **True Singleton Pattern**
   - Created `singletons.ts` for all service clients
   - Reduced from 6+ client instances → 1 each
   - Eliminated connection pool exhaustion

2. **Fixed LiveDashboard Infinite Loop**
   - Removed `data` dependency causing cascading re-renders
   - Refresh interval: 10s → 30s
   - CPU usage: 80%+ → <20%

3. **AI Analysis Debounce Optimization**
   - Debounce time: 1s → 3s
   - Reduced API calls by 3x during user input

4. **Walrus Upload Reliability**
   - Fixed 404 error: `/v1/store` → `/v1/blobs`
   - Storage duration: 1 epoch → 5 epochs
   - Added 4 fallback publishers for 99%+ uptime

**Results:**
- Initial page load: 13s → ~2s (**6.5x faster**)
- Memory: Stable (no leaks)
- Build time: ~20-24s (consistent)

### Phase 2: Planned Optimizations

- [ ] `useMemo` for expensive computations
- [ ] React Query for dashboard data caching
- [ ] Lazy load Mapbox (dynamic imports)
- [ ] Code splitting for faster initial load
- [ ] `React.memo` for pure components
- [ ] Bundle size optimization

---

## 📊 Features Deep Dive

### 1. Disaster Reporting (`/report`)

**Flow:**
1. User selects location on Mapbox
2. Sets severity (1-5 scale)
3. Uploads evidence photo
4. AI analyzes risk in real-time (3s debounce)
5. Photo uploads to Walrus (decentralized)
6. Transaction registers disaster on-chain

**AI Risk Scoring Factors:**
- Water level estimates
- Population density (geohash patterns)
- Temporal clustering (time of day)
- Report frequency

### 2. Resource Management (`/dashboard/offer`)

**Resource Types:**
- 🍲 Food
- 💧 Water
- ⚕️ Medical
- 🏠 Shelter
- 🚗 Transportation
- 🚁 Rescue
- 📡 Communication

**Process:**
1. User selects resource type
2. Enters quantity and location
3. Transaction creates ResourceOffer on-chain
4. Offer appears in matching engine

### 3. Matching Engine (`/dashboard/match`)

**Algorithm:**
- **Type**: Greedy bipartite matching
- **Scoring Factors:**
  - Distance (geohash precision)
  - Urgency level (1-5)
  - Quantity match

**Geohash Distance Estimation:**
- 8 chars: Same location (~19m)
- 7 chars: Very close (~76m)
- 6 chars: Close (~305m)
- 5 chars: Nearby (~1.2km)
- 4 chars: Same area (~4.9km)
- 3 chars: Same region (~20km)

### 4. Live Dashboard (`/dashboard`)

**Real-time Updates:**
- Auto-refresh every 30 seconds
- Smart notifications for:
  - New disasters
  - New resource offers
  - New resource requests
  
**Statistics Displayed:**
- Total disasters
- Total matches
- System status (active/paused)

---

## 🔐 Security & Best Practices

### Implemented Security Measures

1. **Wallet Integration**
   - Sui DApp Kit for secure transaction signing
   - No private key handling on frontend
   - User approval required for all transactions

2. **Input Validation**
   - Severity: 1-5 range enforcement
   - Location: Minimum 8-char geohash
   - Quantity: Positive integers only
   - Resource types: Enum-based validation

3. **Error Handling**
   - Try-catch blocks around all blockchain interactions
   - User-friendly error messages
   - Toast notifications for success/failure
   - Detailed logging for debugging

4. **Data Integrity**
   - Walrus blob IDs for evidence verification
   - On-chain transaction hashes
   - Geohash for location precision

---

## 🧪 Testing

### Manual Testing Checklist

```bash
# Start dev server
npm run dev

# Test disaster reporting
1. Go to /report
2. Select location
3. Upload image
4. Verify AI risk analysis updates
5. Submit and check transaction

# Test resource offering
1. Go to /dashboard/offer
2. Fill form
3. Submit and verify on-chain

# Test matching
1. Go to /dashboard/match
2. Verify matches appear
3. Execute match and check transaction

# Test live dashboard
1. Go to /dashboard
2. Verify stats display
3. Wait 30s for auto-refresh
4. Check notifications
```

### Build Verification

```bash
npm run build
# Should complete in ~20-25s with Exit code: 0
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Wallet Connection Fails**
```
Solution: Ensure Sui Wallet extension installed and connected to testnet
```

**2. Walrus Upload 404**
```
Solution: Endpoint should be /v1/blobs (NOT /v1/store)
Check walrusClient.ts line 47
```

**3. Build Fails with "Module not found"**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**4. Map Not Displaying**
```
Solution: Add NEXT_PUBLIC_MAPBOX_TOKEN to .env
Get token from https://mapbox.com
```

---

##📚 API Reference

### FloodGuardClient

```typescript
import { getFloodGuardClient } from '@/lib/singletons';

const client = getFloodGuardClient();

// Register disaster
await client.registerDisaster({
  location: "lat,lng",
  severity: 3,
  walrusBlobId: "abc123..."
});

// Submit resource offer
await client.submitResourceOffer({
  resourceType: 0, // Food
  quantity: 100,
  location: "lat,lng"
});

// Create match
await client.createMatch(offerId, requestId);
```

### WalrusClient

```typescript
import { getWalrusClient } from '@/lib/singletons';

const walrus = getWalrusClient();

// Upload file
const blobId = await walrus.uploadBlob(file);

// Read blob
const data = await walrus.readBlob(blobId);

// Read as URL
const url = await walrus.readBlobAsUrl(blobId);
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Test thoroughly before submitting PR
- Update documentation if needed

---

## 📄 License

This project is licensed under the Apache License 2.0 - see [LICENSE](../LICENSE) file.

---

## 👥 Authors

**DevPros Team**

- **Bernie (0xsota/bernieio)** - Owner, Core Developer, Smart Contract Developer
- **Anh Phung** - Core Developer, Frontend Developer

---

## 📞 Contact & Support

- **Email**: [bernie.web3@gmail.com](mailto:bernie.web3@gmail.com)
- **Telegram**: [@bernieio](https://t.me/bernieio)
- **GitHub Issues**: [Report Bugs](https://github.com/0xsotaoss/floodguard/issues)

---

## 🙏 Acknowledgments

- **Mysten Labs** - Sui blockchain and Walrus storage
- **Mapbox** - Interactive mapping
- **Next.js Team** - Amazing React framework
- **Sui Community** - Support and feedback

---

<div align="center">

**Built with ❤️ by DevPros Team**

[Website](#) • [Documentation](#) • [Twitter](#) • [Discord](#)

</div>
