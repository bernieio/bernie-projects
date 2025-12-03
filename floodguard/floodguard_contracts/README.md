# FloodGuard Smart Contracts

> **Security-Focused Move Smart Contracts for Decentralized Disaster Response**  
> Deployed on Sui Blockchain Testnet

![Move](https://img.shields.io/badge/Move-Language-orange?style=for-the-badge) ![Sui](https://img.shields.io/badge/Sui-Testnet-blue?style=for-the-badge) ![License](https://img.shields.io/badge/License-Apache%202.0-green?style=for-the-badge)

---

## 🌊 Overview

FloodGuard Protocol is a production-ready Move smart contract system that enables transparent, trustless coordination of disaster response efforts. It provides on-chain disaster registration, resource management, and AI-powered matching algorithms.

### ✨ Key Features

- **🎯 Disaster Registration** - Immutable record with Walrus evidence proofs
- **🤖 AI Risk Scoring** - Multi-factor risk assessment (severity, location, temporal)
- **📦 Resource Management** - Offers and requests with geohash precision
- **⚡ Smart Matching** - Greedy bipartite algorithm optimized for urgency
- **🔐 Security First** - Admin controls, pause mechanism, input validation
- **📊 Real-time Events** - DisasterAlert, ResourceMatched, AidDelivered
- **🗺️ Geohash Indexing** - 8-character precision (~19m accuracy)

---

## 🚀 Quick Start

### Prerequisites

- Sui CLI 1.0+
- Sui Wallet with testnet SUI tokens
- Basic Move knowledge

### Installation

```bash
# Clone repository
git clone https://github.com/0xsotaoss/floodguard.git
cd floodguard/floodguard_contracts

# Build contract
sui move build

# Run tests
sui move test

# Deploy to testnet
sui client publish --gas-budget 100000000
```

### Deployment Steps

1. **Build Contract**
   ```bash
   sui move build
   ```

2. **Publish to Testnet**
   ```bash
   sui client publish --gas-budget 100000000
   ```

3. **Save Contract Addresses**
   ```
   Package ID: 0x...
   FloodGuardState ID: 0x... (shared object)
   ```

4. **Update Frontend Config**
   ```typescript
   // frontend/src/lib/config.ts
   export const FLOODGUARD_PACKAGE = "0x...";
   export const FLOODGUARD_STATE = "0x...";
   ```

---

## 📚 Contract Architecture

### Core Data Structures

#### 1. DisasterReport

```move
public struct DisasterReport has key, store {
    id: UID,
    location: Geohash,        // 8-char geohash (~19m precision)
    severity: u8,             // 1-5 scale
    walrus_proof: String,     // Blob ID for evidence
    reporter: address,        // Reporter's Sui address
    timestamp: u64,           // Epoch timestamp (ms)
    verified: bool,           // Verification status
    risk_score: u64          // AI-calculated risk
}
```

**Security Features:**
- ✅ Native `address` type (no UTF-8 conversion vulnerability)
- ✅ Walrus blob ID for evidence integrity
- ✅ Client-side geohash validation (min 8 chars)
- ✅ Severity range check (1-5)

#### 2. ResourceOffer

```move
public struct ResourceOffer has key, store {
    id: UID,
    provider: address,        // Provider's Sui address
    resource_type: ResourceType,
    quantity: u64,
    location: Geohash,
    timestamp: u64,
    active: bool             // Can be deactivated
}
```

#### 3. ResourceRequest

```move
public struct ResourceRequest has key, store {
    id: UID,
    requester: address,
    resource_type: ResourceType,
    quantity: u64,
    location: Geohash,
    urgency: u8,             // 1-5 scale
    timestamp: u64,
    fulfilled: bool
}
```

#### 4. ResourceMatch

```move
public struct ResourceMatch has key, store {
    id: UID,
    offer_id: String,
    request_id: String,
    match_score: u64,        // Distance + urgency weighted
    completed: bool,
    delivery_proof: String,  // Walrus blob ID
    created_at: u64,
    completed_at: u64
}
```

### Resource Types (Enum)

```move
public enum ResourceType has copy, drop, store {
    Food,            // 0
    Water,           // 1
    Medical,         // 2
    Shelter,         // 3
    Transportation,  // 4
    Rescue,          // 5
    Communication    // 6
}
```

---

## 🔥 Core Functions

### Disaster Management

#### `register_disaster_entry`

```move
public entry fun register_disaster_entry(
    state: &mut FloodGuardState,
    location: String,        // "lat,lng" format
    severity: u8,            // 1-5
    walrus_proof: String,    // Walrus blob ID
    ctx: &mut TxContext
)
```

**Security Checks:**
- ✅ System not paused
- ✅ Severity in range [1-5]
- ✅ Geohash length ≥ 8 characters
- ✅ Walrus proof not empty

**Side Effects:**
- Increments `disaster_count`
- Emits `DisasterAlert` event
- Transfers DisasterReport to sender

**Example Usage:**
```typescript
await signAndExecute({
  transaction: {
    kind: 'moveCall',
    data: {
      packageObjectId: PACKAGE_ID,
      module: 'floodguard_protocol',
      function: 'register_disaster_entry',
      arguments: [
        STATE_ID,
        "10.762622,106.660172", // Location
        3,                       // Severity
        "walrus_blob_id_..."     // Evidence
      ]
    }
  }
});
```

### Resource Management

#### `offer_resource_entry`

```move
public entry fun offer_resource_entry(
    state: &mut FloodGuardState,
    resource_type_index: u8,  // 0-6 (see ResourceType enum)
    quantity: u64,
    location: String,
    ctx: &mut TxContext
)
```

**Security Checks:**
- ✅ System not paused
- ✅ Resource type index valid (0-6)
- ✅ Quantity > 0
- ✅ Geohash length ≥ 8

#### `request_resource_entry`

```move
public entry fun request_resource_entry(
    state: &mut FloodGuardState,
    resource_type_index: u8,
    quantity: u64,
    location: String,
    urgency: u8,             // 1-5
    ctx: &mut TxContext
)
```

**Additional Checks:**
- ✅ Urgency in range [1-5]

### Matching Algorithm

#### `create_match_entry`

```move
public entry fun create_match_entry(
    state: &mut FloodGuardState,
    offer: ResourceOffer,
    request: ResourceRequest,
    ctx: &mut TxContext
)
```

**Matching Criteria:**
- ✅ Same resource type
- ✅ Offer is active
- ✅ Request not fulfilled
- ✅ System not paused

**Match Score Calculation:**
```move
fun calculate_match_score(
    offer: &ResourceOffer, 
    request: &ResourceRequest
): u64 {
    let distance_score = calculate_distance(&offer.location, &request.location);
    let urgency_multiplier = (request.urgency as u64);
    let quantity_match = if (offer.quantity >= request.quantity) 1000 else 500;
    
    (1000000 - distance_score) * urgency_multiplier + quantity_match
}
```

**Distance Scoring (Geohash-based):**

| Common Prefix | Distance | Score |
|---------------|----------|-------|
| 8 chars | Same location (~19m) | 0 |
| 7 chars | Very close (~76m) | 100 |
| 6 chars | Close (~305m) | 500 |
| 5 chars | Nearby (~1.2km) | 2,500 |
| 4 chars | Same area (~4.9km) | 12,000 |
| 3 chars | Same region (~20km) | 60,000 |
| <3 chars | Far away (>50km) | 100,000 |

---

## 🤖 AI Risk Scoring

### Multi-Factor Risk Assessment

```move
fun calculate_risk_score(
    severity: u8,
    location: &Geohash,
    timestamp: u64
): u64
```

**Risk Factors:**

1. **Base Severity** (1000-5000)
   - Direct multiplier: `severity * 1000`

2. **Location Importance** (100-900)
   - Geohash length (precision = population density)
   - Urban area detection (geohash prefix patterns)
   - Special zones (coastal, flood-prone)

3. **Temporal Risk** (800-1200 multiplier)
   - Morning peak (6-9 AM): 1.2x
   - Evening peak (5-8 PM): 1.1x
   - Night time (10 PM - 5 AM): 0.8x
   - Normal hours: 1.0x

4. **Time Recency**
   - Newer reports score higher
   - Decay function based on timestamp

**Example Risk Score:**
```
Severity 4 disaster in urban area (geohash: "s0000mrz") at 8 AM:
  Base: 4000
  Location: 800 (urban + 8-char precision)
  Time factor: 1200 (morning peak)
  Total: (4000 + 800) * 1.2 = 5760
```

---

## 🔐 Security Features

### Admin Controls

```move
// Emergency pause (admin only)
public fun emergency_pause(
    state: &mut FloodGuardState,
    ctx: &TxContext
)

// Resume operations (admin only)
public fun resume_operations(
    state: &mut FloodGuardState,
    ctx: &TxContext
)
```

**Access Control:**
```move
assert!(tx_context::sender(ctx) == state.admin, 401);
```

### Input Validation

```move
// Constants for security
const MAX_SEVERITY: u8 = 5;
const MAX_URGENCY: u8 = 5;
const MIN_GEOHASH_LENGTH: u64 = 8;

// Validation functions
public fun validate_severity(severity: u8): bool {
    severity > 0 && severity <= MAX_SEVERITY
}

public fun validate_geohash(geohash: &String): bool {
    string::length(geohash) >= MIN_GEOHASH_LENGTH
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (not admin) |
| 403 | Forbidden (system paused) |

---

## 📊 Events

### DisasterAlert

```move
public struct DisasterAlert has copy, drop {
    geohash: Geohash,
    severity: u8,
    risk_score: u64,
    timestamp: u64
}
```

**Emitted:** When disaster is registered
**Use Case:** Real-time notifications, map updates

### ResourceMatched

```move
public struct ResourceMatched has copy, drop {
    offer_id: String,
    request_id: String,
    match_score: u64,
    timestamp: u64
}
```

**Emitted:** When offer-request match created
**Use Case:** Dashboard updates, analytics

### AidDelivered

```move
public struct AidDelivered has copy, drop {
    match_id: String,
    delivery_proof: String,  // Walrus blob ID
    provider: String,
    timestamp: u64
}
```

**Emitted:** When delivery verified
**Use Case:** Completion tracking, reputation

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
sui move test

# Run specific test
sui move test test_disaster_registration

#Test with coverage
sui move test --coverage
```

### Test Scenarios

```move
#[test]
fun test_disaster_registration() {
    // Setup test context
    // Register disaster
    // Assert fields correct
    // Verify event emitted
}

#[test]
#[expected_failure(abort_code = 400)]
fun test_invalid_severity() {
    // Try to register with severity > 5
    // Should fail with code 400
}

#[test]
fun test_resource_matching() {
    // Create offer and request
    // Verify they can match
    // Check match score calculation
}
```

---

## 🚀 Deployment Checklist

- [ ] Compile contract (`sui move build`)
- [ ] Run tests (`sui move test`)
- [ ] Deploy to devnet first
- [ ] Test all functions on devnet
- [ ] Deploy to testnet
- [ ] Save Package ID and State ID
- [ ] Update frontend config
- [ ] Verify on Sui Explorer
- [ ] Test end-to-end flow
- [ ] Monitor events

---

## 📈 Gas Optimization

### Optimizations Applied

1. **Struct Packing**
   - `u8` for small values (severity, urgency)
   - `address` for accounts (native type)
   - `String` only when necessary

2. **Event Minimization**
   - Only essential data in events
   - Use `copy` + `drop` abilities

3. **Computation Offloading**
   - AI analysis done off-chain
   - Match scoring simplified

4. **Entry Functions**
   - Direct transfers to sender
   - No intermediate storage

---

## 🐛 Known Limitations

1. **Geohash Distance**
   - Simplified algorithm (not true Haversine)
   - Good enough for disaster scenarios

2. **Match Uniqueness**
   - One offer can match multiple requests
   - Frontend handles deduplication

3. **Delivery Verification**
   - Simplified (no cryptographic proof)
   - Production should use ecrecover

---

## 🔄 Upgrade Path

### Version 2.0 Planned Features

- [ ] Cryptographic delivery verification
- [ ] Multi-sig admin controls
- [ ] Reputation system for providers
- [ ] Dynamic resource pricing
- [ ] Cross-chain bridge support

---

## 📄 License

Apache License 2.0 - See [LICENSE](../LICENSE)

---

## 👥 Authors

**DevPros Team**

- **Bernie (0xsota/bernieio)** - Owner, Core Developer, Smart Contract Developer
- **Anh Phung** - Core Developer, Frontend Developer

---

## 📞 Contact

- **Email**: [bernie.web3@gmail.com](mailto:bernie.web3@gmail.com)
- **Telegram**: [@bernieio](https://t.me/bernieio)
- **GitHub Issues**: [Report Bugs](https://github.com/0xsotaoss/floodguard/issues)

---

## 🙏 Acknowledgments

- **Mysten Labs** - Sui blockchain and Move language
- **Move Community** - Best practices and patterns
- **Sui Developer Community** - Support and feedback

---

<div align="center">

**Secure, Transparent, Decentralized**

Built with ❤️ by DevPros Team

</div>