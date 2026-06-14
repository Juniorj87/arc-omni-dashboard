'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { rpcProvider } from '@/lib/utils';
import { Flame, RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GasData {
  gasPrice: string;
  baseFee: string;
  timestamp: number;
  blockNumber: number;
}

export default function GasPage() {
  const [currentGas, setCurrentGas] = useState<GasData | null>(null);
  const [history, setHistory] = useState<GasData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGas = async () => {
    try {
      const [feeData, blockNumber] = await Promise.all([
        rpcProvider.getFeeData(),
        rpcProvider.getBlockNumber(),
      ]);

      const gasPrice = ethers.formatUnits(feeData.gasPrice || BigInt(0), 'gwei');
      const baseFee = feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : gasPrice;

      const data: GasData = {
        gasPrice,
        baseFee,
        timestamp: Date.now(),
        blockNumber,
      };

      setCurrentGas(data);
      setHistory(prev => [...prev.slice(-59), data]); // Keep last 60 readings
    } catch (err) {
      console.error('[GasTracker] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGas();
    const interval = setInterval(fetchGas, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  const avgGas = history.length > 0 
    ? (history.reduce((s, g) => s + parseFloat(g.gasPrice), 0) / history.length).toFixed(4)
    : '0';

  const maxGas = history.length > 0
    ? Math.max(...history.map(g => parseFloat(g.gasPrice))).toFixed(4)
    : '0';

  const minGas = history.length > 0
    ? Math.min(...history.map(g => parseFloat(g.gasPrice))).toFixed(4)
    : '0';

  const gasBar = history.map(g => parseFloat(g.gasPrice));
  const maxBar = Math.max(...gasBar, 1);

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-4 h-4 text-[#ffb000]" />
            <h1 className="font-mono text-lg font-bold text-[#ffb000] uppercase tracking-wider">gas_tracker</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">ARC_TESTNET</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-green" />
            <span className="font-mono text-[8px] text-[#4a4a4a]">live</span>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="terminal-card p-12 text-center">
          <Flame className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3 animate-pulse" />
          <p className="font-mono text-[10px] text-[#2a2a2a] uppercase">loading_gas_data...</p>
        </div>
      ) : currentGas ? (
        <>
          {/* Current Gas */}
          <div className="terminal-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest">current_gas_price</span>
              <button onClick={fetchGas} className="p-1.5 text-[#2a2a2a] hover:text-[#00ff41] transition-colors">
                <RefreshCcw className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-5xl font-bold text-[#ffb000] glow-amber">{parseFloat(currentGas.gasPrice).toFixed(2)}</span>
              <span className="font-mono text-lg text-[#4a4a4a]">gwei</span>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <span className="font-mono text-[9px] text-[#2a2a2a]">block: #{currentGas.blockNumber}</span>
              <span className="font-mono text-[9px] text-[#2a2a2a]">base_fee: {parseFloat(currentGas.baseFee).toFixed(2)} gwei</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">average</p>
              <p className="font-mono text-lg text-[#e0e0e0]">{avgGas} <span className="text-[10px] text-[#4a4a4a]">gwei</span></p>
            </div>
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">highest</p>
              <p className="font-mono text-lg text-[#ff3333]">{maxGas} <span className="text-[10px] text-[#4a4a4a]">gwei</span></p>
            </div>
            <div className="terminal-card p-4">
              <p className="font-mono text-[8px] text-[#2a2a2a] uppercase mb-1">lowest</p>
              <p className="font-mono text-lg text-[#00ff41]">{minGas} <span className="text-[10px] text-[#4a4a4a]">gwei</span></p>
            </div>
          </div>

          {/* ASCII Chart */}
          <div className="terminal-card p-4">
            <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest block mb-3">gas_history (last {history.length} readings)</span>
            <div className="flex items-end gap-[2px] h-24">
              {gasBar.map((g, i) => {
                const height = (g / maxBar) * 100;
                const isHigh = g > parseFloat(avgGas) * 1.2;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full">
                    <div className={cn(
                      "w-full transition-all",
                      isHigh ? "bg-[#ff3333]" : "bg-[#00ff41]"
                    )} style={{ height: `${height}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-mono text-[7px] text-[#2a2a2a]">oldest</span>
              <span className="font-mono text-[7px] text-[#2a2a2a]">newest</span>
            </div>
          </div>

          {/* ASCII Line Chart */}
          <div className="terminal-card p-4">
            <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest block mb-3">price_wave</span>
            <pre className="font-mono text-[10px] text-[#00ff41] leading-tight overflow-x-auto">
              {generateAsciiWave(gasBar)}
            </pre>
          </div>

          {/* Estimation Table */}
          <div className="terminal-card">
            <div className="p-4 border-b border-[#1a1a1a]">
              <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest">cost_estimation</span>
            </div>
            <table className="w-full terminal-table">
              <thead>
                <tr>
                  <th>operation</th>
                  <th>gas_units</th>
                  <th className="text-right">cost_eth</th>
                  <th className="text-right">cost_usd</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { op: 'ERC-20 Transfer', gas: '65,000' },
                  { op: 'ERC-20 Approve', gas: '46,000' },
                  { op: 'Swap (DEX)', gas: '150,000' },
                  { op: 'Add Liquidity', gas: '200,000' },
                  { op: 'Bridge Out', gas: '300,000' },
                ].map(row => {
                  const gasUnits = parseInt(row.gas.replace(/,/g, ''));
                  const costEth = (gasUnits * parseFloat(currentGas.gasPrice) / 1e9).toFixed(6);
                  const costUsd = (parseFloat(costEth) * 2000).toFixed(4); // Mock ETH price
                  return (
                    <tr key={row.op}>
                      <td><span className="font-mono text-[10px] text-[#e0e0e0]">{row.op}</span></td>
                      <td><span className="font-mono text-[10px] text-[#4a4a4a]">{row.gas}</span></td>
                      <td className="text-right"><span className="font-mono text-[10px] text-[#00ff41]">{costEth}</span></td>
                      <td className="text-right"><span className="font-mono text-[10px] text-[#ffb000]">${costUsd}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}

function generateAsciiWave(data: number[]): string {
  if (data.length < 2) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 6;
  const width = Math.min(data.length, 60);
  const step = Math.floor(data.length / width);
  const sampled = data.filter((_, i) => i % step === 0).slice(0, width);
  
  const lines: string[] = [];
  for (let h = height; h >= 0; h--) {
    const threshold = min + (range * h / height);
    let line = '';
    for (const v of sampled) {
      if (v >= threshold) line += '█';
      else if (v >= threshold - range / height / 2) line += '▄';
      else line += ' ';
    }
    lines.push(line);
  }
  return lines.join('\n');
}
