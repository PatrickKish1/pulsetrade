'use client';

import React from 'react';
import { useAccount } from '@particle-network/connectkit';
import { ParticleConnectkit } from '@/lib/connectkit';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the wallet state interface
interface WalletState {
  isWalletConnected: boolean;
  walletAddress: string;
  setWalletConnected: (connected: boolean) => void;
  setWalletAddress: (address: string) => void;
}

// Create persistent store
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

// Create the persistence provider component
export const WalletPersistenceProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const { isConnected, address } = useAccount();
  const { setWalletConnected, setWalletAddress } = useWalletStore();

  React.useEffect(() => {
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

// Combined provider for both Particle and Persistence
export const CombinedProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ParticleConnectkit>
      <WalletPersistenceProvider>
        {children}
      </WalletPersistenceProvider>
    </ParticleConnectkit>
  );
};