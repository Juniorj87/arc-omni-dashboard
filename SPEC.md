# Spec: Arc Omni-Dashboard

> Filed by: Gemini CLI Agent
> Status: draft
> Last updated: 2026-06-02

## One-line Summary
A professional, dark-mode Next.js dashboard for the Arc Testnet ecosystem that tracks balances, positions, and activity across ALL protocols.

## Objective

**What are we building?**
A high-fidelity web application (Arc Omni-Dashboard) that provides a unified "Omni-Liquidity" view of a user's assets and activity across the ENTIRE Arc Testnet ecosystem. It will aggregate data from all major protocols, including Achswap, PrestoDEX, Synthra, Curve, and ArcPerps.

**Why are we building it?**
The Arc Testnet ecosystem currently lacks a centralized utility dashboard for community members to monitor their total exposure. By showing positions across all protocols, this dashboard becomes the definitive "Home Base" for Arc participants, establishing the developer's presence and providing significant ecosystem value.

**Who is it for?**
Arc Testnet participants who interact with multiple protocols daily and need a single source of truth for their portfolio.

**What does success look like?**
A deployed Vercel site where any user can connect their wallet and immediately see:
- Total balance of ARC, USDC, and EURC.
- Liquidity positions in Achswap, PrestoDEX, Synthra, and Curve.
- Deposit balances and open positions in ArcPerps.
- A modern, refined UI that aggregates all these into a single "Net Worth" or "Position Overview" screen.

## Assumptions

- **Network:** Arc Testnet (EVM).
- **RPC:** `https://rpc.testnet.arc.network`.
- **Chain ID:** `5042002`.
- **Styling:** Tailwind CSS with a custom "Arc Dark" theme.
- **Frontend:** Next.js 15 (App Router).
- **Blockchain Lib:** Ethers.js v6.
- **Connect Wallet:** Simple injection (window.ethereum).

> Correct me now or I proceed with these.

## Success Criteria

| # | Criterion | How we measure | Target |
|---|---|---|---|
| 1 | Connection | Wallet connects via MetaMask | Successful address display |
| 2 | Balances | Real-time fetch of ARC/USDC/EURC | Matches Block Explorer |
| 3 | Omni-Liquidity | Fetches LP positions from 4+ protocols | Displays Achswap/Presto/Curve/Synthra |
| 4 | Perp Integration | Shows ArcPerps deposits/positions | Correct data display |
| 5 | Aesthetic | Consistent Dark Mode with refined shadows/gradients | Subjective quality review |

## Non-Goals

- Not in scope: Actual trading/swapping (view-only dashboard for now).
- Not in scope: Support for non-EVM chains (Sui/Walrus is strictly excluded).
- Deferred: Multi-wallet aggregation (starting with single wallet view).

## Users and User Stories

- As a participant, I want to see my total testnet net worth so I can track my farming progress.
- As a power user, I want to see my positions across all DEXs in one screen to avoid checking 5 different sites.
- As a trader, I want to see my ArcPerps margin and positions to manage risk.

## Tech Stack

- Language: TypeScript 5.x
- Framework: Next.js 15 (App Router)
- Web3: Ethers.js v6
- Styling: Tailwind CSS + Lucide Icons
- Hosting: Vercel

## Commands

```bash
# Initialize
npx create-next-app@latest dashboard --ts --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install Dependencies
npm install ethers lucide-react clsx tailwind-merge

# Dev
npm run dev

# Build
npm run build
```

## Project Structure

```
dashboard/
├── src/
│   ├── app/           → App Router pages
│   ├── components/    → UI components (Card, Button, BalanceGrid, etc.)
│   ├── hooks/         → Custom hooks (useWallet, useBalances, usePositions)
│   ├── lib/           → Shared utilities (ethers providers, contract ABIs)
│   └── types/         → TypeScript definitions
├── public/            → Static assets
└── SPEC.md            → This file
```

## Code Style

```ts
// Example of a multi-protocol position fetcher
export async function fetchAllPositions(address: string) {
  const [achswap, presto, curve] = await Promise.all([
    fetchAchswapPositions(address),
    fetchPrestoPositions(address),
    fetchCurvePositions(address)
  ]);
  return { achswap, presto, curve };
}
```

## Testing Strategy

- Framework: Vitest for utility logic.
- Manual Verification: Testing with the three fixed wallets from the operator project.
- Visual Audit: Ensuring dark mode consistency and accessibility (contrast).

## Boundaries

**Always do:**
- Keep it "Arc Testnet only".
- Use the provided RPC URL.
- Maintain strict Dark Mode.

**Ask first:**
- Adding additional protocols not listed in the mandates.
- Implementing write operations (swaps/deposits).

**Never do:**
- Mention or integrate Sui/Walrus.
- Use WAL/SUI tokens.

## Open Questions

- [x] What are the exact contract addresses for USDC and EURC on Arc Testnet?
  - USDC: `0x3600000000000000000000000000000000000000`
  - EURC: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`
- [x] Does Achswap have a public subgraph or should I query contracts directly?
  - Querying contracts directly is preferred. Router: `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`.
- [ ] What is the standard ABI for PrestoDEX and Synthra (are they standard Uniswap V2 forks)?
  - Preliminary research suggests standard V2 Router compatibility.

---

## Sign-off

- [x] Author has written this spec
- [ ] Assumptions confirmed with requester
- [ ] Success criteria are measurable
- [ ] Boundaries agreed
- [ ] Open questions resolved or explicitly deferred
- [ ] Human reviewed and approved
