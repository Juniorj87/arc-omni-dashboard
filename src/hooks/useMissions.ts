'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

const DEFAULT_MISSIONS: MissionStatus[] = [
  { id: 0, title: 'Identity Link', description: 'Connect your Web3 wallet to the terminal.', points: 10, completed: false, claimed: false },
  { id: 1, title: 'Payload Transmission', description: 'Complete your first ERC20 transfer on Arc.', points: 50, completed: false, claimed: false },
  { id: 2, title: 'Liquidity Provision', description: 'Swap or add liquidity to any supported DEX.', points: 100, completed: false, claimed: false },
  { id: 3, title: 'Ecosystem Bridge', description: 'Bridge assets from another network to Arc.', points: 250, completed: false, claimed: false },
  { id: 4, title: 'Daily Check-in', description: 'Access the terminal 3 days in a row.', points: 25, completed: false, claimed: false },
];

function getClaimedKey(address: string): string {
  return `arc-missions-claimed-${address.toLowerCase()}`;
}

function getVisitKey(address: string): string {
  return `arc-missions-visits-${address.toLowerCase()}`;
}

function loadClaimed(address: string): Set<number> {
  try {
    const data = localStorage.getItem(getClaimedKey(address));
    if (!data) return new Set();
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
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
  const [missions, setMissions] = useState<MissionStatus[]>(DEFAULT_MISSIONS);
  const [totalClaimedPoints, setTotalClaimedPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);
  const fetchedRef = useRef<string>('');

  const buildMissions = useCallback(async () => {
    // Always show missions, even without address
    if (!address || !ethers.isAddress(address)) {
      setMissions(DEFAULT_MISSIONS.map(m => ({ ...m, completed: m.id === 0, claimed: false })));
      setTotalClaimedPoints(0);
      fetchedRef.current = '';
      return;
    }

    const validAddress = ethers.getAddress(address);
    // Avoid re-fetching same address
    if (fetchedRef.current === validAddress) return;
    fetchedRef.current = validAddress;

    setIsLoading(true);

    try {
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, rpcProvider);
      const eurcContract = new ethers.Contract(TOKENS.EURC.address, ERC20_ABI, rpcProvider);

      const [usdcBal, eurcBal, txCount] = await Promise.all([
        usdcContract.balanceOf(validAddress).catch(() => BigInt(0)) as Promise<bigint>,
        eurcContract.balanceOf(validAddress).catch(() => BigInt(0)) as Promise<bigint>,
        rpcProvider.getTransactionCount(validAddress).catch(() => 0) as Promise<number>,
      ]);

      const activeDays = recordVisit(validAddress);

      const completed: boolean[] = [
        true,                         // Mission 0: Identity Link
        txCount > 0,                  // Mission 1: Payload Transmission
        txCount > 5,                  // Mission 2: Liquidity Provision
        false,                        // Mission 3: Ecosystem Bridge
        activeDays >= 3,              // Mission 4: Daily Check-in
      ];

      const claimed = loadClaimed(validAddress);
      let totalPoints = 0;

      const missionData: MissionStatus[] = DEFAULT_MISSIONS.map((m, i) => ({
        ...m,
        completed: m.id === 0 ? true : completed[i],
        claimed: claimed.has(m.id),
      }));

      missionData.forEach(m => {
        if (m.claimed) totalPoints += m.points;
      });

      setMissions(missionData);
      setTotalClaimedPoints(totalPoints);
    } catch (err) {
      console.error('[useMissions] Fetch error:', err);
      // Keep default missions on error
      setMissions(DEFAULT_MISSIONS.map(m => ({ ...m, completed: m.id === 0 })));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const claimMission = async (missionId: number) => {
    if (!address) return false;

    setIsClaiming(missionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const claimed = loadClaimed(address);
      claimed.add(missionId);
      saveClaimed(address, claimed);

      fetchedRef.current = '';
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
