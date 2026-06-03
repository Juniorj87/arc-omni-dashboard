'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { truncateAddress, cn } from '@/lib/utils';
import { 
  Wallet, Activity, PieChart, Layers, ExternalLink, TrendingUp, 
  ArrowUpRight, ShieldCheck, Globe, Info, Search, History, Zap, 
  ExternalLink as LinkIcon, Star, LogOut, Trash2, Clock, Send
} from 'lucide-react';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SendModal } from '@/components/SendModal';

const CHART_COLORS = ['#3b82f6', '#ffffff', '#a1a1aa', '#3f3f46'];

export default function Home() {
  const { address: connectedAddress, connect, disconnect, isConnecting } = useWallet();
  const [searchInput, setSearchAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const { balances, positions, isLoading, extraData, history } = useOmniPositions(activeAddress);
  const [showDemo, setShowDemo] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('arc-favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (addr: string) => {
    const newFavs = favorites.includes(addr) 
      ? favorites.filter(f => f !== addr) 
      : [...favorites, addr];
    setFavorites(newFavs);
    localStorage.setItem('arc-favorites', JSON.stringify(newFavs));
  };

  useEffect(() => {
    if (connectedAddress && !activeAddress) {
      setActiveAddress(connectedAddress);
      setSearchAddress(connectedAddress);
    }
  }, [connectedAddress, activeAddress]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.startsWith('0x') && searchInput.length === 42) {
      setActiveAddress(searchInput);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setActiveAddress(null);
    setSearchAddress('');
  };

  const activeBalances = showDemo ? { USDC: '1240.50', EURC: '850.20', ARC: '12.45' } : balances;
  const activePositions = showDemo ? [
    { protocol: 'Achswap', name: 'USDC/EURC LP', balance: '150.00', type: 'LP', valueUsd: 300, link: 'https://achswap.org' },
    { protocol: 'Curve', name: 'WUSDC/arcBTC LP', balance: '0.50', type: 'LP', valueUsd: 500, link: 'https://curve.finance' },
    { protocol: 'ArcPerps', name: 'Margin Deposit', balance: '250.00', type: 'Deposit', valueUsd: 250, link: 'https://arcperps.xyz' },
  ] : positions;

  const chartData = activePositions.map(p => ({ name: p.protocol, value: p.valueUsd }));
  if (parseFloat(activeBalances.USDC || '0') > 0) chartData.push({ name: 'USDC', value: parseFloat(activeBalances.USDC) });
  
  const historyData = [{ name: '01', val: 400 }, { name: '02', val: 450 }, { name: '03', val: 420 }, { name: '04', val: 600 }, { name: '05', val: 580 }, { name: '06', val: 800 }];

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 pt-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center py-6 gap-6 border-b border-white/5">
        <div className="flex items-center gap-3 self-start cursor-pointer invisible md:visible" onClick={() => setActiveAddress(null)}>
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl">
             <Layers className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold arc-gradient-text tracking-tighter leading-none">ARC OMNI</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Institutional Explorer</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:max-w-md ml-0 md:ml-12">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
           <input 
             type="text" 
             placeholder="Explore Arc Address..."
             value={searchInput}
             onChange={(e) => setSearchAddress(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all font-mono"
           />
        </form>
        
        <div className="flex items-center gap-3">
          {connectedAddress ? (
            <div className="group relative flex items-center gap-3 pl-4 pr-2 py-2 arc-glass rounded-full border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
              <span className="text-sm font-mono">{truncateAddress(connectedAddress)}</span>
              <button 
                onClick={handleDisconnect}
                className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={connect} disabled={isConnecting} className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-xs">
              {isConnecting ? 'Linking...' : 'Connect'}
            </button>
          )}
        </div>
      </header>

      {!activeAddress ? (
        <HeroSection connect={connect} isConnecting={isConnecting} favorites={favorites} onSelect={setActiveAddress} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* LEFT: Financials & History */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <h2 className="text-sm font-mono text-white/60">{activeAddress}</h2>
                  <button onClick={() => toggleFavorite(activeAddress)} className="text-white/20 hover:text-yellow-500 transition-colors">
                     <Star className={cn("w-4 h-4", favorites.includes(activeAddress) && "fill-yellow-500 text-yellow-500")} />
                  </button>
               </div>
               <button onClick={() => setShowDemo(!showDemo)} className={cn("text-[9px] font-black uppercase px-3 py-1 rounded-md border transition-all", showDemo ? "bg-white text-black border-white" : "text-white/40 border-white/10")}>
                 {showDemo ? 'Live View' : 'Try Demo'}
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <BalanceCard label="Net Worth" value={`$${chartData.reduce((a, b) => a + b.value, 0).toLocaleString()}`} trend="+12.5%" isLoading={isLoading} />
              <BalanceCard label="Engagement Score" value={`${extraData.score?.toLocaleString()}`} symbol="PTS" isLoading={isLoading} trend="Rank A" />
              <BalanceCard label="Gas Burned" value={`${extraData.gasSpent}`} symbol="USDC" isLoading={isLoading} />
              <BalanceCard label="TX Count" value={`${extraData.txCount}`} symbol="Ops" isLoading={isLoading} />
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="arc-glass rounded-2xl p-6 border border-white/5 flex flex-col items-center text-center">
                  <span className="text-[10px] font-black uppercase text-white/20 mb-2 tracking-widest">Active Days</span>
                  <span className="text-3xl font-black text-blue-500">{extraData.activeDays}</span>
                  <span className="text-[9px] font-bold text-white/40 mt-1 uppercase">Interactions</span>
               </div>
               <div className="arc-glass rounded-2xl p-6 border border-white/5 flex flex-col items-center text-center">
                  <span className="text-[10px] font-black uppercase text-white/20 mb-2 tracking-widest">Active Weeks</span>
                  <span className="text-3xl font-black text-white">{extraData.activeWeeks}</span>
                  <span className="text-[9px] font-bold text-white/40 mt-1 uppercase">Consistency</span>
               </div>
               <div className="arc-glass rounded-2xl p-6 border border-white/5 flex flex-col items-center text-center">
                  <span className="text-[10px] font-black uppercase text-white/20 mb-2 tracking-widest">Active Months</span>
                  <span className="text-3xl font-black text-white">{extraData.activeMonths}</span>
                  <span className="text-[9px] font-bold text-white/40 mt-1 uppercase">Longevity</span>
               </div>
            </section>

            <section className="arc-glass rounded-3xl p-8 border border-white/5 overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <History className="w-5 h-5 text-white/40" />
                    Growth Analytics
                  </h3>
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Live Data Stream</div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="url(#colorVal)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-white/40" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Ecosystem Presence</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {['Achswap', 'Curve', 'ArcPerps', 'PrestoDEX'].map((proto) => {
                   const pos = activePositions.find(p => p.protocol === proto);
                   return (
                     <div key={proto} className="arc-glass rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center font-bold text-xs">{proto[0]}</div>
                           {pos?.link && (
                             <a href={pos.link} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors">
                               <LinkIcon className="w-4 h-4" />
                             </a>
                           )}
                        </div>
                        <h4 className="font-bold mb-1 flex items-center gap-2">
                          {proto}
                          {pos && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                        </h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                          {pos ? `${pos.name}: ${parseFloat(pos.balance).toFixed(4)}` : 'No detected activity'}
                        </p>
                     </div>
                   );
                 })}
              </div>
            </section>
          </div>

          {/* RIGHT: Stats & History */}
          <div className="lg:col-span-4 space-y-6">
            <section className="arc-glass rounded-3xl p-8 border border-white/5">
              <h3 className="font-medium mb-8 text-sm uppercase tracking-widest text-white/60 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Asset Mix
              </h3>
              <div className="h-40 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RePie>
                    <Pie data={chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]} innerRadius={50} outerRadius={65} paddingAngle={5} dataKey="value">
                      {(chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                  </RePie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {chartData.map((d, i) => (
                   <div key={i} className="flex justify-between items-center text-[10px] uppercase">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                         <span className="text-white/40">{d.name}</span>
                      </div>
                      <span className="font-bold">${d.value.toLocaleString()}</span>
                   </div>
                ))}
              </div>
            </section>

            {/* Transaction Timeline */}
            <section className="arc-glass rounded-3xl p-8 border border-white/5 space-y-6">
               <h3 className="font-medium text-sm uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/40" />
                Activity Timeline
              </h3>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                 {history.map((tx, i) => (
                   <div key={i} className="relative pl-8 group">
                      <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
                      <p className="text-xs font-bold text-white/80">{tx.method}</p>
                      <div className="flex justify-between items-center mt-1">
                         <span className="text-[9px] text-white/20 uppercase font-black">{tx.time}</span>
                         <span className="text-[9px] text-blue-500 font-bold uppercase px-1.5 py-0.5 bg-blue-500/5 rounded">Success</span>
                      </div>
                   </div>
                 ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 text-black group cursor-pointer overflow-hidden relative" onClick={() => setIsSendModalOpen(true)}>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/5 rounded-full blur-2xl group-hover:bg-black/10 transition-all" />
               <Send className="float-right w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-4">
                  <Send className="w-5 h-5 text-white" />
               </div>
               <h3 className="text-lg font-bold mb-1 tracking-tight">Send Assets</h3>
               <p className="text-xs font-medium opacity-50">Transfer USDC/EURC on Arc.</p>
            </section>

            <section className="arc-glass rounded-3xl p-8 border border-white/5 space-y-6">
               <h3 className="font-medium text-sm uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Network Intel
              </h3>

              <div className="space-y-4">
                <StatusItem label="Arc RPC" status="online" />
                <StatusItem label="Portfolio Index" status="online" />
                <StatusItem label="Whale Tracker" status="online" />
              </div>
            </section>
          </div>
        </div>
      )}

      <SendModal 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)} 
        address={connectedAddress || ''} 
      />

      {/* Footer */}
      <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">

        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
           <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Arc Omni Explorer</span>
        </div>
        <div className="flex items-center gap-10">
          <a href="https://github.com/Juniorj87/arc-omni-dashboard" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-all flex items-center gap-2">
            <Globe className="w-3 h-3" /> GitHub
          </a>
          <Link href="/docs" className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-all">Documentation</Link>
        </div>
      </footer>
    </main>
  );
}

function HeroSection({ connect, isConnecting, favorites, onSelect }: any) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-10 backdrop-blur-xl animate-pulse">
        <Search className="w-10 h-10 text-white/80" />
      </div>
      <h1 className="text-5xl md:text-7xl font-bold arc-gradient-text tracking-tighter mb-6 max-w-4xl leading-[1.1]">
        The Sovereign Portfolio Terminal.
      </h1>
      <p className="text-white/40 max-w-lg mb-12 text-lg font-medium leading-relaxed">
        Analyze any address on Arc Testnet. No permissions. Full transparency.
      </p>
      
      {favorites.length > 0 && (
        <div className="mb-10 w-full max-w-md">
           <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-4">Saved Watchlist</p>
           <div className="flex flex-wrap justify-center gap-2">
              {favorites.map((addr: string) => (
                <button key={addr} onClick={() => onSelect(addr)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-white/60 hover:bg-white/10 transition-all">
                  {truncateAddress(addr)}
                </button>
              ))}
           </div>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={connect}
          disabled={isConnecting}
          className="px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          {isConnecting ? 'Linking...' : 'Connect Identity'}
        </button>
      </div>
    </div>
  )
}

function BalanceCard({ label, value, symbol, isLoading, trend }: any) {
  return (
    <div className="arc-glass rounded-2xl p-6 border border-white/5 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">{label}</p>
        {trend && <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{trend}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight">{isLoading ? '...' : value}</h3>
        {symbol && <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{symbol}</span>}
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string, status: 'online' | 'offline' }) {
  return (
    <div className="flex justify-between items-center text-[10px]">
      <span className="text-white/40 font-bold uppercase tracking-tighter">{label}</span>
      <div className="flex items-center gap-2">
        <div className={cn("w-1 h-1 rounded-full", status === 'online' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-red-500')} />
        <span className="text-white/20 font-black uppercase">{status}</span>
      </div>
    </div>
  );
}
