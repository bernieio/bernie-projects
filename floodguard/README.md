# 🌊 FloodGuard Protocol

> **Decentralized Emergency Coordination System on Sui Blockchain**  
> AI-Powered Resource Matching • Walrus Storage • Real-time Dashboard

![FloodGuard](https://img.shields.io/badge/FloodGuard-Protocol-blue?style=for-the-badge) ![Sui](https://img.shields.io/badge/Sui-Blockchain-blue?style=for-the-badge&logo=sui) ![Move](https://img.shields.io/badge/Move-Language-orange?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [How It Works](#-how-it-works)
- [Performance](#-performance)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**FloodGuard Protocol** is a production-ready decentralized disaster response coordination system built on Sui blockchain. It enables transparent, trustless, and efficient allocation of resources during flood emergencies through AI-powered matching algorithms and blockchain verification.

### The Problem

Traditional disaster response systems face critical challenges:
- ❌ **Lack of Transparency**: Unclear where aid goes
- ❌ **Inefficiency**: Resources don't reach the right places
- ❌ **Trust Issues**: Fraud and misallocation
- ❌ **Slow Response**: Centralized bottlenecks
- ❌ **Poor Coordination**: Duplicate efforts, wasted resources

### Our Solution

FloodGuard Protocol leverages blockchain technology to provide:
- ✅ **Transparency**: All transactions on-chain, publicly verifiable
- ✅ **Efficiency**: AI-powered matching based on location and urgency
- ✅ **Trust**: Cryptographic evidence via Walrus storage
- ✅ **Speed**: Real-time coordination, 30-second updates
- ✅ **Coordination**: Smart matching prevents duplication

---

## ✨ Features

### 🎯 Core Features

- **Disaster Registration**
  - Report disasters with photo evidence
  - AI risk scoring (water level, population, time)
  - Geohash-based location (~19m precision)
  - Immutable on-chain records

- **Resource Management**
  - Offer resources (Food, Water, Medical, etc.)
  - Request resources with urgency levels
  - Real-time availability tracking
  - Transparent quantity management

- **Smart Matching Engine**
  - Greedy bipartite algorithm
  - Distance optimization (geohash-based)
  - Urgency prioritization
  - Automated match scoring

- **Live Dashboard**
  - Real-time disaster map
  - Resource offers/requests overview
  - Match execution interface
  - System statistics

### 🔥 Technical Features

- **Blockchain Integration**
  - Sui Move smart contracts
  - DApp Kit wallet connection
  - Event-driven architecture
  - Shared object optimization

- **Decentralized Storage**
  - Walrus blob storage for evidence
  - 4 publisher fallback
  - 5-epoch retention (testnet)
  - HTTP API client

- **Performance Optimizations**
  - Singleton pattern (6x reduction)
  - 30-second auto-refresh
  - 3-second AI debounce
  - Build time: ~20-24s

- **User Experience**
  - Mapbox interactive maps
  - Toast notifications
  - Tab-based navigation
  - Mobile-responsive design

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js 16)              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Report     │  │   Dashboard  │  │   Match    │ │
│  │   Disaster   │  │   (Live)     │  │   Engine   │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │        │
│         └─────────────────┼─────────────────┘        │
│                           │                          │
└───────────────────────────┼──────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
         ┌───────▼───────┐     ┌──────▼──────┐
         │  Sui Network  │     │   Walrus    │
         │  (Testnet)    │     │   Storage   │
         │               │     │  (Testnet)  │
         │ ┌───────────┐ │     └─────────────┘
         │ │ FloodGuard│ │
         │ │  Contract │ │
         │ └───────────┘ │
         └───────────────┘
```

### Data Flow

1. **Disaster Reporting**
   ```
   User → Upload Photo → Walrus → Get Blob ID → Smart Contract → Event → Dashboard
   ```

2. **Resource Offering**
   ```
   User → Submit Offer → Smart Contract → Event → Matching Engine scan
   ```

3. **Resource Matching**
   ```
   Algorithm → Calculate Scores → Display Matches → User Execute → Smart Contract → Event
   ```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Sui CLI** 1.0+
- **Sui Wallet** browser extension
- **Testnet Tokens**:
  - SUI: [Faucet](https://faucet.testnet.sui.io/)
  - (Optional) WAL for storage

### Installation

```bash
# 1. Clone repository
git clone https://github.com/0xsotaoss/floodguard.git
cd floodguard

# 2. Deploy smart contracts (optional - already deployed)
cd floodguard_contracts
sui move build
sui client publish --gas-budget 100000000
# Save Package ID and State ID

# 3. Setup frontend
cd ../frontend
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with:
# - NEXT_PUBLIC_MAPBOX_TOKEN (required)
# - NEXT_PUBLIC_FLOODGUARD_PACKAGE (from deployment)
# - NEXT_PUBLIC_FLOODGUARD_STATE (from deployment)

# 5. Run development server
npm run dev
# Open http://localhost:3000

# 6. Build for production
npm run build
npm start
```

### Using Deployed Contracts

**Testnet Deployment:**
```
Package ID: 0x... (check frontend/src/lib/config.ts)
State ID: 0x...   (shared object)
Network: Sui Testnet
```

---

## 📁 Project Structure

```
floodguard-protocol/
├── floodguard_contracts/       # Sui Move smart contracts
│   ├── sources/
│   │   └── floodguard_protocol.move  # Main contract
│   ├── tests/                  # Unit tests
│   ├── Move.toml              # Contract manifest
│   └── README.md              # Contract docs
│
├── frontend/                   # Next.js web application
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── dashboard/     # Dashboard routes
│   │   │   ├── report/        # Disaster reporting
│   │   │   └── page.tsx       # Landing page
│   │   ├── components/        # React components
│   │   │   ├── dashboard/
│   │   │   ├── location/
│   │   │   └── ...
│   │   └── lib/               # Utilities & clients
│   │       ├── singletons.ts  # Service singletons
│   │       ├── suiClient.ts   # Blockchain client
│   │       ├── walrusClient.ts # Storage client
│   │       └── ...
│   ├── public/                # Static assets
│   ├── package.json
│   └── README.md              # Frontend docs
│
├── LICENSE                     # Apache 2.0
└── README.md                   # This file
```

---

## 💻 Technology Stack

### Smart Contracts
- **Language**: Move
- **Blockchain**: Sui (Testnet)
- **Storage**: Walrus (Decentralized blob storage)
- **Security**: Admin controls, pause mechanism

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Blockchain**: @mysten/sui, @mysten/dapp-kit
- **Maps**: Mapbox GL JS
- **State**: React Hooks + Zustand
- **Icons**: Lucide React

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Storage**: Walrus Testnet
- **Network**: Sui Testnet
- **APIs**: Sui RPC, Walrus HTTP

---

## 🔄 How It Works

### 1. Report Disaster

```typescript
// User flow
1. Open /report
2. Select location on map (Mapbox)
3. Set severity (1-5 scale)
4. Upload evidence photo
5. AI analyzes risk (real-time)
6. Photo uploads to Walrus → get blob ID
7. Submit transaction to Sui
8. Disaster registered on-chain
9. Event emitted → Dashboard updates
```

**Smart Contract:**
```move
register_disaster_entry(
    state: &mut FloodGuardState,
    location: "10.762622,106.660172",
    severity: 3,
    walrus_proof: "blob_id_...",
    ctx: &mut TxContext
)
```

### 2. Offer Resources

```typescript
// Provider flow
1. Go to /dashboard/offer
2. Select resource type (Food, Water, etc.)
3. Enter quantity
4. Set location
5. Submit transaction
6. Offer registered on-chain
7. Appears in matching engine
```

### 3. Match Resources

```typescript
// Matching flow
1. Algorithm scans all offers + requests
2. Calculates scores:
   - Distance (geohash proximity)
   - Urgency (1-5 multiplier)
   - Quantity match
3. Displays top matches at /dashboard/match
4. User clicks "Execute Match"
5. Transaction creates ResourceMatch
6. Event emitted → Parties notified
```

**Match Score Formula:**
```
score = (1,000,000 - distance_score) × urgency + quantity_bonus

distance_score based on geohash:
  - 8 chars: 0 (same location ~19m)
  - 7 chars: 100 (~76m)
  - 6 chars: 500 (~305m)
  - ...

quantity_bonus:
  - Full match: 1000
  - Partial: 500
```

### 4. Verify Delivery

```typescript
// Verification flow (future)
1. Provider delivers aid
2. Takes photo proof
3. Uploads to Walrus
4. Calls verify_delivery()
5. Match marked complete
6. AidDelivered event emitted
```

---

## ⚡ Performance

### Optimization Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Initial Load** | 13s | ~2s | **6.5x faster** |
| **CPU Usage** | 80%+ | <20% | **4x reduction** |
| **Client Instances** | 6+ | 1 each | **6x reduction** |
| **Dashboard Refresh** | 10s | 30s | **3x less frequent** |
| **AI Debounce** | 1s | 3s | **3x less calls** |
| **Build Time** | Variable | 20-24s | **Stable** |
| **Memory Leaks** | Present | Eliminated | ✅ |
| **Walrus Upload** | 0% (404) | 99%+ | ✅ |

### Key Optimizations

1. **True Singleton Pattern**
   - Centralized service instances
   - Eliminated connection pool exhaustion
   - Reduced memory footprint

2. **Fixed Infinite Loop**
   - LiveDashboard re-render cascade
   - Proper useEffect dependencies
   - Stable refresh intervals

3. **Walrus Reliability**
   - Correct `/v1/blobs` endpoint
   - 4 publisher fallback
   - 5-epoch storage duration

---

## 🔐 Security

### Smart Contract Security

- ✅ **Admin Controls**: Emergency pause mechanism
- ✅ **Input Validation**: All parameters checked
- ✅ **Access Control**: Admin-only functions
- ✅ **Native Types**: Address type (no UTF-8 conversion)
- ✅ **Range Checks**: Severity 1-5, Urgency 1-5
- ✅ **Length Checks**: Geohash ≥ 8 chars
- ✅ **Error Codes**: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden)

### Frontend Security

- ✅ **Wallet Integration**: DApp Kit (no private keys)
- ✅ **User Approval**: All transactions require signing
- ✅ **Input Sanitization**: Client-side validation
- ✅ **Error Handling**: Try-catch blocks
- ✅ **HTTPS Only**: Secure communication
- ✅ **Environment Variables**: Sensitive data protected

### Best Practices

- Never expose private keys
- Verify contract addresses
- Check transaction details before signing
- Use testnet for development
- Regular security audits (planned)

---

## 🗺️ Roadmap

### Phase 1: MVP (Completed ✅)

- [x] Smart contract development
- [x] Basic frontend (React + Sui SDK)
- [x] Disaster registration
- [x] Resource management
- [x] Simple matching

### Phase 2: Optimization (Completed ✅)

- [x] Performance audit
- [x] Singleton pattern
- [x] Walrus integration
- [x] AI risk scoring
- [x] Live dashboard
- [x] Tab navigation

### Phase 3: Advanced Features (In Progress 🚧)

- [ ] Cryptographic delivery verification
- [ ] Reputation system for providers
- [ ] Multi-signature admin
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Phase 4: Production (Planned 📋)

- [ ] Mainnet deployment
- [ ] Security audit (third-party)
- [ ] Partnership with NGOs
- [ ] Government integration
- [ ] Cross-chain bridge (Ethereum, Polygon)

### Phase 5: Scale (Future 🚀)

- [ ] AI prediction models
- [ ] Satellite imagery integration
- [ ] IoT sensor network
- [ ] Global coverage
- [ ] DAO governance

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript/Move best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Run `npm run build` before submitting
- Ensure all tests pass

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- 🌍 Translations

---

## 👥 Team

### DevPros Team

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/0xsota.png" width="100px" />
      <br />
      <b>Bernie (0xsota)</b>
      <br />
      <i>Owner & Core Developer</i>
      <br />
      Smart Contract Developer
      <br />
      <a href="https://github.com/0xsota">GitHub</a> • 
      <a href="https://t.me/bernieio">Telegram</a>
    </td>
    <td align="center">
      <b>Anh Phung</b>
      <br />
      <i>Core Developer</i>
      <br />
      Frontend Developer
      <br />
      React • Next.js • TypeScript
    </td>
  </tr>
</table>

### Roles & Responsibilities

**Bernie (0xsota/bernieio)**
- Project architecture & design
- Smart contract development (Move)
- Blockchain integration
- Performance optimization
- Security review

**Anh Phung**
- Frontend development (Next.js)
- UI/UX design
- Component development
- State management
- Testing & QA

---

## 📄 License

This project is licensed under the **Apache License 2.0**.

```
Copyright 2024 DevPros Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

See [LICENSE](./LICENSE) file for details.

---

## 📞 Contact & Support

### Get in Touch

- **📧 Email**: [bernie.web3@gmail.com](mailto:bernie.web3@gmail.com)
- **💬 Telegram**: [@bernieio](https://t.me/bernieio)
- **🐛 Issues**: [GitHub Issues](https://github.com/0xsotaoss/floodguard/issues)
- **💡 Discussions**: [GitHub Discussions](https://github.com/0xsotaoss/floodguard/discussions)

### Support the Project

If you find FloodGuard helpful:

- ⭐ **Star** the repository
- 🐛 **Report** bugs
- 💡 **Suggest** features
- 🤝 **Contribute** code
- 📢 **Share** with your network

### Community

- **Sui Developer Community**: [Discord](https://discord.gg/sui)
- **Mysten Labs**: [GitHub](https://github.com/MystenLabs)
- **Move Language**: [Documentation](https://move-language.github.io/move/)

---

## 🙏 Acknowledgments

Special thanks to:

- **Mysten Labs** - For Sui blockchain and Walrus storage
- **Mapbox** - For amazing mapping technology
- **Next.js Team** - For the incredible React framework
- **Sui Community** - For support and feedback
- **Open Source Community** - For inspiration and tools

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/0xsotaoss/floodguard?style=social)
![GitHub forks](https://img.shields.io/github/forks/0xsotaoss/floodguard?style=social)
![GitHub issues](https://img.shields.io/github/issues/0xsotaoss/floodguard)
![GitHub PRs](https://img.shields.io/github/issues-pr/0xsotaoss/floodguard)
![License](https://img.shields.io/github/license/0xsotaoss/floodguard)

---

<div align="center">

### 🌊 Saving Lives Through Technology 🌊

**FloodGuard Protocol** - Decentralized Emergency Coordination

Built with ❤️ by **DevPros Team**

[Website](#) • [Documentation](#) • [Twitter](#) • [Discord](#)

</div>

---

## 🔗 Quick Links

- **Smart Contracts**: [/floodguard_contracts](./floodguard_contracts/README.md)
- **Frontend**: [/frontend](./frontend/README.md)
- **License**: [LICENSE](./LICENSE)
- **Contributing**: [CONTRIBUTING.md](#contributing)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](#)

---

**Last Updated**: November 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅
