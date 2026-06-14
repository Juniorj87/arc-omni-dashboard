'use client';

import { useWallet } from '@/hooks/useWallet';
import { cn, truncateAddress } from '@/lib/utils';
import { 
  Plus, Wallet, Copy, Trash2, 
  Download, Upload
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletEntry {
  address: string;
  label: string;
  network: string;
  balance: string;
}

export default function WalletsPage() {
  const { address: currentAddress } = useWallet();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('arc-wallets');
    if (saved) {
      setTimeout(() => setWallets(JSON.parse(saved)), 0);
    } else if (currentAddress) {
      const initial = [{ address: currentAddress, label: 'Main Wallet', network: 'Arc Testnet', balance: '0.00' }];
      setTimeout(() => {
        setWallets(initial);
        localStorage.setItem('arc-wallets', JSON.stringify(initial));
      }, 0);
    }
  }, [currentAddress]);

  const addWallet = () => {
    if (!newAddress || !newLabel) return;
    const next = [...wallets, { address: newAddress, label: newLabel, network: 'Arc Testnet', balance: '0.00' }];
    setWallets(next);
    localStorage.setItem('arc-wallets', JSON.stringify(next));
    setIsAddModalOpen(false);
    setNewAddress('');
    setNewLabel('');
  };

  const removeWallet = (addr: string) => {
    const next = wallets.filter(w => w.address !== addr);
    setWallets(next);
    localStorage.setItem('arc-wallets', JSON.stringify(next));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Wallet Manager</h1>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Multi-Identity Controller</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
              <Download className="w-4 h-4" /> Export
           </button>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
              <Upload className="w-4 h-4" /> Import
           </button>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
           >
              <Plus className="w-4 h-4" /> Add Identity
           </button>
        </div>
      </header>

      <div className="arc-glass rounded-[2.5rem] border border-white/5 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="text-left border-b border-white/5">
                 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Identity</th>
                 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Network</th>
                 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Status</th>
                 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {wallets.map((w) => (
                 <tr key={w.address} className={cn("group hover:bg-white/[0.02] transition-colors", w.address === currentAddress && "bg-blue-600/[0.03]")}>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                            w.address === currentAddress ? "bg-blue-600/10 border-blue-500/20 text-blue-500" : "bg-white/5 border-white/5 text-white/20"
                          )}>
                             <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="font-bold text-sm text-white flex items-center gap-2">
                               {w.label}
                               {w.address === currentAddress && <span className="text-[8px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">Active</span>}
                             </div>
                             <p className="text-xs font-mono text-white/20">{truncateAddress(w.address)}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{w.network}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Synced</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-white/10 hover:text-white transition-colors">
                             <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeWallet(w.address)} className="p-2 text-white/10 hover:text-red-500 transition-colors">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0b0f17] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                 <Plus className="w-6 h-6 text-blue-500" />
                 Add New Identity
              </h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Label</label>
                    <input 
                      type="text" placeholder="e.g. Farming Wallet 1" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 text-white"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Address</label>
                    <input 
                      type="text" placeholder="0x..." value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-mono focus:outline-none focus:border-blue-500/30 text-white"
                    />
                 </div>
                 <button 
                   onClick={addWallet}
                   className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest mt-6 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                 >
                   Deploy Identity
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
