'use client';

import { useWallet } from '@/hooks/useWallet';
import { useActiveNode } from '@/hooks/useActiveNode';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { useEcosystem } from '@/hooks/useEcosystem';
import { truncateAddress, cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { 
  Search, Terminal, Zap, Wallet, Shield, ChevronRight, 
  Activity, RefreshCcw, Globe, Trophy, ArrowUpRight, ArrowDownRight,
  ExternalLink, LogOut, Send, Loader2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SendModal } from '@/components/SendModal';
import { WalletModal } from '@/components/WalletModal';
import { motion } from 'framer-motion';

export default function Home() {
  const { address: connectedAddress, connect, connectWallet, disconnect, isConnecting, error: walletError, showModal, setShowModal } = useWallet();
  const { activeAddress, updateActiveNode, searchedAddress } = useActiveNode();
  const [searchInput, setSearchAddress] = useState('');
  const { balances, positions, extraData, history, isLoading } = useOmniPositions(activeAddress);
  const { projects: ecosystemProjects } = useEcosystem(activeAddress);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (searchedAddress) {
      setSearchAddress(searchedAddress);
    } else if (connectedAddress) {
      setSearchAddress(connectedAddress);
    }
  }, [searchedAddress, connectedAddress]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.startsWith('0x') && searchInput.length === 42 && ethers.isAddress(searchInput)) {
      updateActiveNode(searchInput);
    }
  };

  const totalNetWorth = parseFloat(balances.USDC || '0') + 
                        parseFloat(balances.EURC || '0') + 
                        (parseFloat(balances.ARC || '0') * 0.5) +
                        positions.reduce((acc, p) => acc + p.valueUsd, 0);

  const asciiChart = generateAsciiChart(history.map((_, i) => 300 + Math.sin(i * 0.8) * 200 + Math.random() * 100));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* Terminal Header */}
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#00ff41]">
              <Terminal className="w-4 h-4" />
              <span className="font-mono text-xs font-bold">ARC_TERMINAL</span>
            </div>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#4a4a4a]">{currentTime}</span>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#4a4a4a]">ARC_TESTNET</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-green" />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#2a2a2a]" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="0x... analyze node"
                value={searchInput}
                onChange={(e) => setSearchAddress(e.target.value)}
                maxLength={42}
                className="w-full terminal-input pl-9 pr-4 py-2.5"
              />
            </form>
            
            {connectedAddress ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 border border-[#1a1a1a] text-[10px] font-mono text-[#00ff41]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-green" />
                  {truncateAddress(connectedAddress)}
                </div>
                <button onClick={disconnect} className="p-2 border border-[#1a1a1a] text-[#4a4a4a] hover:text-[#ff3333] hover:border-[#ff3333] transition-colors">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                onClick={connect} 
                disabled={isConnecting}
                className="btn-terminal flex items-center gap-2"
              >
                {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {isConnecting ? 'connecting...' : 'connect'}
              </button>
            )}
          </div>
        </div>
      </header>

      {activeAddress ? (
        <>
          {/* System Status Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatBlock label="PORTFOLIO" value={`$${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="green" />
            <StatBlock label="SCORE" value={extraData.score.toLocaleString()} color="amber" />
            <StatBlock label="GAS_SPENT" value={`$${extraData.gasSpent}`} color="white" />
            <StatBlock label="TX_COUNT" value={extraData.txCount.toString()} color="white" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* ASCII Chart */}
              <div className="terminal-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-[#00ff41]" />
                    <span className="font-mono text-[10px] text-[#4a4a4a] uppercase tracking-widest">portfolio_trajectory</span>
                  </div>
                  <div className="flex gap-1">
                    {['1D', '1W', '1M', 'ALL'].map(t => (
                      <button key={t} className={cn("px-2 py-1 text-[8px] font-mono border", t === '1W' ? "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5" : "border-[#1a1a1a] text-[#2a2a2a] hover:text-[#4a4a4a]")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <pre className="font-mono text-[10px] text-[#00ff41] leading-tight overflow-x-auto">{asciiChart}</pre>
              </div>

              {/* Assets Table */}
              <div className="terminal-card">
                <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
                  <span className="font-mono text-[10px] text-[#4a4a4a] uppercase tracking-widest">digital_assets</span>
                  <span className="font-mono text-[8px] text-[#2a2a2a]">sync: {isLoading ? 'pending' : 'ok'}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full terminal-table">
                    <thead>
                      <tr>
                        <th>asset</th>
                        <th>balance</th>
                        <th className="text-right">value_usd</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AssetRow symbol="USDC" balance={balances.USDC || '0'} value={parseFloat(balances.USDC || '0')} />
                      <AssetRow symbol="EURC" balance={balances.EURC || '0'} value={parseFloat(balances.EURC || '0')} />
                      <AssetRow symbol="ARC" balance={balances.ARC || '0'} value={parseFloat(balances.ARC || '0') * 0.5} />
                      {positions.map((pos, i) => (
                        <AssetRow key={i} symbol={pos.name} balance={pos.balance} value={pos.valueUsd} protocol={pos.protocol} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <QuickAction icon={Send} label="send" desc="transfer" onClick={() => setIsSendModalOpen(true)} />
                <QuickAction icon={RefreshCcw} label="swap" desc="dex_order" href="/activity" />
                <QuickAction icon={Globe} label="bridge" desc="cross_chain" href="/activity" />
                <QuickAction icon={Zap} label="faucet" desc="testnet_gas" href="/missions" />
              </div>

              {/* Ecosystem */}
              <div className="terminal-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-3 h-3 text-[#00ff41]" />
                  <span className="font-mono text-[10px] text-[#4a4a4a] uppercase tracking-widest">ecosystem_presence</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ecosystemProjects.map(p => (
                    <a key={p.name} href={p.url} target="_blank" rel="noreferrer" 
                       className="flex items-center justify-between p-3 border border-[#1a1a1a] hover:border-[#00ff41]/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 border border-[#1a1a1a] flex items-center justify-center font-mono text-[10px] text-[#4a4a4a] group-hover:text-[#00ff41] group-hover:border-[#00ff41]/30 transition-colors">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="font-mono text-[11px] text-[#e0e0e0] group-hover:text-[#00ff41] transition-colors">{p.name}</p>
                          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase">{p.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[9px] text-[#4a4a4a]">${p.tvl.toLocaleString()}</p>
                        {p.userPositions > 0 && (
                          <p className="font-mono text-[8px] text-[#00ff41]">{p.userPositions} pos</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Live Activity */}
              <div className="terminal-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-green" />
                    <span className="font-mono text-[10px] text-[#4a4a4a] uppercase tracking-widest">live_activity</span>
                  </div>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {history.map((tx, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                      <div className="w-1 h-1 rounded-full bg-[#00ff41] mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] text-[#e0e0e0]">{tx.method}</span>
                          <span className="font-mono text-[8px] text-[#2a2a2a]">{tx.time}</span>
                        </div>
                        <p className="font-mono text-[9px] text-[#2a2a2a] truncate mt-1">{tx.hash}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/activity" className="block mt-3 py-2 border border-[#1a1a1a] text-center font-mono text-[9px] text-[#4a4a4a] hover:text-[#00ff41] hover:border-[#00ff41]/30 transition-colors uppercase tracking-widest">
                  view_full_history
                </Link>
              </div>

              {/* Network Health */}
              <div className="terminal-card p-4">
                <span className="font-mono text-[10px] text-[#4a4a4a] uppercase tracking-widest block mb-4">network_health</span>
                <div className="space-y-3">
                  <HealthItem label="consensus_engine" status="active" />
                  <HealthItem label="rpc_gateway" status="active" />
                  <HealthItem label="data_indexer" status="active" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <HeroSection connect={connect} isConnecting={isConnecting} />
      )}

      <SendModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} address={connectedAddress || ''} />
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={connectWallet} isConnecting={isConnecting} error={walletError} />
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="terminal-card p-4">
      <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className={cn(
        "font-mono text-lg font-bold tracking-tight",
        color === 'green' ? 'text-[#00ff41] glow-green' : color === 'amber' ? 'text-[#ffb000] glow-amber' : 'text-[#e0e0e0]'
      )}>
        {value}
      </p>
    </div>
  );
}

function AssetRow({ symbol, balance, value, protocol }: { symbol: string, balance: string, value: number, protocol?: string }) {
  return (
    <tr className="group hover:bg-[#00ff41]/[0.02] transition-colors">
      <td>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-[#1a1a1a] flex items-center justify-center font-mono text-[9px] text-[#4a4a4a]">
            {symbol[0]}
          </div>
          <div>
            <span className="font-mono text-[11px] text-[#e0e0e0] group-hover:text-[#00ff41] transition-colors">{symbol}</span>
            {protocol && <span className="font-mono text-[8px] text-[#2a2a2a] ml-2">{protocol}</span>}
          </div>
        </div>
      </td>
      <td>
        <span className="font-mono text-[11px] text-[#4a4a4a]">{parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
      </td>
      <td className="text-right">
        <span className="font-mono text-[11px] text-[#e0e0e0]">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </td>
    </tr>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick, href }: { icon: any, label: string, desc: string, onClick?: () => void, href?: string }) {
  const Content = (
    <div className="terminal-card p-4 flex items-center gap-3 group hover:border-[#00ff41]/30 transition-colors cursor-pointer h-full">
      <Icon className="w-4 h-4 text-[#2a2a2a] group-hover:text-[#00ff41] transition-colors" />
      <div>
        <p className="font-mono text-[10px] text-[#e0e0e0] group-hover:text-[#00ff41] transition-colors uppercase">{label}</p>
        <p className="font-mono text-[8px] text-[#2a2a2a]">{desc}</p>
      </div>
    </div>
  );

  return href ? <Link href={href} className="block">{Content}</Link> : <div onClick={onClick}>{Content}</div>;
}

function HealthItem({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
      <span className="font-mono text-[9px] text-[#4a4a4a]">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-[#00ff41]" />
        <span className="font-mono text-[8px] text-[#00ff41] uppercase">{status}</span>
      </div>
    </div>
  );
}

function HeroSection({ connect, isConnecting }: { connect: () => void, isConnecting: boolean }) {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "ARC_OMNI_TERMINAL";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="font-mono text-[10px] text-[#00ff41] mb-4">[ SYSTEM INITIALIZED ]</div>
        <h1 className="font-mono text-4xl md:text-6xl font-bold text-[#00ff41] glow-green tracking-tighter">
          {typedText}
          {showCursor && <span className="animate-pulse">_</span>}
        </h1>
        <p className="font-mono text-sm text-[#4a4a4a] max-w-lg mx-auto leading-relaxed">
          Hyper-detailed analytics for any address on the Arc Testnet.
          <br />
          <span className="text-[#00ff41]">High-signal insights. Zero noise.</span>
        </p>
      </div>
      
      <button 
        onClick={connect} disabled={isConnecting}
        className="btn-terminal px-8 py-4 text-sm"
      >
        {isConnecting ? '[ connecting... ]' : '[ initialize_terminal ]'}
      </button>

      <div className="flex items-center gap-6 text-[8px] font-mono text-[#2a2a2a] uppercase tracking-[0.3em]">
        <span>secure</span>
        <span>global</span>
        <span>real-time</span>
      </div>
    </div>
  );
}

function generateAsciiChart(data: number[]): string {
  if (data.length === 0) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 8;
  const width = Math.min(data.length, 50);
  const step = Math.floor(data.length / width);
  const sampled = data.filter((_, i) => i % step === 0).slice(0, width);
  
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return sampled.map(v => {
    const normalized = ((v - min) / range) * (chars.length - 1);
    return chars[Math.round(normalized)];
  }).join('');
}
