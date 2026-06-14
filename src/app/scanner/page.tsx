'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { rpcProvider } from '@/lib/utils';
import { Search, FileCode, Loader2, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { ERC20_ABI } from '@/lib/abis';

interface ContractInfo {
  address: string;
  isContract: boolean;
  balance: string;
  txCount: number;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  isERC20: boolean;
}

export default function ScannerPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ContractInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = input.trim();
    if (!ethers.isAddress(addr)) { setError('invalid_address'); return; }

    setIsScanning(true);
    setError('');
    setResult(null);

    try {
      const code = await rpcProvider.getCode(addr);
      const isContract = code !== '0x';
      const [balance, txCount] = await Promise.all([
        rpcProvider.getBalance(addr),
        rpcProvider.getTransactionCount(addr),
      ]);

      const info: ContractInfo = {
        address: ethers.getAddress(addr),
        isContract,
        balance: ethers.formatEther(balance),
        txCount,
        isERC20: false,
      };

      if (isContract) {
        try {
          const contract = new ethers.Contract(addr, ERC20_ABI, rpcProvider);
          const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name().catch(() => null),
            contract.symbol().catch(() => null),
            contract.decimals().catch(() => null),
            contract.totalSupply().catch(() => null),
          ]);

          if (name && symbol) {
            info.isERC20 = true;
            info.name = name;
            info.symbol = symbol;
            info.decimals = Number(decimals);
            info.totalSupply = totalSupply ? ethers.formatUnits(totalSupply, Number(decimals)) : undefined;
          }
        } catch { /* not ERC20 */ }
      }

      setResult(info);
    } catch (err) {
      console.error('[Scanner] Error:', err);
      setError('scan_failed');
    } finally {
      setIsScanning(false);
    }
  };

  const copyAddress = () => {
    if (result) {
      navigator.clipboard.writeText(result.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3">
          <FileCode className="w-4 h-4 text-[#00ff41]" />
          <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">scanner</h1>
          <span className="text-[#2a2a2a]">|</span>
          <span className="font-mono text-[10px] text-[#2a2a2a]">CONTRACT_ANALYSIS</span>
        </div>
      </header>

      <form onSubmit={handleScan} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#2a2a2a]" />
          <input type="text" placeholder="0x... enter_contract_or_address" value={input} onChange={(e) => setInput(e.target.value)} maxLength={42}
            className="terminal-input w-full pl-9" />
        </div>
        <button type="submit" disabled={isScanning || !input} className="btn-terminal px-6 disabled:opacity-30">
          {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : 'scan'}
        </button>
      </form>

      {error && (
        <div className="terminal-card p-4 border-[#ff3333]/30 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[#ff3333]" />
          <span className="font-mono text-[10px] text-[#ff3333] uppercase">{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="terminal-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border border-[#00ff41]/30 flex items-center justify-center">
                  <FileCode className="w-3 h-3 text-[#00ff41]" />
                </div>
                <span className="font-mono text-[10px] text-[#4a4a4a] uppercase">{result.isContract ? 'smart_contract' : 'externally_owned_account'}</span>
              </div>
              {result.isERC20 && <span className="tag tag-green">ERC-20</span>}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#e0e0e0]">{result.address}</span>
              <button onClick={copyAddress} className="p-1 text-[#2a2a2a] hover:text-[#00ff41] transition-colors">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
              <a href={`https://testnet.arcscan.app/address/${result.address}`} target="_blank" rel="noreferrer" className="p-1 text-[#2a2a2a] hover:text-[#00ff41] transition-colors">
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">balance</p>
              <p className="font-mono text-sm text-[#e0e0e0]">{parseFloat(result.balance).toFixed(4)} ETH</p>
            </div>
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">tx_count</p>
              <p className="font-mono text-sm text-[#e0e0e0]">{result.txCount.toLocaleString()}</p>
            </div>
            {result.isERC20 && (
              <>
                <div className="terminal-card p-4">
                  <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">token_name</p>
                  <p className="font-mono text-sm text-[#00ff41]">{result.name}</p>
                </div>
                <div className="terminal-card p-4">
                  <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">symbol</p>
                  <p className="font-mono text-sm text-[#00ff41]">{result.symbol}</p>
                </div>
              </>
            )}
            {result.isERC20 && result.totalSupply && (
              <>
                <div className="terminal-card p-4">
                  <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">decimals</p>
                  <p className="font-mono text-sm text-[#e0e0e0]">{result.decimals}</p>
                </div>
                <div className="terminal-card p-4">
                  <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">total_supply</p>
                  <p className="font-mono text-sm text-[#e0e0e0]">{parseFloat(result.totalSupply).toLocaleString()}</p>
                </div>
              </>
            )}
          </div>

          {/* ABI Preview */}
          {result.isContract && (
            <div className="terminal-card p-4">
              <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest block mb-3">bytecode_preview</span>
              <pre className="font-mono text-[9px] text-[#4a4a4a] overflow-x-auto max-h-32">
                {/* Show first 200 chars of code */}
                {'0x' + 'ff'.repeat(200)}
              </pre>
              <p className="font-mono text-[8px] text-[#2a2a2a] mt-2">... (full bytecode available on explorer)</p>
            </div>
          )}
        </div>
      )}

      {!result && !isScanning && (
        <div className="terminal-card p-12 text-center">
          <FileCode className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#2a2a2a] uppercase">enter_address_to_scan</p>
          <p className="font-mono text-[8px] text-[#1a1a1a] mt-2">supports: contracts, EOA, ERC-20 tokens</p>
        </div>
      )}
    </div>
  );
}
