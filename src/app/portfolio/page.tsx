'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { WalletModal } from '@/components/WalletModal';
import { cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { 
  Briefcase, Search, TrendingUp, DollarSign, ArrowUpRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
    const input = searchInput.trim();
    if (input.length > 0 && ethers.isAddress(input)) {
      setActiveAddress(input);
    }
  };

  const { balances, positions, isLoading } = useOmniPositions(activeAddress);

  const totalValue = parseFloat(balances.USDC || '0') + 
                     parseFloat(balances.EURC || '0') + 
                     (parseFloat(balances.ARC || '0') * 0.5) + 
                     positions.reduce((acc, p) => acc + p.valueUsd, 0);

  const assets = [
    { symbol: 'USDC', balance: balances.USDC || '0', value: parseFloat(balances.USDC || '0') },
    { symbol: 'EURC', balance: balances.EURC || '0', value: parseFloat(balances.EURC || '0') },
    { symbol: 'ARC', balance: balances.ARC || '0', value: parseFloat(balances.ARC || '0') * 0.5 },
    ...positions.map(p => ({ symbol: p.name, balance: p.balance, value: p.valueUsd, protocol: p.protocol }))
  ].filter(a => parseFloat(a.balance) > 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">portfolio</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">UNIFIED_ASSET_OVERVIEW</span>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#2a2a2a]" />
              <input
                type="text"
                placeholder="0x... lookup"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                maxLength={42}
                className="terminal-input pl-9 pr-4 py-2 w-72"
              />
            </form>
            <div className="flex items-center gap-2 px-3 py-2 border border-[#1a1a1a]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-green" />
              <span className="font-mono text-[9px] text-[#4a4a4a] uppercase">arc_testnet</span>
            </div>
          </div>
        </div>
      </header>

      {!activeAddress ? (
        <div className="terminal-card p-12 text-center">
          <Briefcase className="w-8 h-8 text-[#2a2a2a] mx-auto mb-4" />
          <p className="font-mono text-[11px] text-[#4a4a4a] mb-4">no_address_loaded</p>
          <button onClick={connect} disabled={isConnecting} className="btn-terminal">
            {isConnecting ? 'connecting...' : 'connect_wallet'}
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">net_worth</p>
              <p className="font-mono text-lg font-bold text-[#00ff41] glow-green">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">yield_day</p>
              <p className="font-mono text-lg font-bold text-[#ffb000] glow-amber">${(totalValue * 0.08 / 365).toFixed(2)}</p>
            </div>
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">assets</p>
              <p className="font-mono text-lg font-bold text-[#e0e0e0]">{assets.length}</p>
            </div>
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">positions</p>
              <p className="font-mono text-lg font-bold text-[#e0e0e0]">{positions.length}</p>
            </div>
          </div>

          {/* Assets Table */}
          <div className="terminal-card">
            <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
              <span className="font-mono text-[10px] text-[#4a4a4a] uppercase tracking-widest">asset_registry</span>
              <span className="font-mono text-[8px] text-[#2a2a2a]">sync: {isLoading ? 'pending' : 'ok'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full terminal-table">
                <thead>
                  <tr>
                    <th>symbol</th>
                    <th>balance</th>
                    <th>protocol</th>
                    <th className="text-right">value_usd</th>
                    <th className="text-right">allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a, i) => (
                    <tr key={i} className="group hover:bg-[#00ff41]/[0.02] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border border-[#1a1a1a] flex items-center justify-center font-mono text-[9px] text-[#4a4a4a] group-hover:border-[#00ff41]/30 transition-colors">
                            {a.symbol[0]}
                          </div>
                          <span className="font-mono text-[11px] text-[#e0e0e0] group-hover:text-[#00ff41] transition-colors">{a.symbol}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-[11px] text-[#4a4a4a]">{parseFloat(a.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                      </td>
                      <td>
                        <span className="font-mono text-[9px] text-[#2a2a2a]">{(a as any).protocol || '—'}</span>
                      </td>
                      <td className="text-right">
                        <span className="font-mono text-[11px] text-[#e0e0e0]">${a.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1 bg-[#1a1a1a] overflow-hidden">
                            <div className="h-full bg-[#00ff41]" style={{ width: `${totalValue > 0 ? (a.value / totalValue) * 100 : 0}%` }} />
                          </div>
                          <span className="font-mono text-[9px] text-[#4a4a4a] w-12 text-right">{totalValue > 0 ? ((a.value / totalValue) * 100).toFixed(1) : '0'}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <span className="font-mono text-[10px] text-[#2a2a2a]">no_assets_found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ASCII Allocation */}
          {assets.length > 0 && (
            <div className="terminal-card p-4">
              <span className="font-mono text-[10px] text-[#4a4a4a] uppercase tracking-widest block mb-4">allocation_map</span>
              <pre className="font-mono text-[10px] text-[#00ff41] leading-relaxed">
                {generateAsciiBarChart(assets.map(a => ({ label: a.symbol, value: a.value })))}
              </pre>
            </div>
          )}
        </>
      )}

      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={connectWallet} isConnecting={isConnecting} error={walletError} />
    </div>
  );
}

function generateAsciiBarChart(data: { label: string; value: number }[]): string {
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = 30;
  
  return data.map(d => {
    const barLen = Math.round((d.value / max) * barWidth);
    const bar = '█'.repeat(barLen) + '░'.repeat(barWidth - barLen);
    const pct = ((d.value / data.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1);
    return `${d.label.padEnd(6)} │ ${bar} │ $${d.value.toLocaleString(undefined, { maximumFractionDigits: 2 }).padStart(10)} │ ${pct}%`;
  }).join('\n');
}
