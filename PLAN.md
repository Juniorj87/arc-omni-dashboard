# Plan: Arc Omni-Dashboard Implementation

> Derived from: dashboard/SPEC.md
> Status: draft
> Last updated: 2026-06-02

## Overview
We are building a comprehensive DeFi dashboard for the Arc Testnet. The plan follows a bottom-up approach: setting up the Web3 foundation (providers, contract ABIs), implementing multi-protocol data fetching hooks, and finally building the refined dark-mode UI.

## Architecture Decisions

- **Decision:** Use a single "Omni-Fetcher" hook that aggregates results from specialized protocol hooks.
  **Rationale:** Centralizes data orchestration and makes it easy to add new protocols later.
- **Decision:** Query contracts directly via Ethers.js instead of relying on external indexers.
  **Rationale:** Maximum reliability on testnet where subgraphs might be unstable or outdated.
- **Decision:** Implement a "Mock Mode" for UI development.
  **Rationale:** Allows styling the dashboard with complex data states (many positions, error states) without waiting for network RPCs.

## Dependency Graph

```
[Project Init]
        │
        ├─▶ [Web3 Foundation: ABIs & Providers]
        │         │
        │         ├─▶ [Protocol Hooks: Achswap, Curve, etc.]
        │         │         │
        │         │         └─▶ [Omni-Fetcher Hook]
        │         │                   │
        │         │                   └─▶ [UI: Dashboard Layout]
        │         │                             │
        │         │                             └─▶ [UI: Component Library]
        │         │
        │         └─▶ [Mock Data Layer]
```

## Task List

### Phase 1: Foundation

- [x] **Task 1: Project Setup & Dependencies**
  - **Description:** Install core libraries (ethers, lucide-react, clsx) and set up the directory structure.
  - **Acceptance:**
    - [x] `ethers` v6 installed.
    - [x] Folder structure matches SPEC.
  - **Verify:** `npm list ethers`
  - **Size:** S

- [x] **Task 2: Web3 Core & ABIs**
  - **Description:** Define network constants (RPC, ChainID) and contract ABIs for ERC20, Uniswap V2 Router, and Curve Pools.
  - **Acceptance:**
    - [x] `src/lib/constants.ts` contains all addresses from SPEC.
    - [x] `src/lib/abis.ts` contains required function signatures.
  - **Verify:** Type-check the ABI exports.
  - **Size:** S

### Phase 2: Data Layer (The "Omni" Fetcher)

- [x] **Task 3: useWallet Hook**
  - **Description:** Implement basic wallet connection and address state management.
  - **Acceptance:**
    - [x] Connects to MetaMask/Browser Wallet.
    - [x] Detects network and alerts if not on Arc Testnet.
  - **Verify:** Manual test in browser.
  - **Size:** S

- [x] **Task 4: useBalances & usePositions Hooks**
  - **Description:** Implement fetching for ARC/USDC/EURC balances and LP positions from Achswap/Presto (Uniswap V2 pattern).
  - **Acceptance:**
    - [x] Returns correct balances for fixed test wallets.
    - [x] Correctly calculates LP share value where possible.
  - **Verify:** Compare console output with Block Explorer data.
  - **Size:** M

- [x] **Task 5: ArcPerps & Curve Integration**
  - **Description:** Specialized fetching for ArcPerps (Engine deposits) and Curve (Stable pools).
  - **Acceptance:**
    - [x] Shows deposits in ArcPerps.
    - [x] Shows Curve LP balances.
  - **Verify:** Manual check with active wallets.
  - **Size:** M

### Phase 3: UI & Refinement

- [x] **Task 6: Dashboard Layout & Theme**
  - **Description:** Create the "Arc Dark" theme and the main responsive grid layout.
  - **Acceptance:**
    - [x] Sidebar/Header structure.
    - [x] Refined dark aesthetic (Glassmorphism, deep shadows).
  - **Verify:** Visual review on Mobile/Desktop.
  - **Size:** M

- [x] **Task 7: Component Implementation**
  - **Description:** Build the `BalanceCard`, `PositionTable`, and `ProtocolBreakdown` components.
  - **Acceptance:**
    - [x] Components are responsive and accessible.
    - [x] Loading states (skeletons) are implemented.
  - **Verify:** Test with throttled network speed.
  - **Size:** L

### Phase 4: Final Polish & Deployment

- [x] **Task 8: Analytics & Engagement Score**
  - **Description:** Algorithm to calculate user rank based on on-chain activity.
  - **Acceptance:**
    - [x] Dashboard shows dynamic "Engagement Score".
  - **Verify:** Score updates based on tx count and LP positions.
  - **Size:** S

- [x] **Task 9: Transaction Modal (Send Flow)**
  - **Description:** Functional modal to transfer USDC/EURC.
  - **Acceptance:**
    - [x] Successful transfer on Arc Testnet via UI.
  - **Verify:** Check tx on ArcScan after sending from UI.
  - **Size:** M

- [ ] **Task 10: Performance Optimization & Mobile**
  - **Description:** Refine responsiveness and fix layout shifts.
  - **Acceptance:**
    - [ ] Full mobile responsiveness.
  - **Verify:** Test on various screen sizes.
  - **Size:** S

- [ ] **Task 11: Deployment & CI/CD**
  - **Description:** Deploy to Vercel.
  - **Acceptance:**
    - [ ] Live URL accessible.
  - **Verify:** Access dashboard from public domain.
  - **Size:** S

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| RPC Rate Limiting | Medium | High | Implement caching for balances (e.g. 30s TTL). |
| Unknown Contract ABIs | High | Low | Use common V2/V3 patterns; verify on ArcScan. |

## Open Questions

- [ ] Should we support "Watch Only" mode for the three fixed wallets by default? (Likely yes, as a demo feature).
- [ ] Is there a specific "Arc" font we should use for brand consistency?

## Sign-off

- [x] Every task has acceptance + verify
- [x] Tasks ordered by dependency
- [x] No XL tasks remain
- [x] Checkpoints between phases
- [ ] Human reviewed and approved
