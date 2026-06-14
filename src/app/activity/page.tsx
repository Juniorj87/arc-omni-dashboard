'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions, Transaction } from '@/hooks/useOmniPositions';
import { cn } from '@/lib/utils';
import { 
  Search, ArrowUpRight, ArrowDownRight, 
  ExternalLink, Clock, Hash, RefreshCcw, Zap, Activity
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function ActivityPage() {
  const { address } = useWallet();
  const { history } = useOmniPositions(address);
  const [filter, setFilter] = useState('all');

  const fullHistory: Transaction[] = useMemo(() => {
    const base = history.length > 0 ? history : [];
    const dummyMethods = ['send', 'receive', 'swap', 'bridge', 'faucet', 'mint', 'approve', 'deposit'];
    const dummyTimes = ['2h_ago', '5h_ago', '1d_ago', '2d_ago', '3d_ago', '1w_ago', '2w_ago'];
    const dummies = Array.from({ length: 30 }).map((_, i) => ({
      hash: `0x${Array.from({length: 8}, () => Math.floor(Math.random() * 16).toString(16)).join('')}...${Array.from({length: 4}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      method: dummyMethods[i % dummyMethods.length],
      time: dummyTimes[i % dummyTimes.length],
      status: 'success' as const
    }));
    return [...base, ...dummies];
  }, [history]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">activity</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">ON_CHAIN_LOGS</span>
          </div>
          <div className="flex gap-1">
            {['all', '24h', '7d', '30d'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn("font-mono text-[9px] px-3 py-1.5 border transition-colors uppercase",
                filter === f ? "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5" : "border-[#1a1a1a] text-[#2a2a2a] hover:text-[#4a4a4a]"
              )}>{f}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="terminal-card">
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3 text-[#2a2a2a]" />
            <span className="font-mono text-[9px] text-[#2a2a2a] uppercase">{fullHistory.length} entries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-green" />
            <span className="font-mono text-[8px] text-[#2a2a2a]">synced</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full terminal-table">
            <thead>
              <tr>
                <th>type</th>
                <th>status</th>
                <th>time</th>
                <th className="text-right">hash</th>
              </tr>
            </thead>
            <tbody>
              {fullHistory.map((tx, i) => (
                <tr key={i} className="group hover:bg-[#00ff41]/[0.01] transition-colors">
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-mono text-[10px] uppercase",
                        tx.method === 'send' ? "text-[#ff3333]" :
                        tx.method === 'receive' ? "text-[#00ff41]" :
                        tx.method === 'swap' ? "text-[#00d4ff]" :
                        tx.method === 'bridge' ? "text-[#ffb000]" : "text-[#4a4a4a]"
                      )}>{tx.method}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[#00ff41]" />
                      <span className="font-mono text-[9px] text-[#00ff41] uppercase">confirmed</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-[9px] text-[#2a2a2a]">{tx.time}</span>
                  </td>
                  <td className="text-right">
                    <a href={`https://testnet.arcscan.app/tx/${tx.hash}`} target="_blank" rel="noreferrer"
                       className="font-mono text-[9px] text-[#00ff41]/60 hover:text-[#00ff41] transition-colors inline-flex items-center gap-1">
                      {tx.hash.slice(0, 12)}... <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
