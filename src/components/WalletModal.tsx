'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'metamask' | 'rabby') => void;
  isConnecting?: boolean;
  error?: string | null;
}

export function WalletModal({ isOpen, onClose, onSelect, isConnecting, error }: WalletModalProps) {
  const wallets = [
    { type: 'rabby' as const, name: 'Rabby Wallet', desc: 'Preferred for Arc', color: 'blue' },
    { type: 'metamask' as const, name: 'MetaMask', desc: 'Standard Gateway', color: 'orange' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Identity Source</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {wallets.map((w) => (
                <button
                  key={w.type}
                  onClick={() => onSelect(w.type)}
                  disabled={isConnecting}
                  className={cn(
                    "w-full flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl transition-all group",
                    "hover:bg-white/[0.06] hover:border-white/20",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      w.color === 'blue' ? "bg-blue-500/10" : "bg-orange-500/10"
                    )}>
                      <span className={cn(
                        "text-xl font-black",
                        w.color === 'blue' ? "text-blue-500" : "text-orange-500"
                      )}>{w.name[0]}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white uppercase tracking-widest text-xs">{w.name}</p>
                      <p className="text-[10px] text-white/20 uppercase font-black">{w.desc}</p>
                    </div>
                  </div>
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : null}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</p>
              </div>
            )}

            <p className="mt-8 text-[9px] text-white/10 font-black uppercase text-center tracking-[0.3em]">
              Sovereign Node Connection v2.0
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
