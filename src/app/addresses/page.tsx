'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Book, Plus, X, Trash2, Copy, Check, Search, Tag } from 'lucide-react';
import { cn, truncateAddress } from '@/lib/utils';

interface AddressEntry {
  address: string;
  label: string;
  tags: string[];
  notes: string;
  addedAt: number;
}

const PRESET_LABELS: Record<string, string> = {
  '0x3600000000000000000000000000000000000000': 'Arc USDC',
  '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a': 'Arc EURC',
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': 'Achswap Router',
  '0x60ED395d3F37A8C822f360F6239D21c5651B79e2': 'Achswap Factory',
  '0x9A676e781A523b5d0C0e43731313A708CB607508': 'ArcPerps Engine',
  '0x911b4000D3422F482F4062a913885f7b035382Df': 'Curve AddressProvider',
  '0x74133b5D179a7827e1343a8bF11330603d215634': 'Synthra Router',
  '0x424fF7f4A7CBB654E5168829C8535be3C0ef2e6c': 'Deployer Wallet',
};

const PRESET_TAGS: Record<string, string[]> = {
  '0x3600000000000000000000000000000000000000': ['token', 'stablecoin'],
  '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a': ['token', 'stablecoin'],
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': ['dex', 'router'],
  '0x60ED395d3F37A8C822f360F6239D21c5651B79e2': ['dex', 'factory'],
  '0x9A676e781A523b5d0C0e43731313A708CB607508': ['perps', 'margin'],
  '0x424fF7f4A7CBB654E5168829C8535be3C0ef2e6c': ['wallet', 'deployer'],
};

export default function AddressBookPage() {
  const [entries, setEntries] = useState<AddressEntry[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem('arc-address-book');
    if (saved) {
      try { const p = JSON.parse(saved); if (Array.isArray(p)) setEntries(p); } catch { /* skip */ }
    } else {
      // Seed with known addresses
      const presets: AddressEntry[] = Object.entries(PRESET_LABELS).map(([addr, label]) => ({
        address: addr,
        label,
        tags: PRESET_TAGS[addr] || [],
        notes: '',
        addedAt: Date.now(),
      }));
      setEntries(presets);
      localStorage.setItem('arc-address-book', JSON.stringify(presets));
    }
  }, []);

  const save = (next: AddressEntry[]) => {
    setEntries(next);
    localStorage.setItem('arc-address-book', JSON.stringify(next));
  };

  const addEntry = () => {
    if (!newAddress || !ethers.isAddress(newAddress)) return;
    const entry: AddressEntry = {
      address: ethers.getAddress(newAddress),
      label: newLabel || truncateAddress(newAddress),
      tags: newTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      notes: newNotes,
      addedAt: Date.now(),
    };
    save([...entries, entry]);
    setIsAddOpen(false); setNewAddress(''); setNewLabel(''); setNewTags(''); setNewNotes('');
  };

  const removeEntry = (addr: string) => {
    save(entries.filter(e => e.address !== addr));
  };

  const copyAddress = (addr: string, idx: number) => {
    navigator.clipboard.writeText(addr);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const allTags = [...new Set(entries.flatMap(e => e.tags))].sort();
  const filtered = entries.filter(e => {
    const matchesSearch = !searchQuery || 
      e.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some(t => t.includes(searchQuery.toLowerCase()));
    const matchesTag = filterTag === 'all' || e.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">address_book</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">IDENTITY_REGISTRY</span>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="btn-terminal py-2 px-4 text-[9px]">+ add</button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#2a2a2a]" />
          <input type="text" placeholder="search addresses, labels, tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="terminal-input w-full pl-9" />
        </div>
        <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
          className="terminal-input px-3 min-w-[120px]">
          <option value="all">all_tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Entries */}
      <div className="terminal-card">
        <table className="w-full terminal-table">
          <thead>
            <tr>
              <th>label</th>
              <th>address</th>
              <th>tags</th>
              <th className="text-right">actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.address} className="group hover:bg-[#00ff41]/[0.01] transition-colors">
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border border-[#1a1a1a] flex items-center justify-center font-mono text-[8px] text-[#4a4a4a]">
                      {e.label[0].toUpperCase()}
                    </div>
                    <span className="font-mono text-[11px] text-[#e0e0e0] group-hover:text-[#00ff41] transition-colors">{e.label}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-[#4a4a4a]">{truncateAddress(e.address)}</span>
                    <button onClick={() => copyAddress(e.address, i)} className="p-0.5 text-[#2a2a2a] hover:text-[#00ff41] transition-colors">
                      {copiedIdx === i ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1 flex-wrap">
                    {e.tags.map(t => (
                      <span key={t} className="tag tag-green text-[6px]">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="text-right">
                  <button onClick={() => removeEntry(e.address)} className="p-1.5 text-[#2a2a2a] hover:text-[#ff3333] transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <p className="font-mono text-[10px] text-[#2a2a2a]">no_entries_found</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1a1a1a]">
              <span className="font-mono text-sm text-[#00ff41] uppercase">add_address</span>
              <button onClick={() => setIsAddOpen(false)} className="text-[#4a4a4a] hover:text-[#e0e0e0]"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest block mb-1.5">address</label>
                <input type="text" placeholder="0x..." value={newAddress} onChange={(e) => setNewAddress(e.target.value)} maxLength={42}
                  className="terminal-input w-full" />
              </div>
              <div>
                <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest block mb-1.5">label</label>
                <input type="text" placeholder="my_wallet" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                  className="terminal-input w-full" />
              </div>
              <div>
                <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest block mb-1.5">tags (comma separated)</label>
                <input type="text" placeholder="dex, whale, bridge" value={newTags} onChange={(e) => setNewTags(e.target.value)}
                  className="terminal-input w-full" />
              </div>
              <div>
                <label className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-widest block mb-1.5">notes</label>
                <textarea placeholder="optional notes..." value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                  className="terminal-input w-full h-20 resize-none" />
              </div>
              <button onClick={addEntry} className="btn-terminal w-full py-3">save_entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
