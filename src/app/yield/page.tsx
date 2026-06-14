'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { rpcProvider } from '@/lib/utils';
import { TOKENS, PROTOCOLS } from '@/lib/constants';
import { ERC20_ABI, UNISWAP_V2_FACTORY_ABI, UNISWAP_V2_PAIR_ABI } from '@/lib/abis';
import { TrendingUp, ExternalLink, RefreshCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YieldProtocol {
  name: string;
  type: string;
  apy: number;
  tvl: number;
  userDeposited: number;
  url: string;
  status: 'active' | 'estimated';
}

export default function YieldPage() {
  const [protocols, setProtocols] = useState<YieldProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('arc-active-node');
    if (saved) setAddress(saved);
  }, []);

  const fetchYieldData = async () => {
    setIsLoading(true);
    try {
      const results: YieldProtocol[] = [];

      // Achswap LP
      try {
        const factory = new ethers.Contract(PROTOCOLS.ACHSWAP.factory, UNISWAP_V2_FACTORY_ABI, rpcProvider);
        const pairAddr = await factory.getPair(TOKENS.USDC.address, TOKENS.EURC.address);
        if (pairAddr !== ethers.ZeroAddress) {
          const pair = new ethers.Contract(pairAddr, UNISWAP_V2_PAIR_ABI, rpcProvider);
          const [reserves, totalSupply] = await Promise.all([pair.getReserves(), pair.totalSupply()]);
          const tvl = parseFloat(ethers.formatUnits(reserves[0], TOKENS.USDC.decimals)) * 2;
          let userDeposited = 0;
          if (address && ethers.isAddress(address)) {
            const lpBal = await pair.balanceOf(address);
            userDeposited = lpBal > BigInt(0) ? parseFloat(ethers.formatEther(lpBal)) * 2 : 0;
          }
          results.push({ name: 'Achswap USDC/EURC', type: 'LP', apy: 12.5, tvl, userDeposited, url: 'https://achswap.org/pool', status: 'active' });
        }
      } catch { /* skip */ }

      // Known DEXes
      const knownPairs: { name: string; addr: string; url: string; apy: number }[] = [
        { name: 'PrestoDEX USDC/EURC', addr: '0x5794a8284A29493871Fbfa3c4f343D42001424D6', url: 'https://prestodex-arc.vercel.app/', apy: 8.3 },
        { name: 'SimpleSwap USDC/EURC', addr: '0x3f5abb205f54596a47fc37134e63b167f1be3e55', url: 'https://simple-swap-phi.vercel.app/', apy: 6.7 },
        { name: 'Synthra ARC/USDC', addr: '0x74133b5D179a7827e1343a8bF11330603d215634', url: 'https://app.synthra.org/', apy: 15.2 },
      ];

      for (const kp of knownPairs) {
        try {
          const pair = new ethers.Contract(kp.addr, UNISWAP_V2_PAIR_ABI, rpcProvider);
          const reserves = await pair.getReserves();
          const tvl = parseFloat(ethers.formatUnits(reserves[0], TOKENS.USDC.decimals)) * 2;
          let userDeposited = 0;
          if (address && ethers.isAddress(address)) {
            const lpBal = await pair.balanceOf(address);
            userDeposited = lpBal > BigInt(0) ? parseFloat(ethers.formatEther(lpBal)) * 2 : 0;
          }
          results.push({ name: kp.name, type: 'LP', apy: kp.apy, tvl, userDeposited, url: kp.url, status: 'active' });
        } catch { /* skip */ }
      }

      // ArcPerps
      try {
        const engine = new ethers.Contract(PROTOCOLS.ARC_PERP.engine, ['function deposits(address) view returns (uint256)'], rpcProvider);
        let userDeposited = 0;
        if (address && ethers.isAddress(address)) {
          const dep = await engine.deposits(address);
          userDeposited = dep > BigInt(0) ? parseFloat(ethers.formatUnits(dep, 18)) : 0;
        }
        results.push({ name: 'ArcPerps Margin', type: 'Margin', apy: 22.0, tvl: 45000, userDeposited, url: 'https://arcperps.xyz/trade', status: 'estimated' });
      } catch { /* skip */ }

      // Curve
      results.push({ name: 'Curve Stable Pool', type: 'Stable LP', apy: 5.8, tvl: 125000, userDeposited: 0, url: 'https://www.curve.finance/dex/arc/swap', status: 'estimated' });

      setProtocols(results);
    } catch (err) {
      console.error('[YieldPage] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchYieldData(); }, [address]);

  const totalTvl = protocols.reduce((s, p) => s + p.tvl, 0);
  const totalDeposited = protocols.reduce((s, p) => s + p.userDeposited, 0);
  const avgApy = protocols.length > 0 ? protocols.reduce((s, p) => s + p.apy, 0) / protocols.length : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">yield</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">DEFI_AGGREGATOR</span>
          </div>
          <button onClick={fetchYieldData} disabled={isLoading} className="btn-terminal py-2 px-4 text-[9px]">
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'refresh'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="terminal-card p-4">
          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">total_tvl</p>
          <p className="font-mono text-lg font-bold text-[#00ff41] glow-green">${totalTvl.toLocaleString()}</p>
        </div>
        <div className="terminal-card p-4">
          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">your_deposits</p>
          <p className="font-mono text-lg font-bold text-[#ffb000] glow-amber">${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="terminal-card p-4">
          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">avg_apy</p>
          <p className="font-mono text-lg font-bold text-[#e0e0e0]">{avgApy.toFixed(1)}%</p>
        </div>
      </div>

      <div className="terminal-card">
        <div className="p-4 border-b border-[#1a1a1a]">
          <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest">yield_protocols//</span>
        </div>
        <table className="w-full terminal-table">
          <thead>
            <tr>
              <th>protocol</th>
              <th>type</th>
              <th>apy</th>
              <th className="text-right">tvl</th>
              <th className="text-right">your_pos</th>
              <th className="text-right">status</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {protocols.map((p, i) => (
              <tr key={i} className="group hover:bg-[#00ff41]/[0.01] transition-colors">
                <td><span className="font-mono text-[11px] text-[#e0e0e0] group-hover:text-[#00ff41] transition-colors">{p.name}</span></td>
                <td><span className="font-mono text-[9px] text-[#4a4a4a] uppercase">{p.type}</span></td>
                <td><span className="font-mono text-[11px] text-[#00ff41] font-bold">{p.apy.toFixed(1)}%</span></td>
                <td className="text-right"><span className="font-mono text-[10px] text-[#e0e0e0]">${p.tvl.toLocaleString()}</span></td>
                <td className="text-right"><span className="font-mono text-[10px] text-[#ffb000]">${p.userDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></td>
                <td className="text-right">
                  <span className={cn("tag text-[7px]", p.status === 'active' ? "tag-green" : "tag-amber")}>{p.status}</span>
                </td>
                <td className="text-right">
                  <a href={p.url} target="_blank" rel="noreferrer" className="text-[#2a2a2a] hover:text-[#00ff41] transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ASCII Yield Chart */}
      <div className="terminal-card p-4">
        <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest block mb-3">apy_comparison</span>
        <pre className="font-mono text-[10px] text-[#00ff41] leading-relaxed">
          {protocols.map(p => {
            const bar = '█'.repeat(Math.round(p.apy / 2));
            return `${p.name.slice(0, 20).padEnd(20)} │ ${bar} ${p.apy.toFixed(1)}%`;
          }).join('\n')}
        </pre>
      </div>
    </div>
  );
}
