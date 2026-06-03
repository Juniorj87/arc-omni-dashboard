import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ethers } from "ethers";
import { ARC_NETWORK } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const provider = new ethers.JsonRpcProvider(ARC_NETWORK.rpcUrl);

export function formatBalance(value: bigint, decimals: number = 18): string {
  return parseFloat(ethers.formatUnits(value, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
