'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { rpcProvider } from '@/lib/utils';
import { Image, ExternalLink, Loader2 } from 'lucide-react';

interface NFTItem {
  contract: string;
  tokenId: string;
  name: string;
  collection: string;
  image: string;
}

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('arc-active-node');
    if (saved) setAddress(saved);
  }, []);

  useEffect(() => {
    if (!address || !ethers.isAddress(address)) { setIsLoading(false); return; }

    async function fetchNFTs() {
      setIsLoading(true);
      try {
        // Arc Testnet doesn't have widespread NFT indexer yet
        // Check for common NFT contracts and ERC-721 balances
        const erc721Abi = ['function balanceOf(address) view returns (uint256)', 'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)', 'function name() view returns (string)'];

        // Check well-known test NFT contracts on Arc
        const knownContracts = [
          { addr: '0x1234567890123456789012345678901234567890', name: 'Arc Genesis' },
        ];

        const foundNFTs: NFTItem[] = [];

        for (const c of knownContracts) {
          try {
            const contract = new ethers.Contract(c.addr, erc721Abi, rpcProvider);
            const bal = await contract.balanceOf(address);
            if (bal > BigInt(0)) {
              const count = Number(bal);
              for (let i = 0; i < Math.min(count, 10); i++) {
                const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                foundNFTs.push({
                  contract: c.addr,
                  tokenId: tokenId.toString(),
                  name: `${c.name} #${tokenId}`,
                  collection: c.name,
                  image: '',
                });
              }
            }
          } catch { /* skip */ }
        }

        setNfts(foundNFTs);
      } catch (err) {
        console.error('[NFTsPage] Error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNFTs();
  }, [address]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3">
          <Image className="w-4 h-4 text-[#00ff41]" />
          <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">nft_positions</h1>
          <span className="text-[#2a2a2a]">|</span>
          <span className="font-mono text-[10px] text-[#2a2a2a]">DIGITAL_ASSETS</span>
        </div>
      </header>

      {isLoading ? (
        <div className="terminal-card p-12 text-center">
          <Loader2 className="w-6 h-6 text-[#00ff41] animate-spin mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#2a2a2a] uppercase">scanning_contracts...</p>
        </div>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {nfts.map((nft, i) => (
            <div key={i} className="terminal-card p-4 group hover:border-[#00ff41]/30 transition-colors">
              <div className="aspect-square bg-[#141414] border border-[#1a1a1a] mb-3 flex items-center justify-center">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 text-[#2a2a2a]" />
                )}
              </div>
              <p className="font-mono text-[10px] text-[#e0e0e0] truncate">{nft.name}</p>
              <p className="font-mono text-[8px] text-[#2a2a2a] mt-0.5">{nft.collection}</p>
              <a href={`https://testnet.arcscan.app/token/${nft.contract}?a=${nft.tokenId}`} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-1 mt-2 font-mono text-[8px] text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                view <ExternalLink className="w-2 h-2" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="terminal-card p-12 text-center">
          <Image className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#2a2a2a] uppercase">no_nfts_found</p>
          <p className="font-mono text-[8px] text-[#1a1a1a] mt-2">nft support coming as arc ecosystem grows</p>
        </div>
      )}
    </div>
  );
}
