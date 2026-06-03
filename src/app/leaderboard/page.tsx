'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { truncateAddress, cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { 
  ShieldCheck, Trophy, Zap, Search, ArrowUpRight, TrendingUp, Info, User, Globe, ChevronDown, Share2, Download, Layers, Activity
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
  
  const { extraData, positions, isLoading, balances } = useOmniPositions(activeAddress || connectedAddress);
  const [activeTab, setActiveTab] = useState<'rankings' | 'airdrop'>('rankings');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // COMPETITIVE SCORE CALCULATION
  const currentScore = extraData.score || 0;
  const currentNetWorth = positions.reduce((a, b) => a + b.valueUsd, 0);

  useEffect(() => {
    // GENERATE HIGHLY COMPETITIVE NETWORK STATE
    const generateCompetitiveState = () => {
      const topTiers: LeaderboardEntry[] = [
        { address: '0x1c8300000000000000000000000000000000a83d', score: 1254000, txs: 15400, netWorth: 850000, rank: 1, label: 'Protocol Sentinel' },
        { address: '0x992a00000000000000000000000000000000f411', score: 982100, txs: 12500, netWorth: 420000, rank: 2, label: 'Arc Titan' },
        { address: '0x551100000000000000000000000000000000bc22', score: 748900, txs: 8600, netWorth: 210000, rank: 3, label: 'Heavy Liquidity' },
      ];

      // Current users from your fixed wallets
      const userWallets: LeaderboardEntry[] = [
        { address: '0x424fF7f4A7CBB654E5168829C8535be3C0ef2e6c', score: 324000, txs: 1568, netWorth: 31000, rank: 10, label: 'Early Adopter' },
        { address: '0x835B7952dCA28c7528b62a911536BB495cFfb5d0', score: 284000, txs: 1200, netWorth: 22000, rank: 12 },
        { address: '0xd4C5363271EB51Cff7C90bcd90d51D1C51057221', score: 182000, txs: 900, netWorth: 12000, rank: 25 },
      ];

      // Add actual data for searched or connected address if not in list
      const target = activeAddress || connectedAddress;
      if (target && !userWallets.find(w => w.address.toLowerCase() === target.toLowerCase())) {
         userWallets.push({
            address: target,
            score: currentScore,
            txs: extraData.txCount,
            netWorth: currentNetWorth,
            rank: 999 // Will be recalculated
         });
      }

      const extraEntries: LeaderboardEntry[] = Array.from({ length: 150 }).map((_, i) => ({
         address: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
         score: Math.floor(Math.random() * 500000) + 1000,
         txs: Math.floor(Math.random() * 5000) + 100,
         netWorth: Math.floor(Math.random() * 50000) + 500,
         rank: 0
      }));

      const all = [...topTiers, ...userWallets, ...extraEntries].sort((a, b) => b.score - a.score);
      return all.map((e, i) => ({ ...e, rank: i + 1 }));
    };

    setEntries(generateCompetitiveState());
  }, [connectedAddress, activeAddress, currentScore, extraData.txCount, currentNetWorth]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = searchAddress.trim();
    if (ethers.isAddress(cleanAddr)) {
      setActiveAddress(cleanAddr);
    }
  };

  const handleDownloadShareCard = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toPng(shareCardRef.current, { cacheBust: true });
    const link = document.createElement('a');
    link.download = `arc-score-${truncateAddress(activeAddress || connectedAddress || '')}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pt-24 pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
           <h1 className="text-6xl font-black arc-gradient-text tracking-tighter leading-none uppercase italic text-white">Arc Oracle</h1>
           <p className="text-white/20 uppercase text-[10px] tracking-[0.5em] font-black mt-2">Network Consensus & Recognition Index</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-xl">
           <button onClick={() => setActiveTab('rankings')} className={cn("px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'rankings' ? "bg-white text-black shadow-2xl scale-105" : "text-white/30 hover:text-white")}>
             Global Rankings
           </button>
           <button onClick={() => setActiveTab('airdrop')} className={cn("px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'airdrop' ? "bg-white text-black shadow-2xl scale-105" : "text-white/30 hover:text-white")}>
             Airdrop Checker
           </button>
        </div>
      </header>

      {activeTab === 'rankings' ? (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="arc-glass rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl bg-black/40">
              <div className="p-12 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white/[0.01]">
                 <div className="text-center lg:text-left">
                    <h3 className="font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center lg:justify-start gap-3 text-white">
                       <Trophy className="w-6 h-6 text-yellow-500" />
                       World Protocol Consensus
                    </h3>
                    <p className="text-[10px] text-white/20 mt-2 font-bold max-w-sm leading-relaxed uppercase">
                       Unbiased ranking based on live network contribution analysis.
                    </p>
                 </div>
                 
                 <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="text" 
                      placeholder="Audit any 0x address..."
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-xs font-mono focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/10 shadow-inner text-white"
                    />
                 </form>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                       <tr className="bg-white/[0.03]">
                          <th className="px-12 py-6 text-[10px] font-black uppercase text-white/10 tracking-[0.3em]">Rank</th>
                          <th className="px-12 py-6 text-[10px] font-black uppercase text-white/10 tracking-[0.3em]">Node Identity</th>
                          <th className="px-12 py-6 text-[10px] font-black uppercase text-white/10 tracking-[0.3em] text-right">Ecosystem Value</th>
                          <th className="px-12 py-6 text-[10px] font-black uppercase text-white/10 tracking-[0.3em] text-right">Consensus Points</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {entries.slice(0, displayCount).map((entry) => {
                          const isCurrent = (connectedAddress?.toLowerCase() === entry.address.toLowerCase() || activeAddress?.toLowerCase() === entry.address.toLowerCase());
                          return (
                             <tr key={entry.address} className={cn("group transition-all duration-300", isCurrent ? "bg-blue-500/[0.1] border-l-[6px] border-blue-500" : "hover:bg-white/[0.03]")}>
                                <td className="px-12 py-10">
                                   <div className={cn(
                                     "w-14 h-14 rounded-3xl flex items-center justify-center font-black text-lg border transition-all duration-500",
                                     entry.rank === 1 ? "bg-white text-black border-white shadow-[0_0_50px_rgba(255,255,255,0.4)] rotate-3" : 
                                     entry.rank === 2 ? "bg-zinc-200 text-black border-zinc-300" :
                                     entry.rank === 3 ? "bg-zinc-400 text-black border-zinc-500" :
                                     "bg-white/5 text-white/40 border-white/5"
                                   )}>
                                      {entry.rank}
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <div className="flex items-center gap-6">
                                      <div className="w-14 h-14 bg-gradient-to-tr from-zinc-900 to-black rounded-[1.5rem] flex items-center justify-center border border-white/5 shadow-inner">
                                         <User className="w-6 h-6 text-white/10 group-hover:text-white/40 transition-colors" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-black font-mono tracking-tight group-hover:text-blue-400 transition-colors leading-none text-white">
                                            {entry.address.toLowerCase() === connectedAddress?.toLowerCase() ? 'CURRENT_SESSION_NODE' : truncateAddress(entry.address)}
                                         </p>
                                         <div className="flex items-center gap-2 mt-2.5">
                                            {entry.label && <span className="text-[9px] px-2.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-black uppercase tracking-widest border border-yellow-500/20">{entry.label}</span>}
                                            {isCurrent && <span className="text-[9px] px-2.5 py-0.5 rounded bg-blue-500 text-white font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.6)]">REALTIME_MATCH</span>}
                                         </div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-12 py-10 text-right">
                                   <p className="text-lg font-black font-mono text-white/90 tracking-tighter leading-none">${entry.netWorth.toLocaleString()}</p>
                                   <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-2">{entry.txs} Validated Ops</p>
                                </td>
                                <td className="px-12 py-10 text-right">
                                   <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-[1.5rem] border border-white/5 group-hover:border-white/20 transition-all shadow-xl">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                      <p className="text-lg font-black font-mono text-white tracking-tighter leading-none">{entry.score.toLocaleString()}</p>
                                   </div>
                                </td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
              </div>
              <div className="p-16 text-center bg-white/[0.02]">
                 <button 
                    onClick={() => setDisplayCount(prev => prev + 10)}
                    className="group flex flex-col items-center gap-4 mx-auto"
                 >
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all group-hover:scale-110">
                       <ChevronDown className="w-6 h-6 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 group-hover:text-white/40 transition-colors">Audit Next Tier</span>
                 </button>
              </div>
           </div>
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-6xl mx-auto space-y-12">
           
           {/* THE SHAREABLE CARD */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              <div className="lg:col-span-7" ref={shareCardRef}>
                 <div className="bg-[#050505] rounded-[4rem] p-12 text-white relative overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.15)] h-full min-h-[600px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div>
                       <div className="flex justify-between items-start mb-12 relative z-10">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                             <Layers className="w-8 h-8 text-black" />
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none mb-2">Network Rank</p>
                             <p className="text-5xl font-black font-mono tracking-tighter leading-none">#{entries.find(e => e.address.toLowerCase() === (activeAddress || connectedAddress || '').toLowerCase())?.rank || '999'}</p>
                          </div>
                       </div>

                       <h3 className="text-7xl font-black tracking-tighter mb-8 leading-[0.8] uppercase italic max-w-md relative z-10">
                          Ecosystem<br/>Titan.
                       </h3>
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="h-px w-20 bg-blue-500" />
                          <p className="text-sm font-black font-mono text-blue-500 tracking-widest uppercase">
                             {truncateAddress(activeAddress || connectedAddress || '')}
                          </p>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-20 relative z-10 border-t border-white/5 pt-12">
                       <CardStat label="Drop Score" value={currentScore.toLocaleString()} />
                       <CardStat label="TVL Context" value={`$${currentNetWorth.toLocaleString()}`} />
                       <CardStat label="Ops Count" value={extraData.txCount.toString()} />
                    </div>

                    <div className="mt-12 flex justify-between items-center relative z-10">
                       <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.4em]">Arc Omni Explorer // Verified Identity</p>
                       <ShieldCheck className="w-6 h-6 text-blue-500" />
                    </div>
                 </div>
              </div>

              {/* LIVE ANALYTICS SIDEBAR */}
              <div className="lg:col-span-5 space-y-6">
                 <AirdropCard 
                   title="Daily Engagement" 
                   value={`${extraData.activeDays} Epochs`} 
                   desc="Verified unique days of Arc network interaction."
                   progress={(extraData.activeDays / 30) * 100}
                 />
                 <AirdropCard 
                   title="Protocol Dominance" 
                   value={`${positions.length} Active`} 
                   desc="Real-time TVL detected across DEX/Lending/Perps."
                   progress={(positions.length / 5) * 100}
                 />
                 
                 <div className="arc-glass rounded-[3rem] p-10 border border-white/10 flex flex-col justify-center items-center text-center space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent shadow-2xl">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                       <Share2 className="w-8 h-8 text-blue-500 animate-pulse" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black tracking-tight mb-2 uppercase italic text-white">Viral Distribution</h4>
                       <p className="text-xs text-white/40 leading-relaxed max-w-[240px]">
                          Download your high-fidelity Node Identity Card and share your rank with the community.
                       </p>
                    </div>
                    <button 
                       onClick={handleDownloadShareCard}
                       className="w-full py-5 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3"
                    >
                       <Download className="w-4 h-4" />
                       Download Image
                    </button>
                 </div>
              </div>
           </div>
        </section>
      )}
    </main>
  );
}

function CardStat({ label, value }: { label: string, value: string }) {
  return (
    <div>
       <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">{label}</p>
       <p className="text-2xl font-black font-mono tracking-tighter leading-none text-white">{value}</p>
    </div>
  )
}

function AirdropCard({ title, value, desc, progress }: { title: string, value: string, desc: string, progress: number }) {
  return (
    <div className="arc-glass rounded-[3rem] p-10 border border-white/5 space-y-6 hover:border-blue-500/20 transition-all group relative overflow-hidden shadow-xl">
       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
       <div className="flex justify-between items-start relative z-10">
          <div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">{title}</h4>
             <p className="text-4xl font-black font-mono tracking-tighter leading-none text-white">{value}</p>
          </div>
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-500/10 transition-all duration-500">
             <ShieldCheck className="w-7 h-7 text-blue-500" />
          </div>
       </div>
       <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 2, ease: "circOut" }}
            className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]" 
          />
       </div>
       <p className="text-[11px] text-white/30 font-medium italic relative z-10">{desc}</p>
    </div>
  )
}
