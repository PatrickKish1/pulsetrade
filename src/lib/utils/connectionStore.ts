'use client';
import React, { useEffect } from 'react';
import { useAccount } from '@particle-network/connectkit';
import { useWalletStore } from '../utils/connectionStore';
export const WalletPersistenceProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const { isConnected, address } = useAccount();
  const { setWalletConnected, setWalletAddress } = useWalletStore();
  useEffect(() => {
    // Sync Particle Network connection state with Zustand store
    setWalletConnected(isConnected);
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      setWalletAddress('');
    }
  }, [isConnected, address, setWalletConnected, setWalletAddress]);
  return <>{children}</>;
};
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface WalletState {
  isWalletConnected: boolean;
  walletAddress: string;
  setWalletConnected: (connected: boolean) => void;
  setWalletAddress: (address: string) => void;
}
export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isWalletConnected: false,
      walletAddress: '',
      setWalletConnected: (connected) => set({ isWalletConnected: connected }),
      setWalletAddress: (address) => set({ walletAddress: address }),
    }),
    {
      name: 'wallet-storage',
    }
  )
);