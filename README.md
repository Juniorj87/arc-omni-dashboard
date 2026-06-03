# 🌌 Arc Omni Dashboard

**The Sovereign Portfolio Terminal for the Arc Testnet Ecosystem.**

Arc Omni is a high-fidelity, institutional-grade DeFi dashboard designed to provide a unified view of assets and liquidity positions across the entire **Arc Testnet (EVM)** network.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Ethers](https://img.shields.io/badge/Ethers.js-v6-blueviolet?style=for-the-badge&logo=ethereum)

---

## ✨ Features

- **Omni-Liquidity Tracking:** Automatically detects LP positions across:
  - **Achswap** (USDC/EURC)
  - **PrestoDEX**
  - **Synthra**
  - **SimpleSwap**
  - **Curve** (Stable Pools)
- **Protocol Integration:** Seamless data fetching from **ArcPerps** (Margin deposits and positions).
- **Institutional UI:** A refined "Arc Dark" aesthetic featuring glassmorphism, high-contrast typography, and smooth animations.
- **Analytics Engine:** Real-time net worth calculation, asset mix visualization, and activity timeline.
- **Secure Transfers:** Built-in gateway for transferring USDC and EURC with protocol-level security.
- **Watchlist:** Save and track multiple addresses without connecting a wallet.

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file (optional for public RPC):
```env
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the terminal.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Blockchain Interface:** Ethers.js v6
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts

## 🛡 Security & Design Mandates

- **Zero-Permission Explorer:** Analyze any address on the network safely.
- **Strict Isolation:** This project is exclusively dedicated to the Arc Testnet (EVM) ecosystem.
- **Responsive Design:** Optimized for both ultra-wide professional monitors and mobile devices.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Ecosystem Integration

This dashboard is built specifically for the [Arc Network](https://arc.network/) community. 

- **Official Website:** [https://arc.network/](https://arc.network/)
- **Network Explorer:** [ArcScan](https://testnet.arcscan.app)
- **Official X (Twitter):** [@ArcOnEVM](https://x.com/ArcOnEVM)

---

*Built for the Arc Community by [Juniorj87](https://github.com/Juniorj87).*
