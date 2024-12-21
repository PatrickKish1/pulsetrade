import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface User {
  address: string;
  email?: string;
  protectedDataAddress?: string;
  isWeb3MailEnabled: boolean;
  createdAt: number;
  lastSeen: number;
  socialInfo?: any;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  isWeb3Mail: boolean;
  protectedDataAddress?: string;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: {
    id: string;
    content: string;
    timestamp: number;
    senderId: string;
    recipientId: string;
  };
  unreadCount: Record<string, number>; // Maps user address to their unread count
  createdAt: number;
  updatedAt: number;
  type: 'individual' | 'group';
  name?: string; // For group chats
}


export interface AIMessage {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: number;
  chatId: string;
}

export interface AIChat {
  id: string;
  userId: string;
  threadId: string;
  title: string;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface TradeValues {
  takeProfit: string;
  stopLoss: string;
  lotSize: string;
}

export interface AIResponse {
  response: {
    kwargs: {
      content: string;
    };
  };
  threadId: string;
}

export interface Web3MailConfig {
  workerpoolAddress: string;
  senderName: string;
  contentType: 'text/plain' | 'text/html';
}


// Type guards
export const isAddress = (value: string): value is Address => {
  return value.startsWith('0x') && value.length === 42;
};


export type Address = `0x${string}`;

export type AddressOrEnsName = Address | string;

export const IEXEC_EXPLORER_URL = 'https://explorer.iex.ec/bellecour/dataset/';

export const WEB3MAIL_APP_ENS = 'web3mail.apps.iexec.eth';

const IEXEC_CHAIN_ID = '0x86'; // 134

export const DEFAULT_WEB3MAIL_CONFIG: Web3MailConfig = {
  workerpoolAddress: 'prod-v8-learn.main.pools.iexec.eth',
  senderName: 'Web3 Chat',
  contentType: 'text/plain'
};


export function checkIsConnected() {
  if (!window.ethereum) {
    console.log('Please install MetaMask');
    throw new Error('No Ethereum provider found');
  }
}

export async function checkCurrentChain() {
  const currentChainId = await window.ethereum.request({
    method: 'eth_chainId',
    params: [],
  });
  if (currentChainId !== IEXEC_CHAIN_ID) {
    console.log('Please switch to iExec chain');
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x86',
            chainName: 'iExec Sidechain',
            nativeCurrency: {
              name: 'xRLC',
              symbol: 'xRLC',
              decimals: 18,
            },
            rpcUrls: ['https://bellecour.iex.ec'],
            blockExplorerUrls: ['https://blockscout-bellecour.iex.ec'],
          },
        ],
      });
      console.log('Switched to iExec chain');
    } catch (err) {
      console.error('Failed to switch to iExec chain:', err);
      throw err;
    }
  }
}
