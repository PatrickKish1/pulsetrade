'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Image from 'next/image';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { AIChat } from '@/lib/utils';
import AIChatter from '@/components/ai-chat/AIChat';
import { db } from '../../../firebase.config';

export default function AIChatsPage() {
  const router = useRouter();
  const { address, isConnected } = useParticleAuth();
  const [chats, setChats] = useState<AIChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'ai_chats');
    const q = query(
      chatsRef,
      where('userId', '==', address.toLowerCase()),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<AIChat, 'id'>)
      }));
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [address, isConnected]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access your AI chats</p>
        </div>
      </div>
    );
  }

  if (showNewChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AIChatter 
          onChatCreated={(chatId) => {
            setShowNewChat(false);
            router.push(`/ai-chat/${chatId}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">AI Chats</h1>
            <Button
              onClick={() => setShowNewChat(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Image
                  src="/logo.png"
                  alt="Loading"
                  width={48}
                  height={48}
                  className="animate-pulse"
                />
              </div>
            ) : chats.length > 0 ? (
              chats.map((chat) => (
                <Card
                  key={chat.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/ai-chat/${chat.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {chat.title || 'New Chat'}
                        </h3>
                        {chat.lastMessage && (
                          <p className="text-gray-600 text-sm truncate">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessage 
                          ? formatTime(chat.lastMessage.timestamp)
                          : formatTime(chat.createdAt)
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-6">Start a new chat to get AI trading insights</p>
                <Button
                  onClick={() => setShowNewChat(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Start Your First Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}