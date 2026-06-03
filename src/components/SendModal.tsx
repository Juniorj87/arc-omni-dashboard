'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { X, Send, ArrowRight, ShieldCheck, Zap, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { TOKENS } from '@/lib/constants';
import { ERC20_ABI } from '@/lib/abis';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function SendModal({ isOpen, onClose, address }: { isOpen: boolean; onClose: () => void; address: string }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');

  const handleSend = async () => {
    if (!(window as any).ethereum) {
       alert("No wallet detected. Please install MetaMask or Rabby.");
       return;
    }
    
    setStatus('loading');
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
      const contract = new ethers.Contract(tokenData.address, ERC20_ABI, signer);
      
      // Clean recipient address
      const targetAddr = recipient.trim();
      if (!ethers.isAddress(targetAddr)) {
         alert("Invalid recipient address format.");
         setStatus('error');
         return;
      }

      // Verification before send
      const userBal = await contract.balanceOf(address);
      const amountToValue = ethers.parseUnits(amount, tokenData.decimals);
      
      if (userBal < amountToValue) {
         alert(`Insufficient ${token} balance.`);
         setStatus('error');
         return;
      }

      console.log(`Attempting to send ${amount} ${token} to ${targetAddr}`);
      const tx = await contract.transfer(targetAddr, amountToValue);
      setTxHash(tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setRecipient('');
        setAmount('');
      }, 5000);
    } catch (e: any) {
      console.error("Send Error:", e);
      // Detailed error logging for user
      if (e.code === 'ACTION_REJECTED') {
         alert("Transaction rejected by user.");
      } else {
         alert(`Transmission Error: ${e.message || "Unknown error"}`);
      }
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                     <Send className="w-7 h-7 text-white" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black tracking-tighter uppercase italic">Transfer</h2>
                     <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Arc L1 Secure Asset Gateway</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {status === 'success' ? (
              <div className="py-20 text-center space-y-6">
                 <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                    <CheckCircle2 className="w-10 h-10 text-green-500 animate-bounce" />
                 </div>
                 <h3 className="text-2xl font-bold tracking-tight text-green-500 uppercase">Transmission Successful</h3>
                 <p className="text-xs text-white/40 font-mono break-all px-10">{txHash}</p>
              </div>
            ) : (
              <div className="space-y-8">
                 {/* Asset Selection */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-1">Protocol Asset</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['USDC', 'EURC'].map(t => (
                         <button 
                           key={t} onClick={() => setToken(t)}
                           className={cn(
                             "py-4 rounded-2xl border font-black text-xs transition-all uppercase tracking-widest",
                             token === t ? "bg-white text-black border-white shadow-xl" : "bg-white/5 border-white/5 text-white/20 hover:border-white/10"
                           )}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Recipient */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-1">Destination Node</label>
                    <div className="relative">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                       <input 
                         type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-all text-white"
                       />
                    </div>
                 </div>

                 {/* Amount */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-1">Payload Magnitude</label>
                    <div className="relative group">
                       <input 
                         type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-6 px-8 text-3xl font-black font-mono focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-white/5"
                       />
                       <div className="absolute right-8 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-white/40 group-hover:text-white cursor-pointer transition-colors">MAX</div>
                    </div>
                 </div>

                 {/* Submit */}
                 <button 
                   onClick={handleSend}
                   disabled={status === 'loading' || !recipient || !amount}
                   className={cn(
                     "w-full py-6 rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all relative overflow-hidden",
                     status === 'error' ? "bg-red-600 text-white" : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-0.95"
                   )}
                 >
                   <span className="relative z-10">
                     {status === 'loading' ? 'Encrypting Payload...' : 
                      status === 'error' ? 'Gateway Rejection' : 'Authorize Transmission'}
                   </span>
                   {status === 'loading' && (
                     <motion.div 
                       className="absolute inset-0 bg-white/20"
                       animate={{ x: ['-100%', '100%'] }}
                       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                     />
                   )}
                 </button>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-3 text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">
               <ShieldCheck className="w-4 h-4" />
               Secured via Arc Consensus Protocol
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
