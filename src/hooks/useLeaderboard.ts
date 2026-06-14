'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LeaderboardStats {
    totalWallets: number;
    totalTxCount: number;
    totalValueUsd: number;
    avgScore: number;
}

export interface LeaderboardEntry {
    address: string;
    label?: string;
    score: number;
    tx_count: number;
    net_worth: number;
    active_days: number;
    rank: number;
    percentile: number;
}

export function useLeaderboard(address: string | null) {
    const [stats, setStats] = useState<LeaderboardStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = address ? `?address=${encodeURIComponent(address)}` : '';
            const res = await fetch(`/api/leaderboard${params}`);
            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
                setLeaderboard(data.leaderboard);
                setUserEntry(data.userEntry);
                setError(null);
            } else {
                setError(data.message || 'No Global Data Available');
            }
        } catch (err) {
            setError('No Global Data Available');
            console.error("[useLeaderboard] Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    // POST only sends the address — server computes all values from on-chain data
    const registerWallet = async (entry: { address: string }) => {
        try {
            await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: entry.address }),
            });
            await fetchLeaderboard();
        } catch (err) {
            console.error("[useLeaderboard] Register error:", err);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return { stats, leaderboard, userEntry, isLoading, error, registerWallet, refresh: fetchLeaderboard };
}
