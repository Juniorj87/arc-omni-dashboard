'use client';

import { useWallet } from '@/hooks/useWallet';
import { cn, truncateAddress } from '@/lib/utils';
import { ethers } from 'ethers';
import { Settings, Wallet, Copy, Trash2, Plus, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletEntry { address: string; label: string; network: string; }

export default function WalletsPage() {
  const { address: currentAddress } = useWallet();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('arc-wallets');
    if (saved) {
      try { const p = JSON.parse(saved); if (Array.isArray(p)) setWallets(p); } catch { localStorage.removeItem('arc-wallets'); }
    } else if (currentAddress) {
      const initial = [{ address: currentAddress, label: 'main_wallet', network: 'arc_testnet' }];
      setWallets(initial);
      localStorage.setItem('arc-wallets', JSON.stringify(initial));
    }
  }, [currentAddress]);

  const addWallet = () => {
    if (!newAddress || !newLabel || !ethers.isAddress(newAddress)) return;
    const next = [...wallets, { address: newAddress, label: newLabel, network: 'arc_testnet' }];
    setWallets(next);
    localStorage.setItem('arc-wallets', JSON.stringify(next));
    setIsAddOpen(false); setNewAddress(''); setNewLabel('');
  };

  const removeWallet = (addr: string) => {
    const next = wallets.filter(w => w.address !== addr);
    setWallets(next);
    localStorage.setItem('arc-wallets', JSON.stringify(next));
  };

  const copyAddress = (addr: string, idx: number) => {
    navigator.clipboard.writeText(addr);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">wallets</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">IDENTITY_MANAGER</span>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="btn-terminal py-2 px-4 text-[9px]">+ add</button>
        </div>
      </header>

      <div className="terminal-card">
        <table className="w-full terminal-table">
          <thead>
            <tr>
              <th>identity</th>
              <th>network</th>
              <th>status</th>
              <th className="text-right">actions</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w, i) => (
              <tr key={w.address} className={cn("transition-colors", w.address === currentAddress && "bg-[#00ff41]/[0.02]")}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-6 h-6 border flex items-center justify-center",
                      w.address === currentAddress ? "border-[#00ff41]/30 text-[#00ff41]" : "border-[#1a1a1a] text-[#2a2a2a]"
                    )}>
                      <Wallet className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] text-[#e0e0e0]">{w.label}</span>
                      {w.address === currentAddress && <span className="tag tag-green text-[7px] ml-2">active</span>}
                      <p className="font-mono text-[9px] text-[#2a2a2a] mt-0.5">{truncateAddress(w.address)}</p>
                    </div>
                  </div>
                </td>
                <td><span className="font-mono text-[9px] text-[#4a4a4a]">{w.network}</span></td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#00ff41]" />
                    <span className="font-mono text-[8px] text-[#00ff41] uppercase">synced</span>
                  </div>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => copyAddress(w.address, i)} className="p-1.5 text-[#2a2a2a] hover:text-[#00ff41] transition-colors">
                      {copiedIdx === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button onClick={() => removeWallet(w.address)} className="p-1.5 text-[#2a2a2a] hover:text-[#ff3333] transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80" onClick={() => setIsAddOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1a1a1a]">
                <span className="font-mono text-sm text-[#00ff41] uppercase">add_identity</span>
                <button onClick={() => setIsAddOpen(false)} className="text-[#4a4a4a] hover:text-[#e0e0e0]"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest block mb-1.5">label</label>
                  <input type="text" placeholder="farming_wallet_1" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                    className="terminal-input w-full" />
                </div>
                <div>
                  <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest block mb-1.5">address</label>
                  <input type="text" placeholder="0x..." value={newAddress} onChange={(e) => setNewAddress(e.target.value)} maxLength={42}
                    className="terminal-input w-full" />
                </div>
                <button onClick={addWallet} className="btn-terminal w-full py-3">deploy_identity</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
