'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions, Position } from '@/hooks/useOmniPositions';
import { truncateAddress, cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { 
  ShieldCheck, Trophy, Search, User, ChevronDown, Share2, Layers
} from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';

interface LeaderboardEntry {
  address: string;
  score: number;
  txs: number;
  netWorth: number;
  rank: number;
  label?: string;
}

export default function LeaderboardPage() {
  const { address: connectedAddress } = useWallet();
  const [searchAddress, setSearchAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  
  const currentTarget = activeAddress || connectedAddress;
  const { extraData, positions } = useOmniPositions(currentTarget);
  const [activeTab, setActiveTab] = useState<'rankings' | 'airdrop'>('rankings');
  const [displayCount, setDisplayCount] = useState(10);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const currentScore = extraData.score || 0;
  const currentNetWorth = positions.reduce((acc: number, pos: Position) => acc + pos.valueUsd, 0);

  // PRE-CONFIGURED TOP WHALES
  const topTiers: LeaderboardEntry[] = useMemo(() => [
    { address: '0x1c8300000000000000000000000000000000a83d', score: 1254000, txs: 15400, netWorth: 850000, rank: 1, label: 'Protocol Sentinel' },
    { address: '0x992a00000000000000000000000000000000f411', score: 982100, txs: 12500, netWorth: 420000, rank: 2, label: 'Arc Titan' },
    { address: '0x551100000000000000000000000000000000bc22', score: 748900, txs: 8600, netWorth: 210000, rank: 3, label: 'Heavy Liquidity' },
  ], []);

  // FIXED OPERATOR WALLETS
  const userWallets: LeaderboardEntry[] = useMemo(() => [
    { address: '0x424fF7f4A7CBB654E5168829C8535be3C0ef2e6c', score: 324000, txs: 1568, netWorth: 31000, rank: 0 },
    { address: '0x835B7952dCA28c7528b62a911536BB495cFfb5d0', score: 284000, txs: 1200, netWorth: 22000, rank: 0 },
    { address: '0xd4C5363271EB51Cff7C90bcd90d51D1C51057221', score: 182000, txs: 900, netWorth: 12000, rank: 0 },
  ], []);

  const entries = useMemo(() => {
    let list = [...topTiers, ...userWallets];
    
    // Add current search target if not already present
    if (currentTarget) {
       const exists = list.find(w => w.address.toLowerCase() === currentTarget.toLowerCase());
       if (!exists) {
          list.push({
             address: currentTarget,
             score: currentScore,
             txs: extraData.txCount,
             netWorth: currentNetWorth,
             rank: 0
          });
       } else {
          // Update the score of the existing entry with live data
          list = list.map(e => e.address.toLowerCase() === currentTarget.toLowerCase() ? {
             ...e,
             score: Math.max(e.score, currentScore),
             txs: Math.max(e.txs, extraData.txCount),
             netWorth: Math.max(e.netWorth, currentNetWorth)
          } : e);
       }
    }

    return list.sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
  }, [currentTarget, currentScore, extraData.txCount, currentNetWorth, topTiers, userWallets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchAddress.trim();
    if (ethers.isAddress(clean)) {
      setActiveAddress(clean);
      // Stay on current tab to allow viewing search result in ranking or checker
    } else {
      alert("Invalid address.");
    }
  };

  const handleDownloadShareCard = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toPng(shareCardRef.current, { cacheBust: true });
    const link = document.createElement('a');
    link.download = `arc-card.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pt-24 pb-20 text-white">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
           <h1 className="text-6xl font-black arc-gradient-text tracking-tighter leading-none uppercase italic">Arc Oracle</h1>
           <p className="text-white/20 uppercase text-[10px] tracking-[0.5em] font-black mt-2 italic">Institutional Network Index</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-full border border-white/5 shadow-2xl backdrop-blur-xl">
           <button onClick={() => setActiveTab('rankings')} className={cn("px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'rankings' ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white")}>
             Global Rankings
           </button>
           <button onClick={() => setActiveTab('airdrop')} className={cn("px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'airdrop' ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white")}>
             Airdrop Checker
           </button>
        </div>
      </header>

      {activeTab === 'rankings' ? (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="arc-glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl bg-black/20">
              <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
                 <div className="text-center lg:text-left">
                    <h3 className="font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center lg:justify-start gap-3">
                       <Trophy className="w-5 h-5 text-yellow-500" />
                       World Protocol Consensus
                    </h3>
                    <p className="text-[10px] text-white/20 mt-1 font-bold uppercase">Real-time Node Audit</p>
                 </div>
                 
                 <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="text" 
                      placeholder="Search Node Address..."
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-xs font-mono focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-white/10 shadow-inner"
                    />
                 </form>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                       <tr className="bg-white/[0.02]">
                          <th className="px-10 py-5 text-[9px] font-black uppercase text-white/10 tracking-[0.3em]">Pos</th>
                          <th className="px-10 py-5 text-[9px] font-black uppercase text-white/10 tracking-[0.3em]">Identity</th>
                          <th className="px-10 py-5 text-[9px] font-black uppercase text-white/10 tracking-[0.3em] text-right">Ecosystem Value</th>
                          <th className="px-10 py-5 text-[9px] font-black uppercase text-white/10 tracking-[0.3em] text-right">Consensus</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {entries.slice(0, displayCount).map((entry) => {
                          const isCurrent = entry.address.toLowerCase() === (currentTarget || '').toLowerCase();
                          return (
                             <tr key={entry.address} className={cn("group transition-all", isCurrent ? "bg-blue-500/[0.1] border-l-4 border-blue-500" : "hover:bg-white/[0.02]")}>
                                <td className="px-10 py-8">
                                   <div className={cn(
                                     "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border",
                                     entry.rank <= 3 ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/5"
                                   )}>
                                      {entry.rank}
                                   </div>
                                </td>
                                <td className="px-10 py-8">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                                         <User className="w-5 h-5 text-white/20" />
                                      </div>
                                      <div>
                                         <p className="text-xs font-black font-mono leading-none">
                                            {entry.address.toLowerCase() === connectedAddress?.toLowerCase() ? 'YOU (LOCAL_NODE)' : truncateAddress(entry.address)}
                                         </p>
                                         <div className="flex items-center gap-2 mt-1.5">
                                            {entry.label && <span className="text-[8px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-black uppercase border border-yellow-500/20">{entry.label}</span>}
                                            {isCurrent && <span className="text-[8px] px-2 py-0.5 rounded bg-blue-500 text-white font-black uppercase shadow-lg shadow-blue-500/40">REALTIME</span>}
                                         </div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                   <p className="text-sm font-black font-mono leading-none">${entry.netWorth.toLocaleString()}</p>
                                   <p className="text-[9px] text-white/20 font-black uppercase mt-1.5">{entry.txs} Ops</p>
                                </td>
                                <td className="px-10 py-8 text-right">
                                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                      <p className="text-sm font-black font-mono leading-none">{entry.score.toLocaleString()}</p>
                                   </div>
                                </td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
              </div>
              <div className="p-12 text-center">
                 <button onClick={() => setDisplayCount(prev => prev + 10)} className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all flex flex-col items-center gap-2 mx-auto italic">
                    <ChevronDown className="w-5 h-5" />
                    Load Next Tier
                 </button>
              </div>
           </div>
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-12">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7" ref={shareCardRef}>
                 <div className="bg-[#050505] rounded-[3rem] p-10 text-white relative overflow-hidden border border-white/10 shadow-2xl h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full" />
                    <div>
                       <div className="flex justify-between items-start mb-10 relative z-10">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                             <Layers className="w-7 h-7 text-black" />
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase text-white/40 tracking-widest leading-none mb-1.5">Network Rank</p>
                             <p className="text-5xl font-black font-mono tracking-tighter leading-none">#{entries.find(e => e.address.toLowerCase() === (currentTarget || '').toLowerCase())?.rank || '---'}</p>
                          </div>
                       </div>
                       <h3 className="text-6xl font-black tracking-tighter mb-6 leading-[0.85] uppercase italic">Ecosystem<br/>Titan.</h3>
                       <p className="text-xs font-black font-mono text-blue-500 uppercase tracking-widest">{truncateAddress(currentTarget || '')}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mt-16 relative z-10 border-t border-white/5 pt-10">
                       <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Drop Score</p><p className="text-2xl font-black font-mono">{currentScore.toLocaleString()}</p></div>
                       <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">TVL context</p><p className="text-2xl font-black font-mono">${currentNetWorth.toLocaleString()}</p></div>
                       <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Ops count</p><p className="text-2xl font-black font-mono">{extraData.txCount}</p></div>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                 <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-4 relative overflow-hidden shadow-lg bg-black/40">
                    <div className="flex justify-between items-start relative z-10 text-white">
                       <div>
                          <h4 className="text-[9px] font-black uppercase text-white/20 mb-1.5">Engagement</h4>
                          <p className="text-3xl font-black font-mono leading-none">{extraData.activeDays} Epochs</p>
                       </div>
                       <ShieldCheck className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${(extraData.activeDays / 30) * 100}%` }} className="h-full bg-blue-500" />
                    </div>
                 </div>
                 <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-4 relative overflow-hidden shadow-lg bg-black/40">
                    <div className="flex justify-between items-start relative z-10 text-white">
                       <div>
                          <h4 className="text-[9px] font-black uppercase text-white/20 mb-1.5">Dominance</h4>
                          <p className="text-3xl font-black font-mono leading-none">{positions.length} Active</p>
                       </div>
                       <ShieldCheck className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${(positions.length / 5) * 100}%` }} className="h-full bg-blue-500" />
                    </div>
                 </div>
                 <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5 text-center bg-white/[0.01]">
                    <Share2 className="w-6 h-6 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-sm font-black uppercase italic mb-2">Share Identity</h4>
                    <button onClick={handleDownloadShareCard} className="w-full py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">Download PNG</button>
                 </div>
              </div>
           </div>
        </section>
      )}
    </main>
  );
}
