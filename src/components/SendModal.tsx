'use client';

import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { X, Send, ShieldCheck, CheckCircle2, Search, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { TOKENS, ARC_NETWORK } from '@/lib/constants';
import { ERC20_ABI } from '@/lib/abis';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { notify } from '@/components/NotificationCenter';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export function SendModal({ isOpen, onClose, address }: { isOpen: boolean; onClose: () => void; address: string }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');
  const [status, setStatus] = useState<'idle' | 'validating' | 'preview' | 'loading' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [userBalance, setUserBalance] = useState('0.00');
  const [errorMessage, setErrorMessage] = useState('');
  const [decimals, setDecimals] = useState(18);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchTokenInfo() {
       if (!address || !isOpen) return;
       setIsFetchingBalance(true);
       try {
          const rpc = new ethers.JsonRpcProvider(ARC_NETWORK.rpcUrl, undefined, { staticNetwork: true });
          const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
          const contract = new ethers.Contract(tokenData.address, ERC20_ABI, rpc);
          
          const [bal, tokenDecimals] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals().catch(() => tokenData.decimals)
          ]);

          const formatted = ethers.formatUnits(bal, tokenDecimals);
          
          if (isMounted) {
            setUserBalance(formatted);
            setDecimals(Number(tokenDecimals));
          }
       } catch (e) {
          console.error("[SendModal] Info fetch error:", e);
          if (isMounted) {
            setUserBalance('0.00');
            setDecimals(token === 'USDC' ? 18 : 6);
          }
       } finally {
         if (isMounted) setIsFetchingBalance(false);
       }
    }
    fetchTokenInfo();
    return () => { isMounted = false; };
  }, [token, address, isOpen]);

  // Real-time validation (Calculated during render to avoid setState in effect)
  const validationError = useMemo(() => {
    if (!amount) return null;
    if (parseFloat(amount) <= 0) return 'Amount must be greater than zero';
    if (parseFloat(amount) > parseFloat(userBalance)) return '❌ Insufficient Balance';
    if (recipient && !ethers.isAddress(recipient.trim())) return '❌ Invalid Address';
    return null;
  }, [amount, userBalance, recipient]);

  const handleMax = () => {
    setAmount(userBalance);
  };

  const parseError = (err: any) => {
    const msg = err?.message || "";
    const reason = err?.reason || "";
    if (msg.includes("insufficient funds") || reason.includes("insufficient funds")) return "❌ Insufficient Balance for Gas";
    if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) return "Transaction Rejected by User";
    if (msg.includes("execution reverted")) return "❌ Transaction Reverted";
    if (msg.includes("INVALID_ARGUMENT")) return "❌ Invalid Address or Amount";
    if (msg.includes("estimateGas")) return "❌ Gas Estimation Failed";
    return msg || "Unknown Error";
  };

  const handleInitiate = () => {
    if (validationError) return;
    if (!recipient || !amount) return;
    setStatus('preview');
  };

  const handleSend = async () => {
    const eth = (window as any).ethereum as EthereumProvider | undefined;
    if (!eth) {
       setErrorMessage("No wallet detected.");
       setStatus('error');
       notify('error', 'Transmission Failed', 'No wallet detected.');
       return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    try {
      const browserProvider = new ethers.BrowserProvider(eth as any);
      const signer = await browserProvider.getSigner();
      
      const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
      const contract = new ethers.Contract(tokenData.address, ERC20_ABI, signer);
      
      const currentBal = await contract.balanceOf(address);
      const amountToValue = ethers.parseUnits(amount, decimals);

      if (amountToValue > currentBal) {
        throw new Error("❌ Insufficient Balance");
      }
      
      try {
        await contract.transfer.estimateGas(recipient.trim(), amountToValue);
      } catch (gasErr) {
        throw new Error("❌ Gas Estimation Failed");
      }

      const tx = await contract.transfer(recipient.trim(), amountToValue);
      setTxHash(tx.hash);
      
      await tx.wait();
      setStatus('success');
      notify('success', 'Payload Delivered', `Transaction confirmed on Arc.`);
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 5000);
    } catch (err: unknown) {
      console.error("[SendModal] Send failed:", err);
      const friendlyError = parseError(err);
      setErrorMessage(friendlyError);
      setStatus('error');
      notify('error', 'Transmission Failed', friendlyError);
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setRecipient('');
    setAmount('');
    setTxHash('');
    setErrorMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[100px] rounded-full" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                       <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold tracking-tight text-white">Transfer Assets</h2>
                       <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Arc Consensus Protocol</p>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {status === 'success' ? (
                <div className="py-12 text-center space-y-6">
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                   </motion.div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Payload Delivered</h3>
                     <p className="text-sm text-white/40">Transaction confirmed successfully.</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                     <p className="text-[10px] text-white/20 uppercase font-black mb-1">TX Hash</p>
                     <p className="text-[11px] text-blue-400 font-mono break-all">{txHash}</p>
                   </div>
                   <button onClick={onClose} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/5">
                     Close Portal
                   </button>
                </div>
              ) : status === 'preview' ? (
                <div className="space-y-8 py-4">
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black text-white/20 tracking-widest">Sending</span>
                      <span className="text-lg font-bold text-white">{amount} {token}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black text-white/20 tracking-widest">Estimated Gas</span>
                      <span className="text-[10px] font-mono text-blue-400">~0.045 USDC</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black text-white/20 tracking-widest">Total Cost</span>
                      <span className="text-xs font-bold text-white">{parseFloat(amount) + 0.045} {token}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black text-white/20 tracking-widest">To</span>
                      <span className="text-xs font-mono text-white/60">{recipient.slice(0, 10)}...{recipient.slice(-8)}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStatus('idle')} className="flex-1 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-white/5 text-white/40 hover:bg-white/10 transition-all border border-white/5">Back</button>
                    <button onClick={handleSend} className="flex-[2] py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all">Confirm & Send</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="space-y-2.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Asset</label>
                        {isFetchingBalance && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         {['USDC', 'EURC'].map(t => (
                           <button key={t} onClick={() => setToken(t)} className={cn("py-4 rounded-2xl border font-black text-xs transition-all uppercase tracking-widest", token === t ? "bg-white text-black border-white shadow-xl" : "bg-white/5 border-white/5 text-white/20 hover:bg-white/10")}>{t}</button>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-1">Destination Address</label>
                      <div className="relative group">
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg group-focus-within:bg-blue-500/10 transition-colors">
                            <Search className="w-3.5 h-3.5 text-white/20 group-focus-within:text-blue-500" />
                         </div>
                         <input type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-mono focus:outline-none focus:border-blue-500/30 text-white placeholder:text-white/5 transition-all" />
                      </div>
                   </div>
                   <div className="space-y-2.5">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Magnitude</label>
                         <span className="text-[10px] font-bold text-white/40 uppercase">Bal: {parseFloat(userBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} {token}</span>
                      </div>
                      <div className="relative group">
                         <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-3xl py-7 px-8 text-4xl font-bold font-mono focus:outline-none focus:border-blue-500/30 text-white placeholder:text-white/5 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                         <button type="button" onClick={handleMax} className="absolute right-6 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all active:scale-95">MAX</button>
                      </div>
                   </div>
                   <AnimatePresence>
                     {(validationError || status === 'error') && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                         <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500">
                           <AlertCircle className="w-4 h-4 shrink-0" />
                           <p className="text-[10px] font-bold uppercase tracking-widest">{validationError || errorMessage}</p>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   <button onClick={handleInitiate} disabled={status === 'loading' || !!validationError || !recipient || !amount} className={cn("w-full py-6 rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all relative overflow-hidden flex items-center justify-center gap-3", status === 'loading' ? "bg-white/5 text-white/20" : "bg-blue-600 text-white hover:bg-blue-500 shadow-2xl shadow-blue-600/20 active:scale-[0.98]")}>
                     {status === 'loading' ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Transmitting...</span></>) : (<><span>Authorize Payload</span><ArrowRight className="w-4 h-4" /></>)}
                     {status === 'loading' && <motion.div className="absolute inset-0 bg-white/10" animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />}
                   </button>
                </div>
              )}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-3 text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]"><ShieldCheck className="w-4 h-4" />Consensus Verified</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
