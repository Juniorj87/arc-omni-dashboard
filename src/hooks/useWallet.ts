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
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'metamask' | 'rabby' | null>(null);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Detect Rabby or MetaMask
    const provider = (window as unknown as { ethereum: EthereumProvider }).ethereum;
    if (!provider) {
      setError('No Ethereum wallet found. Please install MetaMask or Rabby.');
      return;
    }

    if (provider.isRabby) {
      setWalletType('rabby');
    } else if (provider.isMetaMask) {
      setWalletType('metamask');
    }

    setIsConnecting(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      setAddress(accounts[0]);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to connect wallet');
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

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
        setAddress(accs[0] || null);
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

  return { address, connect, disconnect, isConnecting, error, walletType };
}
