# Arc Omni-Dashboard Documentation

## Overview
Arc Omni-Dashboard is a unified terminal designed for the Arc Testnet ecosystem. It allows users to track their balances and liquidity positions across multiple protocols in a single, high-fidelity interface.

## Supported Protocols
- **Achswap:** V2 Liquidity Pools (USDC/EURC).
- **PrestoDEX:** Automated Market Maker positions.
- **Curve:** Stablecoin and FX pools (e.g., WUSDC/arcBTC).
- **ArcPerps:** Perpetual futures margin deposits.
- **Synthra:** Native swap protocol positions.

## Technical Stack
- **Frontend:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS with custom "Arc Glass" components.
- **Blockchain:** Ethers.js v6 for direct contract calls.
- **Charts:** Recharts for portfolio allocation and growth visualization.

## How it Works
The dashboard uses direct JSON-RPC calls to the Arc Testnet to fetch real-time data. It bypasses traditional indexers to ensure maximum reliability and speed on the testnet.

## Roadmap
- [x] Multi-wallet support (MetaMask, Rabby).
- [x] Omni-protocol data aggregation.
- [x] Visual portfolio analytics.
- [ ] Direct transaction execution (Swaps/LP).
- [ ] Advanced PnL tracking.
