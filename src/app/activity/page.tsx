'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions, Transaction } from '@/hooks/useOmniPositions';
import { cn } from '@/lib/utils';
import { 
  Search, ArrowUpRight, ArrowDownRight, 
  ExternalLink, Clock, Calendar, Hash, RefreshCcw, Zap
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function ActivityPage() {
  const { address } = useWallet();
  const { history } = useOmniPositions(address);
  const [filter, setFilter] = useState('All');

  const fullHistory: Transaction[] = useMemo(() => {
    const base = history.length > 0 ? history : [];
    
    // Generate 20+ dummy items to fill 3-5 screens as requested
    const dummyMethods = ['Send', 'Receive', 'Swap', 'Bridge', 'Faucet', 'Mint', 'Approve', 'Deposit'];
    const dummyTimes = ['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago', '3 days ago', '1 week ago', '2 weeks ago'];
    
    const dummies = Array.from({ length: 30 }).map((_, i) => ({
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      method: dummyMethods[i % dummyMethods.length],
      time: dummyTimes[i % dummyTimes.length],
      status: 'success' as const
    }));

    return [...base, ...dummies];
  }, [history]);

  const filters = ['All', 'Last 24h', '7d', '30d'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Activity</h1>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">On-chain interaction logs</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {filters.map(f => (
                <button 
                  key={f} onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-white text-black shadow-lg" : "text-white/20 hover:text-white/40"
                  )}
                >
                  {f}
                </button>
              ))}
           </div>
           <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
              <RefreshCcw className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="arc-glass rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" placeholder="Search by Hash / Type..."
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-blue-500/30 text-white placeholder:text-white/10"
              />
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">
              <Clock className="w-4 h-4" />
              Historical database synced
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Magnitude</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Date / Time</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest text-right">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {fullHistory.map((tx, i) => (
                <TxRow key={i} tx={tx} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const getTypeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'send': return 'text-red-400 bg-red-400/5';
      case 'receive': return 'text-green-400 bg-green-400/5';
      case 'swap': return 'text-blue-400 bg-blue-400/5';
      case 'bridge': return 'text-purple-400 bg-purple-400/5';
      case 'faucet': return 'text-yellow-400 bg-yellow-400/5';
      default: return 'text-white/40 bg-white/5';
    }
  };

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", getTypeColor(tx.method))}>
            {tx.method.toLowerCase() === 'send' && <ArrowUpRight className="w-4 h-4" />}
            {tx.method.toLowerCase() === 'receive' && <ArrowDownRight className="w-4 h-4" />}
            {tx.method.toLowerCase() === 'swap' && <RefreshCcw className="w-4 h-4" />}
            {tx.method.toLowerCase() === 'bridge' && <Hash className="w-4 h-4" />}
            {tx.method.toLowerCase() === 'faucet' && <Zap className="w-4 h-4" />}
          </div>
          <span className="font-bold text-xs text-white uppercase tracking-widest">{tx.method}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-xs font-black text-white italic">--</p>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
           <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Confirmed</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2 text-white/40">
           <Calendar className="w-3.5 h-3.5" />
           <span className="text-[10px] font-bold uppercase tracking-widest">{tx.time}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <a 
          href={`https://testnet.arcscan.app/tx/${tx.hash}`} 
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10"
        >
          {tx.hash.slice(0, 10)}... <ExternalLink className="w-3 h-3" />
        </a>
      </td>
    </tr>
  );
}
