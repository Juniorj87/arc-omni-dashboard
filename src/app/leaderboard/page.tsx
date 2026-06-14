'use client';

import { useWallet } from '@/hooks/useWallet';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { truncateAddress, cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { Trophy, Search, User, Share2, Layers, Activity, Globe, Users, BarChart3, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { WalletModal } from '@/components/WalletModal';
import { getRankLabel } from '@/lib/scoring';

export default function LeaderboardPage() {
  const { address: connectedAddress, connectWallet, isConnecting, error: walletError, showModal, setShowModal } = useWallet();
  const [searchAddress, setSearchAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  
  const currentTarget = activeAddress || connectedAddress;
  const { stats, leaderboard, userEntry, isLoading, registerWallet } = useLeaderboard(currentTarget);
  const { extraData, positions, balances, isLoading: positionsLoading } = useOmniPositions(connectedAddress);
  
  const [activeTab, setActiveTab] = useState<'rankings' | 'card'>('rankings');
  const [displayCount, setDisplayCount] = useState(10);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Register wallet on connect
  useEffect(() => {
    if (connectedAddress) {
      registerWallet({ address: connectedAddress });
    }
  }, [connectedAddress]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const input = searchInputRef.current?.value || searchAddress;
    const clean = input.trim();
    if (clean.length > 0 && ethers.isAddress(clean)) {
      setActiveAddress(clean);
      setSearchAddress(clean);
    } else if (clean.length > 0) {
      alert("invalid_ethereum_address");
    }
  }, [searchAddress]);

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toPng(shareCardRef.current, { cacheBust: true });
    const link = document.createElement('a');
    link.download = 'arc-identity-card.png';
    link.href = dataUrl;
    link.click();
  };

  // Compute identity data from client-side hooks as primary source
  const clientNetWorth = (parseFloat(balances?.USDC || '0') + parseFloat(balances?.EURC || '0') + parseFloat(balances?.ARC || '0')) + 
    positions.reduce((acc, p) => acc + p.valueUsd, 0);
  const clientScore = extraData.score || 0;
  const clientTxCount = extraData.txCount || 0;
  const clientActiveDays = extraData.activeDays || 0;

  // Use server data if available, otherwise client data
  const displayEntry = userEntry || (connectedAddress ? {
    address: connectedAddress,
    score: clientScore,
    net_worth: clientNetWorth,
    tx_count: clientTxCount,
    active_days: clientActiveDays,
    rank: 0,
    percentile: 0,
    label: getRankLabel(clientScore),
  } : null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBlock label="GLOBAL_NODES" value={stats?.totalWallets || leaderboard.length || '—'} icon={Users} />
        <StatBlock label="CONSENSUS" value={stats?.totalTxCount?.toLocaleString() || '—'} icon={Activity} />
        <StatBlock label="NETWORK_TVL" value={stats ? `$${stats.totalValueUsd.toLocaleString()}` : '—'} icon={Globe} />
        <StatBlock label="AVG_SCORE" value={stats?.avgScore?.toFixed(0) || '—'} icon={BarChart3} />
      </div>

      {/* Header */}
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">leaderboard</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">CONSENSUS_INDEX v2.1</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('rankings')} className={cn("font-mono text-[10px] uppercase px-4 py-2 border transition-colors",
              activeTab === 'rankings' ? "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5" : "border-[#1a1a1a] text-[#2a2a2a] hover:text-[#4a4a4a]"
            )}>rankings</button>
            <button onClick={() => setActiveTab('card')} className={cn("font-mono text-[10px] uppercase px-4 py-2 border transition-colors",
              activeTab === 'card' ? "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5" : "border-[#1a1a1a] text-[#2a2a2a] hover:text-[#4a4a4a]"
            )}>identity_card</button>
          </div>
        </div>
      </header>

      {activeTab === 'rankings' ? (
        <div className="terminal-card">
          {/* Search */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#2a2a2a]" />
                <input ref={searchInputRef} type="text" placeholder="0x... audit_node" value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} maxLength={42}
                  className="terminal-input pl-9 pr-4 py-2.5 w-full" />
              </div>
              <button type="submit" className="btn-terminal px-4">scan</button>
            </form>
          </div>

          {isLoading && leaderboard.length === 0 ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#00ff41] mx-auto mb-3" />
              <p className="font-mono text-[9px] text-[#2a2a2a] uppercase">syncing_network_state...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full terminal-table">
                <thead>
                  <tr>
                    <th>pos</th>
                    <th>node_identity</th>
                    <th>percentile</th>
                    <th className="text-right">ecosystem_value</th>
                    <th className="text-right">engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, displayCount).map((entry) => {
                    const isCurrent = entry.address.toLowerCase() === (currentTarget || '').toLowerCase();
                    const isUser = entry.address.toLowerCase() === connectedAddress?.toLowerCase();
                    return (
                      <tr key={entry.address} className={cn("transition-colors", isCurrent ? "bg-[#00ff41]/[0.03] border-l-2 border-[#00ff41]" : "hover:bg-[#00ff41]/[0.01]")}>
                        <td>
                          <span className={cn("font-mono text-[11px]", entry.rank <= 3 ? "text-[#ffb000] font-bold" : "text-[#4a4a4a]")}>
                            {String(entry.rank).padStart(3, '0')}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border border-[#1a1a1a] flex items-center justify-center">
                              <User className={cn("w-3 h-3", isUser ? "text-[#00ff41]" : "text-[#2a2a2a]")} />
                            </div>
                            <div>
                              <p className={cn("font-mono text-[11px]", isUser ? "text-[#00ff41]" : "text-[#e0e0e0]")}>
                                {isUser ? 'YOU' : truncateAddress(entry.address)}
                              </p>
                              <div className="flex gap-1.5 mt-1">
                                {entry.label && <span className="tag tag-green text-[7px]">{entry.label}</span>}
                                {isCurrent && <span className="tag tag-amber text-[7px]">ACTIVE</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <span className="font-mono text-[9px] text-[#2a2a2a]">TOP {(100 - entry.percentile).toFixed(1)}%</span>
                            <div className="w-16 h-0.5 bg-[#1a1a1a] overflow-hidden">
                              <div className="h-full bg-[#00ff41]" style={{ width: `${entry.percentile}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <p className="font-mono text-[11px] text-[#e0e0e0]">${entry.net_worth.toLocaleString()}</p>
                          <p className="font-mono text-[8px] text-[#2a2a2a] mt-0.5">{entry.active_days} epochs</p>
                        </td>
                        <td className="text-right">
                          <span className="font-mono text-[11px] text-[#00ff41]">{entry.score.toLocaleString()}</span>
                          <p className="font-mono text-[8px] text-[#2a2a2a] mt-0.5">{entry.tx_count} ops</p>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Show connected wallet row if not already in leaderboard */}
                  {connectedAddress && !leaderboard.find(e => e.address.toLowerCase() === connectedAddress.toLowerCase()) && (
                    <tr className="bg-[#00ff41]/[0.02] border-l-2 border-[#00ff41]">
                      <td><span className="font-mono text-[11px] text-[#4a4a4a]">---</span></td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border border-[#00ff41]/30 flex items-center justify-center">
                            <User className="w-3 h-3 text-[#00ff41]" />
                          </div>
                          <div>
                            <p className="font-mono text-[11px] text-[#00ff41]">YOU ({truncateAddress(connectedAddress)})</p>
                            <div className="flex gap-1.5 mt-1">
                              <span className="tag tag-amber text-[7px]">CONNECTED</span>
                              {displayEntry?.label && <span className="tag tag-green text-[7px]">{displayEntry.label}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono text-[9px] text-[#2a2a2a]">—</span></td>
                      <td className="text-right">
                        <p className="font-mono text-[11px] text-[#e0e0e0]">${clientNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </td>
                      <td className="text-right">
                        <span className="font-mono text-[11px] text-[#00ff41]">{clientScore.toLocaleString()}</span>
                        <p className="font-mono text-[8px] text-[#2a2a2a] mt-0.5">{clientTxCount} ops</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {leaderboard.length > displayCount && (
            <div className="p-4 border-t border-[#1a1a1a] text-center">
              <button onClick={() => setDisplayCount(prev => prev + 10)} className="font-mono text-[9px] text-[#2a2a2a] hover:text-[#00ff41] uppercase tracking-widest transition-colors">
                load_more_entries...
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Identity Card */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7" ref={shareCardRef}>
            <div className="bg-[#0a0a0a] border border-[#00ff41]/20 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff41]/5 blur-[80px] rounded-full" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 border border-[#00ff41] flex items-center justify-center">
                    <Layers className="w-6 h-6 text-[#00ff41]" />
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest">network_rank</p>
                    <p className="font-mono text-4xl font-bold text-[#00ff41] glow-green">
                      {displayEntry?.rank && displayEntry.rank > 0 ? `#${displayEntry.rank}` : '#—'}
                    </p>
                  </div>
                </div>

                <h2 className="font-mono text-3xl font-bold text-[#e0e0e0] mb-6 uppercase">
                  {displayEntry?.label?.split(' ')[0] || 'NODE'}<br/>
                  <span className="text-[#00ff41]">{displayEntry?.label?.split(' ')[1] || 'EXPLORER'}</span>
                </h2>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#00ff41]/30 bg-[#00ff41]/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41]" />
                  <span className="font-mono text-[9px] text-[#00ff41]">{truncateAddress(currentTarget || connectedAddress || '')}</span>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-12 pt-6 border-t border-[#1a1a1a]">
                  <div>
                    <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">score</p>
                    <p className="font-mono text-xl font-bold text-[#e0e0e0]">{clientScore.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">tvl</p>
                    <p className="font-mono text-xl font-bold text-[#e0e0e0]">${clientNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">ops</p>
                    <p className="font-mono text-xl font-bold text-[#e0e0e0]">{clientTxCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-2">dominance</p>
              <p className="font-mono text-2xl font-bold text-[#00ff41]">
                {displayEntry?.percentile && displayEntry.percentile > 0 ? (100 - displayEntry.percentile).toFixed(1) : '—'}%
              </p>
              <div className="h-1 bg-[#1a1a1a] mt-3 overflow-hidden">
                <div className="h-full bg-[#00ff41]" style={{ width: `${displayEntry?.percentile || 0}%` }} />
              </div>
            </div>
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-2">epochs_active</p>
              <p className="font-mono text-2xl font-bold text-[#ffb000]">{clientActiveDays}d</p>
            </div>
            <button onClick={handleDownload} className="btn-terminal w-full py-4 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              generate_identity_asset
            </button>
          </div>
        </div>
      )}

      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={connectWallet} isConnecting={isConnecting} error={walletError} />
    </div>
  );
}

function StatBlock({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="terminal-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3 h-3 text-[#2a2a2a]" />
        <span className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="font-mono text-lg font-bold text-[#e0e0e0]">{value}</p>
    </div>
  );
}
