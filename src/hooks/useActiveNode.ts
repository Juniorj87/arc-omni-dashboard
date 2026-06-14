'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { ethers } from 'ethers';

/**
 * useActiveNode Hook
 * 
 * Manages the "Active Node" address being audited across all pages.
 * Defaults to the connected wallet if no address is searched.
 * Persists in localStorage for cross-page consistency.
 */
export function useActiveNode() {
  const { address: connectedAddress } = useWallet();
  const [activeAddress, setActiveAddress] = useState<string | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('arc-active-node');
    if (saved && ethers.isAddress(saved)) {
      setActiveAddress(saved.toLowerCase());
    }
  }, []);

  // Update active address
  const updateActiveNode = useCallback((addr: string | null) => {
    if (addr && ethers.isAddress(addr)) {
      const clean = addr.toLowerCase();
      setActiveAddress(clean);
      localStorage.setItem('arc-active-node', clean);
    } else if (addr === null) {
      setActiveAddress(null);
      localStorage.removeItem('arc-active-node');
    }
  }, []);

  // If nothing is searched, but a wallet is connected, use that as the primary view
  const displayAddress = activeAddress || connectedAddress;

  return { 
    activeAddress: displayAddress, 
    searchedAddress: activeAddress, 
    updateActiveNode,
    isViewingConnected: !!connectedAddress && activeAddress === connectedAddress.toLowerCase()
  };
}
