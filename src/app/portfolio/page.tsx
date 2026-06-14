'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { WalletModal } from '@/components/WalletModal';
import { cn } from '@/lib/utils';
import { 
  PieChart as PieChartIcon, ArrowUpRight, 
  TrendingUp, DollarSign, Briefcase, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ffffff', '#a1a1aa'];

export default function PortfolioPage() {
  const { address: connectedAddress, connect, connectWallet, isConnecting, error: walletError, showModal, setShowModal } = useWallet();
  const [searchInput, setSearchInput] = useState('');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connectedAddress && !activeAddress) {
      setActiveAddress(connectedAddress);
      setSearchInput(connectedAddress);
    }
  }, [connectedAddress, activeAddress]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (clean.startsWith('0x') && clean.length === 42 && ethers.isAddress(clean)) {
      setActiveAddress(clean);
    }
  };

  const { balances, positions } = useOmniPositions(activeAddress);

  const totalValue = parseFloat(balances.USDC || '0') + 
                     parseFloat(balances.EURC || '0') + 
                     (parseFloat(balances.ARC || '0') * 0.5) + 
                     positions.reduce((acc, p) => acc + p.valueUsd, 0);

  const chartData = [
    { name: 'USDC', value: parseFloat(balances.USDC || '0') },
    { name: 'EURC', value: parseFloat(balances.EURC || '0') },
    { name: 'ARC', value: parseFloat(balances.ARC || '0') * 0.5 },
    ...positions.map(p => ({ name: p.protocol, value: p.valueUsd }))
  ].filter(d => d.value > 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Portfolio</h1>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Unified Asset Overview</p>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Look up address (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 pr-12 text-xs font-mono focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-white/20 w-72"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
          <div className="arc-glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Network</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-xs font-bold text-white uppercase tracking-tighter">Arc Testnet</span>
            </div>
          </div>
        </div>
      </header>

      {!activeAddress && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-sm font-bold text-white/40">Enter an address or connect a wallet to view portfolio</p>
          <button onClick={connect} disabled={isConnecting} className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all">
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      )}

      {activeAddress && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          label="Total Net Worth" 
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="+5.2%"
          color="blue"
        />
        <KpiCard 
          label="Yield Generation" 
          value={`$${(totalValue * 0.08 / 365).toFixed(2)}`}
          symbol="/ Day"
          icon={TrendingUp}
          trend="+12%"
          color="purple"
        />
        <KpiCard 
          label="Asset Distribution" 
          value={chartData.length}
          symbol="Tokens"
          icon={Briefcase}
          color="white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="arc-glass rounded-[2.5rem] border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Digital Assets</h3>
              <div className="text-[10px] font-bold text-white/20 uppercase">Last Sync: 1m ago</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/5">
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-white/20 tracking-widest">Asset</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-white/20 tracking-widest">Balance</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-white/20 tracking-widest text-right">Value (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AssetRow symbol="USDC" balance={balances.USDC || '0.00'} value={parseFloat(balances.USDC || '0')} />
                  <AssetRow symbol="EURC" balance={balances.EURC || '0.00'} value={parseFloat(balances.EURC || '0')} />
                  <AssetRow symbol="ARC" balance={balances.ARC || '0.00'} value={parseFloat(balances.ARC || '0') * 0.5} />
                  {positions.map((pos, i) => (
                    <AssetRow key={i} symbol={pos.name} balance={pos.balance} value={pos.valueUsd} protocol={pos.protocol} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="arc-glass rounded-[2.5rem] p-8 border border-white/5">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-500" />
              Allocation
            </h3>
            <div className="h-56 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={8} 
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {(chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0f17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {chartData.map((d, i) => (
                 <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{d.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/60">
                      {((d.value / totalValue) * 100).toFixed(1)}%
                    </div>
                 </div>
              ))}
            </div>
          </section>

          <section className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform" />
             <TrendingUp className="w-10 h-10 mb-4 text-white/50" />
             <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">Optimize Yield</h4>
             <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">Explore automated strategies to maximize your Arc assets.</p>
             <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em]">
               Initialize Explorer <ChevronRight className="w-3 h-3" />
             </div>
           </section>
        </div>
      </div>
      </>
      )}
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={connectWallet} isConnecting={isConnecting} error={walletError} />
    </div>
  );
}

function KpiCard({ label, value, symbol, icon: Icon, trend, color }: { label: string, value: string | number, symbol?: string, icon: any, trend?: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="arc-glass rounded-[2.5rem] p-8 border border-white/5 space-y-4 relative overflow-hidden"
    >
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full",
        color === 'blue' ? "bg-blue-600/10" : color === 'purple' ? "bg-purple-600/10" : "bg-white/5"
      )} />
      
      <div className="flex justify-between items-center relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          color === 'blue' ? "bg-blue-500/10 text-blue-500" : color === 'purple' ? "bg-purple-500/10 text-purple-500" : "bg-white/5 text-white/40"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/5 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <div className="space-y-1 relative z-10">
        <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black tracking-tight text-white italic">{value}</h3>
          {symbol && <span className="text-[10px] font-bold text-white/20 uppercase">{symbol}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function AssetRow({ symbol, balance, value, protocol }: { symbol: string, balance: string, value: number, protocol?: string }) {
  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-white/60 border border-white/5">
            {symbol[0]}
          </div>
          <div>
            <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{symbol}</p>
            {protocol && <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{protocol}</p>}
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-xs font-mono text-white/60">{parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
      </td>
      <td className="px-8 py-6 text-right">
        <p className="text-sm font-bold text-white">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </td>
    </tr>
  );
}
