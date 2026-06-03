'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { X, Send, ArrowRight, ShieldCheck, Zap, AlertCircle, CheckCircle2, Search } from 'lucide-react';
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

  // Fetch balance when token or address changes
  useEffect(() => {
    async function fetchBal() {
       if (!address || !isOpen) return;
       try {
          const rpcProvider = new ethers.JsonRpcProvider(ARC_NETWORK.rpcUrl, undefined, { staticNetwork: true });
          const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
          const contract = new ethers.Contract(tokenData.address, ERC20_ABI, rpcProvider);
          const bal = await contract.balanceOf(address);
          setUserBalance(ethers.formatUnits(bal, tokenData.decimals));
       } catch (e) {
          console.error("Balance fetch error", e);
       }
    }
    fetchBal();
  }, [token, address, isOpen]);

  const handleSend = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
       alert("No wallet detected. Please install MetaMask or Rabby.");
       return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
       alert("Please enter a valid amount.");
       return;
    }

    const targetAddr = recipient.trim();
    if (!ethers.isAddress(targetAddr)) {
       alert("Invalid destination address.");
       return;
    }

    setStatus('loading');
    try {
      // Force static network to bypass ENS name resolution attempts
      const browserProvider = new ethers.BrowserProvider(eth, undefined, { staticNetwork: true });
      const signer = await browserProvider.getSigner();
      
      const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
      const contract = new ethers.Contract(tokenData.address, ERC20_ABI, signer);
      
      const amountToValue = ethers.parseUnits(amount, tokenData.decimals);
      
      console.log(`Sending ${amount} ${token} to ${targetAddr}`);
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
      console.error("Send Error Details:", e);
      let msg = e.message || "Unknown error";
      if (e.code === 'ACTION_REJECTED') msg = "User rejected the transaction.";
      if (e.code === 'INSUFFICIENT_FUNDS') msg = "Insufficient gas (ARC) for transaction.";
      
      alert(`Transmission Failed: ${msg}`);
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
            className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[3.5rem] p-12 shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 rounded-[1.8rem] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                     <Send className="w-8 h-8 text-white" />
                  </div>
                  <div>
                     <h2 className="text-4xl font-black tracking-tighter uppercase italic">Transfer</h2>
                     <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Arc L1 Secure Asset Gateway</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-white/20 hover:text-white transition-all hover:scale-110">
                  <X className="w-6 h-6" />
               </button>
            </div>

            {status === 'success' ? (
              <div className="py-24 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                 <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black tracking-tight text-green-500 uppercase italic">Success</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Payload delivered to destination node</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mx-6">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-2 text-left ml-1">Evidence Hash</p>
                    <p className="text-[10px] text-white/60 font-mono break-all text-left">{txHash}</p>
                 </div>
              </div>
            ) : (
              <div className="space-y-10">
                 {/* Asset Selection */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] ml-2">Protocol Asset</label>
                    <div className="grid grid-cols-2 gap-4">
                       {['USDC', 'EURC'].map(t => (
                         <button 
                           key={t} onClick={() => setToken(t)}
                           className={cn(
                             "py-5 rounded-3xl border font-black text-sm transition-all uppercase tracking-widest",
                             token === t ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105" : "bg-white/5 border-white/5 text-white/20 hover:border-white/10"
                           )}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Recipient */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] ml-2">Destination Node</label>
                    <div className="relative">
                       <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
                       <input 
                         type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)}
                         className="w-full bg-white/5 border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-white/5 shadow-inner"
                       />
                    </div>
                 </div>

                 {/* Amount */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-end px-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em]">Payload Magnitude</label>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Available</p>
                          <p className="text-xs font-black text-white/40 font-mono">{parseFloat(userBalance).toFixed(2)} {token}</p>
                       </div>
                    </div>
                    <div className="relative group">
                       <input 
                         type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl py-8 px-10 text-5xl font-black font-mono focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-white/5 shadow-inner"
                       />
                       <button 
                         onClick={() => setAmount(userBalance)}
                         className="absolute right-10 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white/60 hover:text-white hover:bg-white/20 transition-all active:scale-95"
                       >
                         MAX
                       </button>
                    </div>
                 </div>

                 {/* Submit */}
                 <div className="pt-4">
                    <button 
                      onClick={handleSend}
                      disabled={status === 'loading' || !recipient || !amount}
                      className={cn(
                        "w-full py-8 rounded-full font-black uppercase tracking-[0.5em] text-xs transition-all relative overflow-hidden shadow-2xl",
                        status === 'error' ? "bg-red-600 text-white" : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-0.95"
                      )}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-4">
                        {status === 'loading' ? (
                          <>
                            <Zap className="w-5 h-5 animate-pulse" />
                            Encrypting Payload...
                          </>
                        ) : status === 'error' ? (
                          'Gateway Rejection'
                        ) : (
                          <>
                            <ArrowRight className="w-5 h-5" />
                            Authorize Transmission
                          </>
                        )}
                      </span>
                      {status === 'loading' && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                      )}
                    </button>
                 </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">
               <ShieldCheck className="w-5 h-5" />
               Consensus Verified Gateway
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
