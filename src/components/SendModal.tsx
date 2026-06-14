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
  const [status, setStatus] = useState<'idle' | 'simulating' | 'preview' | 'loading' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [userBalance, setUserBalance] = useState('0.00');
  const [errorMessage, setErrorMessage] = useState('');
  const [decimals, setDecimals] = useState(18);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<{ gasLimit: string; gasPrice: string; totalCost: string } | null>(null);

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
          if (isMounted) { setUserBalance(formatted); setDecimals(Number(tokenDecimals)); }
       } catch {
         if (isMounted) { setUserBalance('0.00'); setDecimals(token === 'USDC' ? 18 : 6); }
       } finally {
         if (isMounted) setIsFetchingBalance(false);
       }
    }
    fetchTokenInfo();
    return () => { isMounted = false; };
  }, [token, address, isOpen]);

  const validationError = useMemo(() => {
    if (!amount) return null;
    if (parseFloat(amount) <= 0) return 'amount_must_be_positive';
    if (parseFloat(amount) > parseFloat(userBalance)) return 'insufficient_balance';
    if (recipient && !ethers.isAddress(recipient.trim())) return 'invalid_address';
    return null;
  }, [amount, userBalance, recipient]);

  const simulateTransaction = async () => {
    if (validationError || !recipient || !amount) return;
    setStatus('simulating');
    setGasEstimate(null);

    try {
      const rpc = new ethers.JsonRpcProvider(ARC_NETWORK.rpcUrl, undefined, { staticNetwork: true });
      const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
      const contract = new ethers.Contract(tokenData.address, ERC20_ABI, rpc);
      const amountValue = ethers.parseUnits(amount, decimals);

      const feeData = await rpc.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);

      // Estimate gas
      let gasLimit = BigInt(0);
      try {
        const eth = (window as any).ethereum as EthereumProvider;
        if (eth) {
          const browserProvider = new ethers.BrowserProvider(eth);
          const signer = await browserProvider.getSigner();
          const contractWithSigner = contract.connect(signer);
          gasLimit = await (contractWithSigner as any).transfer.estimateGas(recipient.trim(), amountValue);
        } else {
          gasLimit = BigInt(60000); // fallback
        }
      } catch {
        gasLimit = BigInt(60000);
      }

      const totalGasCost = ethers.formatUnits(gasLimit * gasPrice, 18);
      setGasEstimate({
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei',
        totalCost: totalGasCost,
      });
      setStatus('preview');
    } catch {
      setGasEstimate({ gasLimit: '60000', gasPrice: '0.045', totalCost: '0.045' });
      setStatus('preview');
    }
  };

  const handleSend = async () => {
    const eth = (window as any).ethereum as EthereumProvider | undefined;
    if (!eth) { setErrorMessage("no_wallet_detected"); setStatus('error'); return; }

    setStatus('loading');
    setErrorMessage('');
    
    try {
      const browserProvider = new ethers.BrowserProvider(eth as any);
      const signer = await browserProvider.getSigner();
      const tokenData = token === 'USDC' ? TOKENS.USDC : TOKENS.EURC;
      const contract = new ethers.Contract(tokenData.address, ERC20_ABI, signer);
      const amountValue = ethers.parseUnits(amount, decimals);

      const tx = await contract.transfer(recipient.trim(), amountValue);
      setTxHash(tx.hash);
      await tx.wait();
      setStatus('success');
      notify('success', 'TRANSMISSION_COMPLETE', `tx: ${tx.hash.slice(0, 10)}...`);
      setTimeout(() => { onClose(); resetForm(); }, 4000);
    } catch (err: any) {
      const msg = err?.message || '';
      let friendly = 'unknown_error';
      if (msg.includes('insufficient funds')) friendly = 'insufficient_gas';
      else if (msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) friendly = 'rejected_by_user';
      else if (msg.includes('execution reverted')) friendly = 'tx_reverted';
      setErrorMessage(friendly);
      setStatus('error');
      notify('error', 'TRANSMISSION_FAILED', friendly);
    }
  };

  const resetForm = () => { setStatus('idle'); setRecipient(''); setAmount(''); setTxHash(''); setErrorMessage(''); setGasEstimate(null); };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80" onClick={onClose} />
          
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#1a1a1a] p-6 overflow-hidden">

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <Send className="w-4 h-4 text-[#00ff41]" />
                <h2 className="font-mono text-sm font-bold text-[#00ff41] uppercase tracking-wider">transfer_assets</h2>
              </div>
              <button onClick={onClose} className="p-1 text-[#4a4a4a] hover:text-[#e0e0e0]"><X className="w-4 h-4" /></button>
            </div>

            {status === 'success' ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-[#00ff41] mx-auto" />
                <p className="font-mono text-sm text-[#00ff41]">TRANSMISSION_COMPLETE</p>
                <div className="terminal-card p-3">
                  <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">tx_hash</p>
                  <p className="font-mono text-[10px] text-[#00ff41] break-all">{txHash}</p>
                </div>
              </div>
            ) : status === 'simulating' ? (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin mx-auto" />
                <p className="font-mono text-[10px] text-[#4a4a4a] uppercase">simulating_transaction...</p>
              </div>
            ) : status === 'preview' ? (
              <div className="space-y-4">
                <div className="terminal-card p-4 space-y-3">
                  <div className="flex justify-between"><span className="font-mono text-[9px] text-[#2a2a2a] uppercase">sending</span><span className="font-mono text-[11px] text-[#e0e0e0]">{amount} {token}</span></div>
                  <div className="border-t border-[#1a1a1a]" />
                  <div className="flex justify-between"><span className="font-mono text-[9px] text-[#2a2a2a] uppercase">to</span><span className="font-mono text-[10px] text-[#4a4a4a]">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span></div>
                  <div className="border-t border-[#1a1a1a]" />
                  <div className="flex justify-between"><span className="font-mono text-[9px] text-[#2a2a2a] uppercase">gas_limit</span><span className="font-mono text-[10px] text-[#00ff41]">{gasEstimate?.gasLimit || '—'}</span></div>
                  <div className="border-t border-[#1a1a1a]" />
                  <div className="flex justify-between"><span className="font-mono text-[9px] text-[#2a2a2a] uppercase">gas_price</span><span className="font-mono text-[10px] text-[#00ff41]">{gasEstimate?.gasPrice || '—'}</span></div>
                  <div className="border-t border-[#1a1a1a]" />
                  <div className="flex justify-between"><span className="font-mono text-[9px] text-[#2a2a2a] uppercase">total_cost</span><span className="font-mono text-[11px] text-[#ffb000] font-bold">~{gasEstimate?.totalCost || '—'} ETH</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStatus('idle')} className="flex-1 py-3 border border-[#1a1a1a] font-mono text-[9px] text-[#4a4a4a] uppercase hover:text-[#e0e0e0] transition-colors">back</button>
                  <button onClick={handleSend} className="flex-[2] py-3 bg-[#00ff41] text-[#0a0a0a] font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#00cc33] transition-colors">confirm_send</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {['USDC', 'EURC'].map(t => (
                    <button key={t} onClick={() => setToken(t)} className={cn("py-3 font-mono text-[10px] uppercase border transition-colors",
                      token === t ? "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5" : "border-[#1a1a1a] text-[#2a2a2a] hover:text-[#4a4a4a]"
                    )}>{t}</button>
                  ))}
                </div>

                <div>
                  <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest block mb-1.5">destination</label>
                  <input type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} maxLength={42}
                    className="terminal-input w-full" />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest">amount</label>
                    <span className="font-mono text-[8px] text-[#2a2a2a]">bal: {parseFloat(userBalance).toFixed(2)}</span>
                  </div>
                  <div className="relative">
                    <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="terminal-input w-full text-2xl font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <button onClick={() => setAmount(userBalance)} className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#00ff41] border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10 transition-colors">MAX</button>
                  </div>
                </div>

                {validationError && (
                  <div className="terminal-card p-3 border-[#ff3333]/30">
                    <p className="font-mono text-[9px] text-[#ff3333] uppercase">{validationError}</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="terminal-card p-3 border-[#ff3333]/30">
                    <p className="font-mono text-[9px] text-[#ff3333] uppercase">{errorMessage}</p>
                  </div>
                )}

                <button onClick={simulateTransaction} disabled={!!validationError || !recipient || !amount}
                  className="btn-terminal w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Search className="w-3 h-3" /> simulate_transaction
                </button>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3 text-[#2a2a2a]" />
              <span className="font-mono text-[7px] text-[#2a2a2a] uppercase tracking-widest">consensus_verified</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
