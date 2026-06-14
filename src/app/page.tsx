'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { truncateAddress, cn } from '@/lib/utils';
import { 
  PieChart as PieChartIcon, Search, Zap, 
  ExternalLink, LogOut, Send, 
  Wallet, Shield, ChevronRight, Activity, RefreshCcw, Globe, Trophy
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SendModal } from '@/components/SendModal';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ffffff', '#a1a1aa'];

export default function Home() {
  const { address: connectedAddress, connect, disconnect, isConnecting } = useWallet();
  const [searchInput, setSearchAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const { balances, positions, extraData, history } = useOmniPositions(activeAddress);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  useEffect(() => {
    if (connectedAddress && !activeAddress) {
      setTimeout(() => {
        setActiveAddress(connectedAddress);
        setSearchAddress(connectedAddress);
      }, 0);
    }
  }, [connectedAddress, activeAddress]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.startsWith('0x') && searchInput.length === 42) {
      setActiveAddress(searchInput);
    }
  };

  const totalNetWorth = parseFloat(balances.USDC || '0') + 
                        parseFloat(balances.EURC || '0') + 
                        positions.reduce((acc, p) => acc + p.valueUsd, 0);

  const historyData = [
    { name: 'Mon', val: 400 }, { name: 'Tue', val: 450 }, 
    { name: 'Wed', val: 420 }, { name: 'Thu', val: 600 }, 
    { name: 'Fri', val: 580 }, { name: 'Sat', val: 800 },
    { name: 'Sun', val: 750 }
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pb-8 border-b border-white/5">
        <div className="relative w-full lg:max-w-xl group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
           <form onSubmit={handleSearch}>
             <input 
               type="text" 
               placeholder="Analyze any Arc identity (0x...)"
               value={searchInput}
               onChange={(e) => setSearchAddress(e.target.value)}
               className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-blue-500/30 transition-all font-mono text-white placeholder:text-white/10"
             />
           </form>
        </div>
        
        <div className="flex items-center gap-4">
          {connectedAddress ? (
            <div className="flex items-center gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/5">
               <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-blue-400">{truncateAddress(connectedAddress)}</span>
               </div>
               <button onClick={disconnect} className="p-2.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                  <LogOut className="w-4 h-4" />
               </button>
            </div>
          ) : (
            <button 
              onClick={connect} 
              disabled={isConnecting}
              className="px-8 py-3.5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              {isConnecting ? 'Linking...' : 'Connect Identity'}
            </button>
          )}
        </div>
      </div>

      {activeAddress ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
               <KpiCard label="Portfolio Value" value={`$${totalNetWorth.toLocaleString()}`} icon={Wallet} color="blue" trend="+8.4%" />
               <KpiCard label="Activity Score" value={extraData.score} icon={Trophy} color="purple" trend="Top 5%" />
               <KpiCard label="Gas Spent" value={`$${extraData.gasSpent}`} icon={Zap} color="orange" />
               <KpiCard label="Success Rate" value={extraData.successRate} icon={Shield} color="green" />
            </div>

            <section className="arc-glass rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Portfolio Trajectory</h3>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Institutional Growth Metrics</p>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl">
                     {['1D', '1W', '1M', 'ALL'].map(t => (
                       <button key={t} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", t === '1W' ? "bg-white text-black" : "text-white/20 hover:text-white/40")}>{t}</button>
                     ))}
                  </div>
               </div>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#0b0f17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="url(#colorGrowth)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
               <QuickActionCard title="Send Assets" desc="Transfer USDC/EURC" icon={Send} onClick={() => setIsSendModalOpen(true)} color="blue" />
               <QuickActionCard title="Swap Tokens" desc="Execute DEX Order" icon={RefreshCcw} href="/activity" color="purple" />
               <QuickActionCard title="Bridge Fund" desc="Cross-chain Link" icon={Globe} href="/activity" color="white" />
               <QuickActionCard title="Claim Faucet" desc="Request Testnet Gas" icon={Zap} href="/missions" color="orange" />
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5">
                  <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] mb-8">Performance Analytics</h4>
                  <div className="space-y-6">
                     <AnalyticsItem label="Total Volume" value={`$${extraData.volume}`} />
                     <AnalyticsItem label="Unique Contracts" value={extraData.uniqueContracts} />
                     <AnalyticsItem label="Wallet Age" value={extraData.walletAge} />
                     <AnalyticsItem label="Avg Tx Cost" value="$0.045" />
                  </div>
               </div>
               <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5">
                  <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] mb-8">Ecosystem Presence</h4>
                  <div className="space-y-4">
                     {['Achswap', 'Curve', 'ArcPerps'].map(p => (
                        <div key={p} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center font-bold text-xs">{p[0]}</div>
                              <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{p}</span>
                           </div>
                           <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-blue-500 transition-all" />
                        </div>
                     ))}
                  </div>
               </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="arc-glass rounded-[2.5rem] p-8 border border-white/5">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Asset Mix</h3>
                  <PieChartIcon className="w-4 h-4 text-white/20" />
               </div>
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: 'USDC', value: 60 }, { name: 'EURC', value: 30 }, { name: 'Others', value: 10 }]} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" animationDuration={1000}>
                        {CHART_COLORS.map((color, i) => <Cell key={i} fill={color} stroke="none" />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-6 space-y-3">
                  <AllocationItem label="USDC Stable" color={CHART_COLORS[0]} percent="60%" />
                  <AllocationItem label="EURC Stable" color={CHART_COLORS[1]} percent="30%" />
                  <AllocationItem label="Protocol LPs" color={CHART_COLORS[2]} percent="10%" />
               </div>
            </section>

            <section className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-8 h-[600px] flex flex-col">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Live Activity
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                  {history.map((tx, i) => (
                    <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-white/5">
                       <div className="absolute left-[-3px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-white tracking-tight">{tx.method}</p>
                          <span className="text-[10px] font-mono text-white/20">{tx.time}</span>
                       </div>
                       <p className="text-[10px] text-white/40 font-mono truncate mb-2">{tx.hash}</p>
                       <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-green-500/10 text-green-500 rounded">Confirmed</span>
                          <ExternalLink className="w-3 h-3 text-white/10" />
                       </div>
                    </div>
                  ))}
               </div>

               <Link href="/activity" className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all border border-white/5">
                  View Full History
               </Link>
            </section>

            <section className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Network Intel</h3>
               <div className="space-y-4">
                  <HealthItem label="Consensus Engine" />
                  <HealthItem label="RPC Gateway" />
                  <HealthItem label="Data Indexer" />
               </div>
            </section>
          </div>
        </div>
      ) : (
        <HeroSection connect={connect} isConnecting={isConnecting} />
      )}

      <SendModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} address={connectedAddress || ''} />
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, trend }: { label: string, value: string | number, icon: any, color: string, trend?: string }) {
  return (
    <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-4 relative overflow-hidden group">
      <div className={cn(
        "absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-30",
        color === 'blue' ? "bg-blue-600" : color === 'purple' ? "bg-purple-600" : color === 'orange' ? "bg-orange-600" : "bg-green-600"
      )} />
      <div className="flex justify-between items-center">
         <Icon className={cn("w-6 h-6", color === 'blue' ? "text-blue-500" : color === 'purple' ? "text-purple-500" : color === 'orange' ? "text-orange-500" : "text-green-500")} />
         {trend && <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <div>
         <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">{label}</p>
         <h3 className="text-2xl font-black italic tracking-tighter text-white">{value}</h3>
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, icon: Icon, onClick, href, color }: { title: string, desc: string, icon: any, onClick?: () => void, href?: string, color: string }) {
  const Content = (
    <div className="arc-glass rounded-[2rem] p-6 border border-white/5 flex flex-col items-center text-center space-y-4 group hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer h-full">
       <div className={cn(
         "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
         color === 'blue' ? "bg-blue-600/10 text-blue-500" : color === 'purple' ? "bg-purple-600/10 text-purple-500" : color === 'orange' ? "bg-orange-600/10 text-orange-500" : "bg-white/5 text-white"
       )}>
          <Icon className="w-6 h-6" />
       </div>
       <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-1">{title}</h4>
          <p className="text-[9px] text-white/20 font-bold uppercase">{desc}</p>
       </div>
    </div>
  );

  return href ? <Link href={href} className="block">{Content}</Link> : <div onClick={onClick}>{Content}</div>;
}

function AnalyticsItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center">
       <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{label}</span>
       <span className="text-xs font-bold text-white italic tracking-tighter">{value}</span>
    </div>
  );
}

function AllocationItem({ label, color, percent }: { label: string, color: string, percent: string }) {
  return (
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest group">
       <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-white/30 group-hover:text-white/60 transition-colors">{label}</span>
       </div>
       <span className="text-white/60">{percent}</span>
    </div>
  );
}

function HealthItem({ label }: { label: string }) {
  return (
    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Active</span>
       </div>
    </div>
  );
}

function HeroSection({ connect, isConnecting }: { connect: () => void, isConnecting: boolean }) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-12">
       <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter arc-gradient-text uppercase leading-[0.9]">
             The Sovereign <br /> Portfolio <br /> Terminal.
          </h1>
          <p className="text-lg text-white/40 font-medium max-w-xl mx-auto leading-relaxed">
             Hyper-detailed analytics for any address on the Arc Testnet. High-signal insights. Zero noise.
          </p>
       </div>
       
       <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-md">
          <button 
            onClick={connect} disabled={isConnecting}
            className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
             {isConnecting ? 'Linking Portal...' : 'Initialize Terminal'}
          </button>
       </div>

       <div className="flex items-center gap-8 opacity-20">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Shield className="w-4 h-4" /> Secure</div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Globe className="w-4 h-4" /> Global</div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Zap className="w-4 h-4" /> Real-time</div>
       </div>
    </div>
  );
}
