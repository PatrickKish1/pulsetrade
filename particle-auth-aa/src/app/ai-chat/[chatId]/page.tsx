'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { AIInputCard, AIInputCardProps } from '@/components/ai-chat/InputCard';
import { MessageList } from '@/components/ai-chat/MessageList';
import { TradeValuesCard } from '@/components/ai-chat/TradeValues';
import { AIWelcome, AIWelcomeProps } from '@/components/ai-chat/Welcome';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import Image from 'next/image';
import { AIMessage, AIChat, TradeValues, AIResponse } from '@/lib/utils';
import { db } from '../../../../firebase.config';

export default function ChatPage({ onClose, onSendMessage }: AIWelcomeProps) {
  const params = useParams();
  const chatId = params?.chatId as string;
  const router = useRouter();
  const { address, isConnected } = useParticleAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [chat, setChat] = useState<AIChat | null>(null);
  const [sending, setSending] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [tradeValues, setTradeValues] = useState<TradeValues | null>(null);
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      router.push('/ai-chats');
      return;
    }

    if (!chatId || !db) {
      return;
    }

    // Set up chat and message listeners
    try {
      const unsubscribeChat = onSnapshot(
        doc(db, 'ai_chats', chatId),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setChat({
              id: docSnapshot.id,
              ...(docSnapshot.data() as Omit<AIChat, 'id'>)
            });
          } else {
            router.push('/ai-chats');
          }
        }
      );

      const messagesRef = collection(db, 'ai_chat_messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const messageList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<AIMessage, 'id'>)
        }));
        setMessages(messageList);
        setMessagesLoaded(true);
        
        // Update welcome message visibility based on messages
        if (messageList.length > 0) {
          setShowWelcome(false);
        }
      });

      return () => {
        unsubscribeChat();
        unsubscribeMessages();
      };
    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      router.push('/ai-chats');
    }
  }, [chatId, address, isConnected, router]);

  const handleSendMessage = async (message: string) => {
    setSending(true);
    try {
      const tradingTerms = ['take profit', 'stop loss', 'lot size', 'trade signal', 'signal'];
      const hasTradingTerms = tradingTerms.some(term => 
        message.toLowerCase().includes(term)
      );

      let updatedMessage = message;
      if (hasTradingTerms) {
        updatedMessage += " please in your response can you indicate the values for the take profit, stop loss and lot size respectively";
      }

      const response = await fetch('https://tradellm.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: updatedMessage,
          threadId: chat?.threadId 
        }),
      });

      const data: AIResponse = await response.json();
      
      if (hasTradingTerms) {
        const tpMatch = data.response.kwargs.content.match(/Take Profit: \$?([\d.]+)/);
        const slMatch = data.response.kwargs.content.match(/Stop Loss: \$?([\d.]+)/);
        const lotMatch = data.response.kwargs.content.match(/Lot Size: ([\d.]+)/);

        if (tpMatch && slMatch && lotMatch) {
          const newTradeValues: TradeValues = {
            takeProfit: tpMatch[1],
            stopLoss: slMatch[1],
            lotSize: lotMatch[1]
          };
          setTradeValues(newTradeValues);
        }
      }

      // Hide welcome message after first message is sent
      if (showWelcome) {
        setShowWelcome(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the AI chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/ai-chats')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">AI Chat</h1>
          </div>

          {/* Main Chat Area */}
          <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-16rem)]">
            {!messagesLoaded ? (
              <div className="flex justify-center items-center h-64">
                <Image
                  src="/logo.png"
                  alt="Loading"
                  width={48}
                  height={48}
                  className="animate-pulse"
                />
              </div>
            ) : messages.length === 0 && showWelcome ? (
              <AIWelcome onSendMessage={onSendMessage} onClose={function (): void {
                  throw new Error('Function not implemented.');
                } } />
            ) : (
              <>
                <MessageList 
                  messages={messages}
                  loading={sending}
                />
                {tradeValues && (
                  <TradeValuesCard
                    values={tradeValues}
                    onUpdate={(values: TradeValues) => setTradeValues(values)}
                  />
                )}
                <AIInputCard
                  onSendMessage={handleSendMessage}
                  disabled={sending}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}