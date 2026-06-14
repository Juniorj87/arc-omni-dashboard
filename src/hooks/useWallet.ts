'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ARC_NETWORK } from '../lib/constants';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isRabby?: boolean;
  providers?: EthereumProvider[];
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'metamask' | 'rabby' | null>(null);
  const [showModal, setShowModal] = useState(false);

  const connectWithProvider = useCallback(async (provider: EthereumProvider, type: 'metamask' | 'rabby') => {
    setWalletType(type);
    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(provider as any);
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== ARC_NETWORK.chainId) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${ARC_NETWORK.chainId.toString(16)}` }],
          });
        } catch (switchError: unknown) {
          const sError = switchError as { code: number; message: string };
          if (sError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${ARC_NETWORK.chainId.toString(16)}`,
                  chainName: ARC_NETWORK.name,
                  nativeCurrency: {
                    name: ARC_NETWORK.currency,
                    symbol: ARC_NETWORK.currency,
                    decimals: 18,
                  },
                  rpcUrls: [ARC_NETWORK.rpcUrl],
                  blockExplorerUrls: [ARC_NETWORK.explorer],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      setAddress(accounts[0].toLowerCase());
      setShowModal(false);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to connect wallet');
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const ethereum = (window as unknown as { ethereum: EthereumProvider }).ethereum;
    if (!ethereum) {
      setError('No Ethereum wallet found. Please install MetaMask or Rabby.');
      return;
    }

    // Multiple providers — show modal
    if (ethereum.providers && ethereum.providers.length > 1) {
      setShowModal(true);
      return;
    }

    // Single wallet detected — connect directly
    if (ethereum.isRabby) {
      connectWithProvider(ethereum, 'rabby');
    } else if (ethereum.isMetaMask) {
      connectWithProvider(ethereum, 'metamask');
    } else {
      setShowModal(true);
    }
  }, [connectWithProvider]);

  const connectWallet = useCallback((type: 'metamask' | 'rabby') => {
    if (typeof window === 'undefined') return;

    const ethereum = (window as unknown as { ethereum: EthereumProvider }).ethereum;
    if (!ethereum) {
      setError('No Ethereum wallet found. Please install MetaMask or Rabby.');
      return;
    }

    if (ethereum.providers && ethereum.providers.length > 0) {
      const targetProvider = ethereum.providers.find(
        (p) => type === 'rabby' ? p.isRabby : p.isMetaMask
      );
      if (targetProvider) {
        connectWithProvider(targetProvider, type);
        return;
      }
    }

    if (type === 'rabby' && ethereum.isRabby) {
      connectWithProvider(ethereum, 'rabby');
    } else if (type === 'metamask' && ethereum.isMetaMask) {
      connectWithProvider(ethereum, 'metamask');
    } else {
      connectWithProvider(ethereum, type);
    }
  }, [connectWithProvider]);

  const disconnect = () => {
    setAddress(null);
    setWalletType(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const provider = (window as unknown as { ethereum: EthereumProvider }).ethereum;
    if (provider) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accs = accounts as string[];
        setAddress(accs[0]?.toLowerCase() || null);
      };
      const handleChainChanged = () => {
        window.location.reload();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return { address, connect, connectWallet, disconnect, isConnecting, error, walletType, showModal, setShowModal };
}
