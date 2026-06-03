'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ARC_NETWORK } from '../lib/constants';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'metamask' | 'rabby' | null>(null);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Detect Rabby or MetaMask
    const provider = (window as any).ethereum;
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
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== ARC_NETWORK.chainId) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${ARC_NETWORK.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
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
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = () => {
    setAddress(null);
    setWalletType(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setAddress(accounts[0] || null);
      });
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return { address, connect, disconnect, isConnecting, error, walletType };
}
