'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { rpcProvider } from '@/lib/utils';
import { Image, ExternalLink, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NFTItem {
  contract: string;
  tokenId: string;
  name: string;
  collection: string;
  image: string;
}

const ERC721_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
  'function name() view returns (string)',
  'function tokenURI(uint256) view returns (string)',
  'function supportsInterface(bytes4) view returns (bool)',
];

const KNOWN_ARC_NFTS = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6e', // Uniswap V2 Factory (sometimes used for LP NFTs)
  '0x9A676e781A523b5d0C0e43731313A708CB607508', // ArcPerps
  '0x1a2c4628212d1BC690B6B32C0C5E8A0C4B5b2d7e', // Common Arc test NFT
];

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);
  const [customContracts, setCustomContracts] = useState<string[]>([]);
  const [newContract, setNewContract] = useState('');
  const [scanStatus, setScanStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('arc-active-node');
    if (saved) setAddress(saved);
    const savedContracts = localStorage.getItem('arc-nft-contracts');
    if (savedContracts) {
      try { const p = JSON.parse(savedContracts); if (Array.isArray(p)) setCustomContracts(p); } catch { /* skip */ }
    }
  }, []);

  const addContract = () => {
    if (!ethers.isAddress(newContract)) return;
    const addr = ethers.getAddress(newContract);
    if (!customContracts.includes(addr)) {
      const next = [...customContracts, addr];
      setCustomContracts(next);
      localStorage.setItem('arc-nft-contracts', JSON.stringify(next));
    }
    setNewContract('');
  };

  const removeContract = (addr: string) => {
    const next = customContracts.filter(c => c !== addr);
    setCustomContracts(next);
    localStorage.setItem('arc-nft-contracts', JSON.stringify(next));
  };

  useEffect(() => {
    if (!address || !ethers.isAddress(address)) { setIsLoading(false); return; }

    async function fetchNFTs() {
      setIsLoading(true);
      setNfts([]);
      const allContracts = [...KNOWN_ARC_NFTS, ...customContracts];
      const foundNFTs: NFTItem[] = [];

      for (const contractAddr of allContracts) {
        try {
          setScanStatus(`scanning ${contractAddr.slice(0, 8)}...`);
          const contract = new ethers.Contract(contractAddr, ERC721_ABI, rpcProvider);

          // Check if it's ERC-721
          let isERC721 = false;
          try {
            isERC721 = await contract.supportsInterface('0x80ac58cd');
          } catch {
            // If supportsInterface fails, try balanceOf
            try {
              const bal = await contract.balanceOf(address);
              isERC721 = bal > BigInt(0);
            } catch { /* not ERC-721 */ }
          }

          if (!isERC721) continue;

          const bal = await contract.balanceOf(address);
          if (bal === BigInt(0)) continue;

          let collectionName = 'Unknown';
          try { collectionName = await contract.name(); } catch { /* skip */ }

          const count = Number(bal);
          for (let i = 0; i < Math.min(count, 20); i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(address, i);
              let tokenURI = '';
              try { tokenURI = await contract.tokenURI(tokenId); } catch { /* skip */ }
              
              let image = '';
              let name = `${collectionName} #${tokenId}`;
              
              // Try to fetch metadata if URI is HTTP
              if (tokenURI && tokenURI.startsWith('http')) {
                try {
                  const res = await fetch(tokenURI);
                  const metadata = await res.json();
                  if (metadata.name) name = metadata.name;
                  if (metadata.image) image = metadata.image;
                } catch { /* skip */ }
              }

              foundNFTs.push({
                contract: contractAddr,
                tokenId: tokenId.toString(),
                name,
                collection: collectionName,
                image,
              });
            } catch { /* skip token */ }
          }
        } catch { /* skip contract */ }
      }

      setNfts(foundNFTs);
      setScanStatus('');
      setIsLoading(false);
    }

    fetchNFTs();
  }, [address, customContracts]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">nft_positions</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">DIGITAL_ASSETS</span>
          </div>
        </div>
      </header>

      {/* Add NFT Contract */}
      <div className="terminal-card p-4">
        <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest block mb-3">add_nft_contract</span>
        <div className="flex gap-2">
          <input type="text" placeholder="0x... contract_address" value={newContract} onChange={(e) => setNewContract(e.target.value)} maxLength={42}
            className="terminal-input flex-1" />
          <button onClick={addContract} disabled={!ethers.isAddress(newContract)} className="btn-terminal px-4 disabled:opacity-30">+ add</button>
        </div>
        {customContracts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customContracts.map(c => (
              <div key={c} className="flex items-center gap-1.5 px-2 py-1 border border-[#1a1a1a] text-[9px] font-mono text-[#4a4a4a]">
                {c.slice(0, 8)}...{c.slice(-4)}
                <button onClick={() => removeContract(c)} className="text-[#2a2a2a] hover:text-[#ff3333]"><X className="w-2.5 h-2.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="terminal-card p-12 text-center">
          <Loader2 className="w-6 h-6 text-[#00ff41] animate-spin mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#2a2a2a] uppercase">{scanStatus || 'scanning_contracts...'}</p>
        </div>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {nfts.map((nft, i) => (
            <div key={i} className="terminal-card p-4 group hover:border-[#00ff41]/30 transition-colors">
              <div className="aspect-square bg-[#141414] border border-[#1a1a1a] mb-3 flex items-center justify-center overflow-hidden">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-[#2a2a2a] mx-auto" />
                    <p className="font-mono text-[7px] text-[#1a1a1a] mt-1">no_image</p>
                  </div>
                )}
              </div>
              <p className="font-mono text-[10px] text-[#e0e0e0] truncate">{nft.name}</p>
              <p className="font-mono text-[8px] text-[#2a2a2a] mt-0.5">{nft.collection}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[7px] text-[#2a2a2a]">#{nft.tokenId}</span>
                <a href={`https://testnet.arcscan.app/token/${nft.contract}?a=${nft.tokenId}`} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 font-mono text-[8px] text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                  view <ExternalLink className="w-2 h-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="terminal-card p-12 text-center">
          <Image className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#2a2a2a] uppercase">no_nfts_found</p>
          <p className="font-mono text-[8px] text-[#1a1a1a] mt-2">add an ERC-721 contract address above to scan</p>
        </div>
      )}
    </div>
  );
}
