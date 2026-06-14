import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ethers } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ARC Testnet Specific
export const ARC_RPC_URL = "https://rpc.testnet.arc.network";

// Institutional-grade provider setup
export const rpcProvider = new ethers.JsonRpcProvider(ARC_RPC_URL, {
    chainId: 5042002,
    name: "Arc Testnet"
}, { staticNetwork: true });

export function formatBalance(value: bigint, decimals: number = 18): string {
  try {
    return parseFloat(ethers.formatUnits(value, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  } catch {
    return "0.00";
  }
}

export function truncateAddress(address: string): string {
  if (!address || typeof address !== 'string') return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
