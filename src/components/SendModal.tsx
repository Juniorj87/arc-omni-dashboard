'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { X, Send, ArrowRight, ShieldCheck, Zap, Search, CheckCircle2 } from 'lucide-react';
import { TOKENS, ARC_NETWORK } from '@/lib/constants';
import { ERC20_ABI } from '@/lib/abis';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function SendModal({ isOpen, onClose, address }: { isOpen: boolean; onClose: () => void; address: string }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [userBalance, setUserBalance] = useState('0.00');

  useEffect(() => {
    let isMounted = true;
    async function fetchBal() {
       if (!address || !isOpen) return;
       console.log("[SendModal] Fetching balance for:", address);
       try {
          // Use a fresh provider instance to avoid any cached state
          const rpc = new ethers.JsonRpcProvider(ARC_NETWORK.rpcUrl, undefined, { staticNetwork: true });
          const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
          const contract = new ethers.Contract(tokenData.address, ERC20_ABI, rpc);
          
          const bal = await contract.balanceOf(address);
          const formatted = ethers.formatUnits(bal, tokenData.decimals);
          
          if (isMounted) {
            console.log(`[SendModal] Balance for ${token}: ${formatted}`);
            setUserBalance(formatted);
          }
       } catch (e) {
          console.error("[SendModal] Balance fetch error:", e);
          if (isMounted) setUserBalance('0.00');
       }
    }
    fetchBal();
    return () => { isMounted = false; };
  }, [token, address, isOpen]);

  const handleMax = () => {
    console.log("[SendModal] MAX clicked. Balance:", userBalance);
    setAmount(userBalance);
  };

  const handleSend = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
       alert("No wallet detected.");
       return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
       alert("Enter a valid amount.");
       return;
    }

    const targetAddr = recipient.trim();
    if (!ethers.isAddress(targetAddr)) {
       alert("Invalid recipient address.");
       return;
    }

    setStatus('loading');
    try {
      // Use the specific chainId to bypass ENS check
      const browserProvider = new ethers.BrowserProvider(eth, 5042002);
      const signer = await browserProvider.getSigner();
      
      const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
      const contract = new ethers.Contract(tokenData.address, ERC20_ABI, signer);
      
      const amountToValue = ethers.parseUnits(amount, tokenData.decimals);
      
      console.log(`[SendModal] Authorizing: ${amount} ${token}`);
      const tx = await contract.transfer(targetAddr, amountToValue);
      setTxHash(tx.hash);
      
      await tx.wait();
      setStatus('success');
      
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setRecipient('');
        setAmount('');
      }, 4000);
    } catch (e: any) {
      console.error("[SendModal] Send failed:", e);
      alert(`Error: ${e.message || "Unknown error"}`);
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
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-start mb-10 text-white">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                     <Send className="w-7 h-7" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black uppercase italic tracking-tighter">Transfer</h2>
                     <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Arc Consensus Protocol</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:text-white transition-colors text-white/20">
                  <X className="w-6 h-6" />
               </button>
            </div>

            {status === 'success' ? (
              <div className="py-20 text-center space-y-6">
                 <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                 </div>
                 <h3 className="text-2xl font-black text-green-500 uppercase italic">Payload Delivered</h3>
                 <p className="text-[10px] text-white/40 font-mono break-all">{txHash}</p>
              </div>
            ) : (
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-2">Asset</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['USDC', 'EURC'].map(t => (
                         <button 
                           key={t} onClick={() => setToken(t)}
                           className={cn(
                             "py-4 rounded-2xl border font-black text-xs transition-all uppercase",
                             token === t ? "bg-white text-black border-white shadow-xl" : "bg-white/5 border-white/5 text-white/20"
                           )}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-2">Destination</label>
                    <div className="relative">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                       <input 
                         type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-mono focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/5"
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Magnitude</label>
                       <span className="text-[10px] font-black text-white/40 uppercase">Bal: {parseFloat(userBalance).toFixed(2)} {token}</span>
                    </div>
                    <div className="relative">
                       <input 
                         type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-6 px-8 text-4xl font-black font-mono focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/5"
                       />
                       <button 
                         type="button"
                         onClick={handleMax}
                         className="absolute right-8 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-blue-500 transition-colors"
                       >
                         MAX
                       </button>
                    </div>
                 </div>

                 <button 
                   onClick={handleSend}
                   disabled={status === 'loading' || !recipient || !amount}
                   className={cn(
                     "w-full py-6 rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all relative overflow-hidden",
                     status === 'error' ? "bg-red-600 text-white" : "bg-blue-600 text-white hover:bg-blue-500 shadow-2xl shadow-blue-600/20"
                   )}
                 >
                   <span className="relative z-10">{status === 'loading' ? 'Transmitting...' : 'Authorize Payload'}</span>
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
               Consensus Verified
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
