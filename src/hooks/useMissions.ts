'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { rpcProvider } from '../lib/utils';
import { TOKENS } from '../lib/constants';
import { ERC20_ABI } from '../lib/abis';

export interface MissionStatus {
  id: number;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  claimed: boolean;
}

function getClaimedKey(address: string): string {
  return `arc-missions-claimed-${address.toLowerCase()}`;
}

function getVisitKey(address: string): string {
  return `arc-missions-visits-${address.toLowerCase()}`;
}

function loadClaimed(address: string): Set<number> {
  try {
    const data = localStorage.getItem(getClaimedKey(address));
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function saveClaimed(address: string, claimed: Set<number>) {
  localStorage.setItem(getClaimedKey(address), JSON.stringify([...claimed]));
}

function recordVisit(address: string): number {
  try {
    const key = getVisitKey(address);
    const data = localStorage.getItem(key);
    const visits: string[] = data ? JSON.parse(data) : [];
    const today = new Date().toISOString().slice(0, 10);
    if (!visits.includes(today)) {
      visits.push(today);
    }
    // Keep only last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const filtered = visits.filter(v => new Date(v) >= cutoff);
    localStorage.setItem(key, JSON.stringify(filtered));
    return filtered.length;
  } catch {
    return 0;
  }
}

export function useMissions(address: string | null) {
  const [missions, setMissions] = useState<MissionStatus[]>([]);
  const [totalClaimedPoints, setTotalClaimedPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);

  const buildMissions = useCallback(async () => {
    if (!address || !ethers.isAddress(address)) {
      setMissions([]);
      setTotalClaimedPoints(0);
      return;
    }

    const validAddress = ethers.getAddress(address);
    setIsLoading(true);

    try {
      // Fetch on-chain data to determine mission completion
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, rpcProvider);
      const eurcContract = new ethers.Contract(TOKENS.EURC.address, ERC20_ABI, rpcProvider);

      const [usdcBal, eurcBal, txCount] = await Promise.all([
        usdcContract.balanceOf(validAddress).catch(() => BigInt(0)) as Promise<bigint>,
        eurcContract.balanceOf(validAddress).catch(() => BigInt(0)) as Promise<bigint>,
        rpcProvider.getTransactionCount(validAddress).catch(() => 0) as Promise<number>,
      ]);

      const hasTokens = usdcBal > BigInt(0) || eurcBal > BigInt(0);
      const activeDays = recordVisit(validAddress);

      // Determine completion from on-chain data
      const completed: boolean[] = [
        true,                                          // Mission 0: Identity Link - wallet connected
        txCount > 0,                                   // Mission 1: Payload Transmission - has txs
        txCount > 5,                                   // Mission 2: Liquidity Provision - active user
        false,                                         // Mission 3: Ecosystem Bridge - manual check
        activeDays >= 3,                               // Mission 4: Daily Check-in - 3 visits
      ];

      const claimed = loadClaimed(validAddress);
      let totalPoints = 0;

      const missionData: MissionStatus[] = [
        { id: 0, title: 'Identity Link', description: 'Connect your Web3 wallet to the terminal.', points: 10, completed: completed[0], claimed: claimed.has(0) },
        { id: 1, title: 'Payload Transmission', description: 'Complete your first ERC20 transfer on Arc.', points: 50, completed: completed[1], claimed: claimed.has(1) },
        { id: 2, title: 'Liquidity Provision', description: 'Swap or add liquidity to any supported DEX.', points: 100, completed: completed[2], claimed: claimed.has(2) },
        { id: 3, title: 'Ecosystem Bridge', description: 'Bridge assets from another network to Arc.', points: 250, completed: completed[3], claimed: claimed.has(3) },
        { id: 4, title: 'Daily Check-in', description: 'Access the terminal 3 days in a row.', points: 25, completed: completed[4], claimed: claimed.has(4) },
      ];

      missionData.forEach(m => {
        if (m.claimed) totalPoints += m.points;
      });

      setMissions(missionData);
      setTotalClaimedPoints(totalPoints);
    } catch (err) {
      console.error('[useMissions] Fetch error:', err);
      setMissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const claimMission = async (missionId: number) => {
    if (!address) return false;

    setIsClaiming(missionId);
    try {
      // Simulate on-chain delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const claimed = loadClaimed(address);
      claimed.add(missionId);
      saveClaimed(address, claimed);

      await buildMissions();
      return true;
    } catch (err) {
      console.error('[useMissions] Claim error:', err);
      return false;
    } finally {
      setIsClaiming(null);
    }
  };

  useEffect(() => {
    buildMissions();
  }, [buildMissions]);

  return { missions, totalClaimedPoints, isLoading, isClaiming, claimMission, refresh: buildMissions };
}
