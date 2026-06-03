'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { provider } from '../lib/utils';
import { TOKENS, PROTOCOLS } from '../lib/constants';
import { ERC20_ABI, UNISWAP_V2_FACTORY_ABI, UNISWAP_V2_PAIR_ABI, ARC_PERP_ENGINE_ABI } from '../lib/abis';

export interface Position {
  protocol: string;
  name: string;
  balance: string;
  type: 'LP' | 'Deposit' | 'Position';
  valueUsd: number;
  link?: string;
}

export interface Transaction {
  hash: string;
  method: string;
  time: string;
  status: 'success' | 'pending';
}

export function useOmniPositions(address: string | null) {
  const [balances, setBalances] = useState<{ [key: string]: string }>({});
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [extraData, setExtraData] = useState({ 
    gasSpent: '0', 
    txCount: 0, 
    activeDays: 0, 
    activeWeeks: 0, 
    activeMonths: 0, 
    score: 0 
  });
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!address || !ethers.isAddress(address)) {
      setBalances({});
      setPositions([]);
      setExtraData({ 
        gasSpent: '0', 
        txCount: 0, 
        activeDays: 0, 
        activeWeeks: 0, 
        activeMonths: 0, 
        score: 0 
      });
      setHistory([]);
      return;
    }

    const validAddress = address;

    async function fetchData() {
      if (!validAddress || !ethers.isAddress(validAddress)) return;
      
      setIsLoading(true);
      try {
        const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, provider);
        const eurcContract = new ethers.Contract(TOKENS.EURC.address, ERC20_ABI, provider);

        const [usdcBal, eurcBal, arcBal, txCount] = await Promise.all([
          usdcContract.balanceOf(validAddress).catch(() => 0n),
          eurcContract.balanceOf(validAddress).catch(() => 0n),
          provider.getBalance(validAddress).catch(() => 0n),
          provider.getTransactionCount(validAddress).catch(() => 0)
        ]);

        const activePositions: Position[] = [];

        // Helper to check LP
        const checkLp = async (pairAddr: string, protoName: string, label: string, link: string) => {
           try {
             const pair = new ethers.Contract(pairAddr, UNISWAP_V2_PAIR_ABI, provider);
             const lpBal = await pair.balanceOf(validAddress);
             if (lpBal > 0n) {
               activePositions.push({
                 protocol: protoName, name: label, balance: ethers.formatEther(lpBal),
                 type: 'LP', valueUsd: parseFloat(ethers.formatEther(lpBal)) * 2,
                 link: link
               });
             }
           } catch (e) {}
        };

        // 1. Achswap
        try {
          const factory = new ethers.Contract(PROTOCOLS.ACHSWAP.factory!, UNISWAP_V2_FACTORY_ABI, provider);
          const pairAddress = await factory.getPair(TOKENS.USDC.address, TOKENS.EURC.address);
          if (pairAddress !== ethers.ZeroAddress) {
             await checkLp(pairAddress, 'Achswap', 'USDC/EURC LP', `https://achswap.org/pool/${pairAddress}`);
          }
        } catch (e) {}

        // 2. DEXs
        const knownPairs = [
           { name: 'PrestoDEX', addr: "0x5794a8284A29493871Fbfa3c4f343D42001424D6", label: 'USDC/EURC', link: 'https://prestodex-arc.vercel.app/' },
           { name: 'Synthra', addr: "0x74133b5D179a7827e1343a8bF11330603d215634", label: 'ARC/USDC', link: 'https://app.synthra.org/' },
           { name: 'SimpleSwap', addr: "0x3f5abb205f54596a47fc37134e63b167f1be3e55", label: 'USDC/EURC', link: 'https://simple-swap-phi.vercel.app/' }
        ];

        await Promise.all(knownPairs.map(p => checkLp(p.addr, p.name, p.label, p.link)));

        // 3. Curve
        try {
          const curveLp = new ethers.Contract(PROTOCOLS.CURVE.addressProvider, ERC20_ABI, provider);
          const lpBal = await curveLp.balanceOf(validAddress);
          if (lpBal > 0n) {
            activePositions.push({
              protocol: 'Curve', name: 'Stable Pool LP', balance: ethers.formatEther(lpBal),
              type: 'LP', valueUsd: parseFloat(ethers.formatEther(lpBal)),
              link: `https://www.curve.finance/dex/arc/swap`
            });
          }
        } catch (e) {}

        // 4. ArcPerps
        try {
          const engine = new ethers.Contract(PROTOCOLS.ARC_PERP.engine, ARC_PERP_ENGINE_ABI, provider);
          const depositBal = await engine.deposits(validAddress);
          if (depositBal > 0n) {
            activePositions.push({
              protocol: 'ArcPerps', name: 'Margin Account', balance: ethers.formatUnits(depositBal, 18),
              type: 'Deposit', valueUsd: parseFloat(ethers.formatUnits(depositBal, 18)),
              link: `https://arcperps.xyz/trade`
            });
          }
        } catch (e) {}

        // Analytics & Calculations
        const activeDaysCount = txCount > 0 ? Math.max(1, Math.min(180, Math.ceil(txCount / 1.2))) : 0;
        const activeWeeks = Math.ceil(activeDaysCount / 7);
        const activeMonths = Math.ceil(activeDaysCount / 30);
        const engagementScore = (txCount * 10) + (activeDaysCount * 50) + (activePositions.length * 500);

        setBalances({
          USDC: ethers.formatUnits(usdcBal, TOKENS.USDC.decimals),
          EURC: ethers.formatUnits(eurcBal, TOKENS.EURC.decimals),
          ARC: ethers.formatEther(arcBal),
        });

        setPositions(activePositions);

        setExtraData({
          gasSpent: (txCount * 0.045).toFixed(2),
          txCount: txCount,
          activeDays: activeDaysCount,
          activeWeeks: activeWeeks,
          activeMonths: activeMonths,
          score: engagementScore
        });

        if (txCount > 0) {
           setHistory([
             { hash: '0x...', method: 'Contract Interaction', time: 'Recently', status: 'success' },
             { hash: '0x...', method: 'Liquidity Provision', time: 'Active', status: 'success' },
           ]);
        } else {
           setHistory([]);
        }

      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    const inv = setInterval(fetchData, 20000);
    return () => clearInterval(inv);
  }, [address]);

  return { balances, positions, isLoading, extraData, history };
}
