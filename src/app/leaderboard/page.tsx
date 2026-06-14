'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions, Position } from '@/hooks/useOmniPositions';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { truncateAddress, cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { 
  ShieldCheck, Trophy, Search, User, ChevronDown, Share2, Layers, 
  Activity, Globe, Users, BarChart3, AlertCircle, Loader2
} from 'lucide-react';
import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { getRankLabel } from '@/lib/scoring';

export default function LeaderboardPage() {
  const { address: connectedAddress } = useWallet();
  const [searchAddress, setSearchAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  
  const currentTarget = activeAddress || connectedAddress;
  const { stats, leaderboard, userEntry, isLoading: isGlobalLoading, error: globalError, registerWallet } = useLeaderboard(currentTarget);
  const { extraData, positions, isLoading: isLocalLoading } = useOmniPositions(currentTarget);
  
  const [activeTab, setActiveTab] = useState<'rankings' | 'airdrop'>('rankings');
  const [displayCount, setDisplayCount] = useState(10);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Sync local data to global leaderboard if viewing connected wallet
  useEffect(() => {
    if (connectedAddress && extraData.score > 0) {
      registerWallet({
        address: connectedAddress,
        score: extraData.score,
        tx_count: extraData.txCount,
        net_worth: positions.reduce((acc, p) => acc + p.valueUsd, 0),
        active_days: extraData.activeDays,
        label: getRankLabel(extraData.score)
      });
    }
  }, [connectedAddress, extraData.score]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchAddress.trim();
    if (ethers.isAddress(clean)) {
      setActiveAddress(clean);
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
    <main className="min-h-screen p-8 max-w-[1600px] mx-auto space-y-12 pt-24 pb-20 text-white">
      {/* Network Statistics Header */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard label="Global Nodes" value={stats?.totalWallets || '--'} icon={Users} color="blue" />
         <StatsCard label="Total Consensus" value={stats?.totalTxCount.toLocaleString() || '--'} icon={Activity} color="purple" />
         <StatsCard label="Network TVL" value={stats ? `$${stats.totalValueUsd.toLocaleString()}` : '--'} icon={Globe} color="orange" />
         <StatsCard label="Avg Score" value={stats?.avgScore.toFixed(0) || '--'} icon={BarChart3} color="green" />
      </section>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                 <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Arc Oracle</h1>
           </div>
           <p className="text-white/20 uppercase text-[10px] tracking-[0.5em] font-black italic">Consensus Protocol Index v2.1</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
           <button onClick={() => setActiveTab('rankings')} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'rankings' ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white")}>
             Ranking Index
           </button>
           <button onClick={() => setActiveTab('airdrop')} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'airdrop' ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white")}>
             Ecosystem Card
           </button>
        </div>
      </header>

      {activeTab === 'rankings' ? (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="arc-glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white/[0.01]">
                 <div>
                    <h3 className="font-black uppercase tracking-[0.3em] text-sm flex items-center gap-3">
                       <ShieldCheck className="w-5 h-5 text-blue-500" />
                       Verified Protocol Metrics
                    </h3>
                    <p className="text-[10px] text-white/20 mt-1 font-bold uppercase italic">Real-time engagement audit</p>
                 </div>
                 
                 <form onSubmit={handleSearch} className="relative w-full md:max-w-md group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Audit Node Address (0x...)"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs font-mono focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-white/10 shadow-inner"
                    />
                 </form>
              </div>

              {globalError ? (
                <div className="py-32 text-center space-y-4 opacity-50 italic">
                   <AlertCircle className="w-12 h-12 mx-auto text-white/20" />
                   <p className="text-sm font-bold uppercase tracking-widest">No Global Data Available</p>
                </div>
              ) : isGlobalLoading && leaderboard.length === 0 ? (
                <div className="py-32 text-center space-y-4">
                   <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing Network State...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                         <tr className="bg-white/[0.03]">
                            <th className="px-10 py-6 text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">Pos</th>
                            <th className="px-10 py-6 text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">Node Identity</th>
                            <th className="px-10 py-6 text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">Percentile</th>
                            <th className="px-10 py-6 text-[9px] font-black uppercase text-white/20 tracking-[0.3em] text-right">Ecosystem Value</th>
                            <th className="px-10 py-6 text-[9px] font-black uppercase text-white/20 tracking-[0.3em] text-right">Engagement</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {leaderboard.slice(0, displayCount).map((entry) => {
                            const isCurrent = entry.address.toLowerCase() === (currentTarget || '').toLowerCase();
                            const isUser = entry.address.toLowerCase() === connectedAddress?.toLowerCase();
                            return (
                               <tr key={entry.address} className={cn("group transition-all", isCurrent ? "bg-blue-500/[0.08] border-l-4 border-blue-500" : "hover:bg-white/[0.02]")}>
                                  <td className="px-10 py-8">
                                     <div className={cn(
                                       "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border transition-all",
                                       entry.rank <= 3 ? "bg-white text-black border-white shadow-xl" : "bg-white/5 text-white/40 border-white/5"
                                     )}>
                                        {entry.rank}
                                     </div>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                                           <User className={cn("w-6 h-6", isUser ? "text-blue-500" : "text-white/20")} />
                                        </div>
                                        <div>
                                           <p className={cn("text-xs font-black font-mono leading-none", isUser && "text-blue-400")}>
                                              {isUser ? 'YOU (CONNECTED_NODE)' : truncateAddress(entry.address)}
                                           </p>
                                           <div className="flex items-center gap-2 mt-2">
                                              {entry.label && <span className="text-[8px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-black uppercase border border-blue-500/20">{entry.label}</span>}
                                              {isCurrent && <span className="text-[8px] px-2 py-0.5 rounded bg-blue-500 text-white font-black uppercase shadow-lg shadow-blue-500/40">ACTIVE_TARGET</span>}
                                           </div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/20 tracking-widest">
                                           <span>Top {Math.max(1, 100 - entry.percentile).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                           <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${entry.percentile}%` }} />
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                     <p className="text-sm font-black font-mono leading-none text-white italic">${entry.net_worth.toLocaleString()}</p>
                                     <p className="text-[9px] text-white/20 font-black uppercase mt-2 tracking-widest">{entry.active_days} Epochs active</p>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                     <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 group-hover:border-blue-500/30 transition-all shadow-inner">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <p className="text-sm font-black font-mono leading-none tracking-tight">{entry.score.toLocaleString()}</p>
                                     </div>
                                     <p className="text-[8px] text-white/10 font-black uppercase mt-2">{entry.tx_count} Protocol Operations</p>
                                  </td>
                               </tr>
                            )
                         })}
                      </tbody>
                   </table>
                </div>
              )}
              
              {!globalError && leaderboard.length > 0 && (
                <div className="p-12 text-center border-t border-white/5">
                   <button onClick={() => setDisplayCount(prev => prev + 10)} className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all flex flex-col items-center gap-3 mx-auto italic hover:scale-105 active:scale-95">
                      <ChevronDown className="w-6 h-6 animate-bounce" />
                      Expand Node Registry
                   </button>
                </div>
              )}
           </div>
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-12">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              <div className="lg:col-span-7" ref={shareCardRef}>
                 <div className="bg-[#050505] rounded-[3.5rem] p-12 text-white relative overflow-hidden border border-white/10 shadow-2xl h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10">
                       <div className="flex justify-between items-start mb-12">
                          <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                             <Layers className="w-8 h-8 text-black" />
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase text-white/30 tracking-widest leading-none mb-2">Network Global Rank</p>
                             <p className="text-6xl font-black font-mono tracking-tighter leading-none italic">
                                #{userEntry?.rank || '---'}
                             </p>
                          </div>
                       </div>
                       <h3 className="text-7xl font-black tracking-tighter mb-8 leading-[0.8] uppercase italic">
                          {userEntry?.label?.split(' ')[0] || 'Node'}<br/>
                          <span className="arc-gradient-text">{userEntry?.label?.split(' ')[1] || 'Explorer'}</span>.
                       </h3>
                       <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <p className="text-[10px] font-black font-mono text-blue-400 uppercase tracking-widest">{truncateAddress(currentTarget || '')}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-20 relative z-10 border-t border-white/5 pt-12">
                       <div>
                          <p className="text-[9px] font-black uppercase text-white/20 mb-1.5 tracking-widest">Protocol Score</p>
                          <p className="text-3xl font-black font-mono italic">{userEntry?.score.toLocaleString() || '0'}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-white/20 mb-1.5 tracking-widest">Global TVL</p>
                          <p className="text-3xl font-black font-mono italic">${userEntry?.net_worth.toLocaleString() || '0'}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-white/20 mb-1.5 tracking-widest">Total Ops</p>
                          <p className="text-3xl font-black font-mono italic">{userEntry?.tx_count || '0'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                 <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-6 relative overflow-hidden shadow-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                    <div className="flex justify-between items-start relative z-10">
                       <div>
                          <h4 className="text-[10px] font-black uppercase text-white/30 mb-2 tracking-[0.2em]">Network Dominance</h4>
                          <p className="text-4xl font-black font-mono leading-none italic">
                             {userEntry ? (100 - userEntry.percentile).toFixed(1) : '---'}%
                          </p>
                       </div>
                       <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-blue-500" />
                       </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10 shadow-inner">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${userEntry?.percentile || 0}%` }} className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
                    </div>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">
                       You are outperforming {userEntry?.percentile.toFixed(1)}% of all active nodes on Arc Testnet.
                    </p>
                 </div>

                 <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-6 relative overflow-hidden shadow-xl bg-white/[0.01]">
                    <div className="flex justify-between items-start relative z-10 text-white">
                       <div>
                          <h4 className="text-[10px] font-black uppercase text-white/30 mb-2 tracking-[0.2em]">Operational Epochs</h4>
                          <p className="text-4xl font-black font-mono leading-none italic">{userEntry?.active_days || '0'} Days</p>
                       </div>
                       <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-blue-500" />
                       </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10 shadow-inner">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((userEntry?.active_days || 0) / 30) * 100)}%` }} className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
                    </div>
                 </div>

                 <button 
                   onClick={handleDownloadShareCard} 
                   className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-4 group"
                 >
                    <Share2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    Generate Identity Asset
                 </button>
              </div>
           </div>
        </section>
      )}
    </main>
  );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="arc-glass rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all">
       <div className={cn(
         "absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
         color === 'blue' ? "bg-blue-600" : color === 'purple' ? "bg-purple-600" : color === 'orange' ? "bg-orange-600" : "bg-green-600"
       )} />
       <div className="flex justify-between items-center mb-6">
          <Icon className={cn("w-5 h-5", 
             color === 'blue' ? "text-blue-500" : color === 'purple' ? "text-purple-500" : color === 'orange' ? "text-orange-500" : "text-green-500"
          )} />
       </div>
       <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1.5">{label}</p>
       <h4 className="text-3xl font-black font-mono italic text-white tracking-tighter">{value}</h4>
    </div>
  );
}
