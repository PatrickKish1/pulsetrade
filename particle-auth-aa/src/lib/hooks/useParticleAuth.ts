'use client';

import { useAccount } from '@particle-network/connectkit';
import type { Connector } from '@particle-network/connector-core';
import { type Chain } from 'viem';

interface ParticleAuthUserInfo {
  address: string;
  email?: string;
  wallets: string[];
  socialInfo?: any;
}

interface ParticleAuthResponse {
  email?: string;
  wallets?: string[];
  social?: any;
}

interface ParticleConnector extends Connector {
  request: <T = any>(args: { method: string; params?: any[] }) => Promise<T>;
}

interface ParticleAuthHookReturn {
  getUserInfo: () => Promise<ParticleAuthUserInfo | null>;
  isConnected: boolean;
  address: string | undefined;
  chainId: number | undefined;
  chain: Chain | undefined;
  connector: ParticleConnector | undefined;
  status: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
}

export const useParticleAuth = (): ParticleAuthHookReturn => {
  const { 
    address, 
    chainId, 
    connector, 
    isConnected,
    chain,
    status
  } = useAccount();

  const getUserInfo = async (): Promise<ParticleAuthUserInfo | null> => {
    if (!isConnected || !address || !connector) return null;
    
    try {
      // Cast connector to ParticleConnector to access typed request method
      const particleConnector = connector as ParticleConnector;
      
      // Get user info from the connector with proper typing
      const userInfo = await particleConnector.request<ParticleAuthResponse>({
        method: 'particle_auth',
        params: []
      });
      
      return {
        address: address,
        email: userInfo?.email,
        wallets: userInfo?.wallets || [address],
        socialInfo: userInfo?.social
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      // If particle_auth fails, return basic wallet info
      return {
        address: address,
        wallets: [address]
      };
    }
  };

  return {
    getUserInfo,
    isConnected,
    address,
    chainId,
    chain,
    connector: connector as ParticleConnector,
    status
  };
};