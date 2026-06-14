import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ARC_RPC_URL = "https://rpc.testnet.arc.network";
const rpcProvider = new ethers.JsonRpcProvider(ARC_RPC_URL, { chainId: 5042002, name: "Arc Testnet" }, { staticNetwork: true });

const TOKENS = {
  USDC: { address: "0x3600000000000000000000000000000000000000", decimals: 18 },
  EURC: { address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", decimals: 6 },
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

// In-memory store (resets on server restart)
const leaderboardDb: Array<{
  address: string;
  label?: string;
  score: number;
  tx_count: number;
  net_worth: number;
  active_days: number;
  last_updated?: string;
}> = [
  { address: '0x1c8300000000000000000000000000000000a83d', label: 'Protocol Sentinel', score: 1254000, tx_count: 15400, net_worth: 850000, active_days: 180 },
  { address: '0x992a00000000000000000000000000000000f411', label: 'Arc Titan', score: 982100, tx_count: 12500, net_worth: 420000, active_days: 150 },
  { address: '0x551100000000000000000000000000000000bc22', label: 'Heavy Liquidity', score: 748900, tx_count: 8600, net_worth: 210000, active_days: 120 },
];

function calculateScore(txCount: number, totalValueUsd: number, activeDays: number, positionsCount: number): number {
  const txScore = txCount * 10;
  const valueScore = Math.floor(totalValueUsd);
  const dayScore = activeDays * 50;
  const protocolScore = positionsCount * 100;
  const multiplier = activeDays > 7 ? 1.2 : 1.0;
  return Math.floor((txScore + valueScore + dayScore + protocolScore) * multiplier);
}

function getRankLabel(score: number): string {
  if (score > 100000) return 'Protocol Sentinel';
  if (score > 50000) return 'Arc Titan';
  if (score > 10000) return 'Institutional Node';
  if (score > 1000) return 'Active Operator';
  return 'Node Explorer';
}

async function fetchOnChainData(address: string) {
  try {
    const validAddr = ethers.getAddress(address);
    const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, rpcProvider);
    const eurcContract = new ethers.Contract(TOKENS.EURC.address, ERC20_ABI, rpcProvider);

    const [usdcBal, eurcBal, txCount] = await Promise.all([
      usdcContract.balanceOf(validAddr).catch(() => BigInt(0)),
      eurcContract.balanceOf(validAddr).catch(() => BigInt(0)),
      rpcProvider.getTransactionCount(validAddr).catch(() => 0),
    ]);

    const usdcValue = parseFloat(ethers.formatUnits(usdcBal, TOKENS.USDC.decimals));
    const eurcValue = parseFloat(ethers.formatUnits(eurcBal, TOKENS.EURC.decimals));
    const totalValueUsd = usdcValue + eurcValue;
    const activeDays = txCount > 0 ? Math.min(txCount * 2, 730) : 0;
    const score = calculateScore(txCount, totalValueUsd, activeDays, 0);

    return {
      address: validAddr.toLowerCase(),
      score,
      tx_count: txCount,
      net_worth: totalValueUsd,
      active_days: activeDays,
      label: getRankLabel(score),
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  try {
    // If searching for a specific address, fetch on-chain data in real-time
    let searchedEntry = null;
    if (address && ethers.isAddress(address)) {
      const onChainData = await fetchOnChainData(address);
      if (onChainData) {
        // Upsert into leaderboard
        const existingIdx = leaderboardDb.findIndex(e => e.address.toLowerCase() === onChainData.address);
        if (existingIdx > -1) {
          leaderboardDb[existingIdx] = { ...leaderboardDb[existingIdx], ...onChainData, last_updated: new Date().toISOString() };
        } else {
          leaderboardDb.push({ ...onChainData, last_updated: new Date().toISOString() });
        }
        searchedEntry = onChainData;
      }
    }

    const sorted = [...leaderboardDb].sort((a, b) => b.score - a.score);
    const total = sorted.length;
    const leaderboard = sorted.map((entry, index) => {
      const rank = index + 1;
      const percentile = ((total - rank) / total) * 100;
      return { ...entry, rank, percentile };
    });

    const stats = {
      totalWallets: total,
      totalTxCount: leaderboardDb.reduce((acc, curr) => acc + (curr.tx_count || 0), 0),
      totalValueUsd: leaderboardDb.reduce((acc, curr) => acc + (curr.net_worth || 0), 0),
      avgScore: total > 0 ? leaderboardDb.reduce((acc, curr) => acc + (curr.score || 0), 0) / total : 0,
    };

    const userEntry = address
      ? leaderboard.find(e => e.address.toLowerCase() === address.toLowerCase()) || (searchedEntry ? {
          ...searchedEntry,
          rank: leaderboard.findIndex(e => e.address.toLowerCase() === searchedEntry!.address.toLowerCase()) + 1 || total + 1,
          percentile: 50,
        } : null)
      : null;

    return NextResponse.json({ success: true, stats, leaderboard: leaderboard.slice(0, 50), userEntry });
  } catch (error) {
    console.error("[Leaderboard API] GET Error:", error);
    return NextResponse.json({ success: false, message: "No Global Data Available" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json({ success: false, message: "Invalid or missing address" }, { status: 400 });
    }

    const onChainData = await fetchOnChainData(address);
    if (!onChainData) {
      return NextResponse.json({ success: false, message: "Could not fetch on-chain data" }, { status: 422 });
    }

    const existingIdx = leaderboardDb.findIndex(e => e.address.toLowerCase() === onChainData.address);
    const entry = { ...onChainData, last_updated: new Date().toISOString() };

    if (existingIdx > -1) {
      leaderboardDb[existingIdx] = entry;
    } else {
      leaderboardDb.push(entry);
    }

    return NextResponse.json({ success: true, message: "Node Registered" });
  } catch (error) {
    console.error("[Leaderboard API] POST Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
