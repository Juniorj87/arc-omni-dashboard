'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'metamask' | 'rabby') => void;
}

export function WalletModal({ isOpen, onClose, onSelect }: WalletModalProps) {
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
               <button 
                 onClick={() => onSelect('rabby')}
                 className="w-full flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] hover:border-blue-500/30 transition-all group"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://rabby.io/assets/images/logo.png" alt="Rabby" className="w-8 h-8 object-contain" />
                     </div>
                     <div className="text-left">
                        <p className="font-bold text-white uppercase tracking-widest text-xs">Rabby Wallet</p>
                        <p className="text-[10px] text-white/20 uppercase font-black">Preferred for Arc</p>
                     </div>
                  </div>
                  <Zap className="w-4 h-4 text-white/10 group-hover:text-blue-500 transition-colors" />
               </button>

               <button 
                 onClick={() => onSelect('metamask')}
                 className="w-full flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] hover:border-orange-500/30 transition-all group"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-8 h-8 object-contain" />
                     </div>
                     <div className="text-left">
                        <p className="font-bold text-white uppercase tracking-widest text-xs">MetaMask</p>
                        <p className="text-[10px] text-white/20 uppercase font-black">Standard Gateway</p>
                     </div>
                  </div>
                  <Zap className="w-4 h-4 text-white/10 group-hover:text-orange-500 transition-colors" />
               </button>
            </div>

            <p className="mt-8 text-[9px] text-white/10 font-black uppercase text-center tracking-[0.3em]">
               Sovereign Node Connection v2.0
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
