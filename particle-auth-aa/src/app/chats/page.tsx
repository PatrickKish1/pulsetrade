'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Chat } from '@/lib/utils';
import { ChatList } from '@/components/chats/ChatList';
import { CreateChat } from '@/components/chats/CreateChat';
import { Button } from '@/components/ui/button';
import { db } from '../../../firebase.config';
import Header from '@/components/Header';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

export default function ChatsPage() {
  const router = useRouter();
  const { address, isConnected } = useParticleAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showError, setShowError] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      const chatsRef = collection(db, 'chats');
      
      // Create a query that looks for chats where the current user's address
      // is in the participantAddresses array (case-insensitive)
      const q = query(
        chatsRef,
        where('participantAddresses', 'array-contains', address.toLowerCase())
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const chatList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Chat));

          // Sort chats: unread messages first, then by latest message/creation time
          const sortedChats = chatList.sort((a, b) => {
            const aUnread = a.unreadCount[address.toLowerCase()] || 0;
            const bUnread = b.unreadCount[address.toLowerCase()] || 0;

            // First sort by unread count
            if (aUnread !== bUnread) {
              return bUnread - aUnread;
            }

            // Then sort by last message or creation time
            const aTime = a.lastMessage?.timestamp || a.createdAt;
            const bTime = b.lastMessage?.timestamp || b.createdAt;
            return bTime - aTime;
          });

          setChats(sortedChats);
          setLoading(false);
          setError(null);

          // Check for unread messages and trigger notification
          const totalUnread = sortedChats.reduce((sum, chat) => 
            sum + (chat.unreadCount[address.toLowerCase()] || 0), 0
          );

          if (totalUnread > 0) {
            // Update page title with unread count
            document.title = `(${totalUnread}) Messages`;
            
            // Show notification if supported and permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              const latestUnreadChat = sortedChats.find(chat => 
                (chat.unreadCount[address.toLowerCase()] || 0) > 0
              );
              if (latestUnreadChat?.lastMessage) {
                new Notification('New Message', {
                  body: latestUnreadChat.lastMessage.content,
                  icon: '/notification-icon.png' // Add your icon path
                });
              }
            }
          } else {
            document.title = 'Messages';
          }
        },
        (err) => {
          console.error("Error fetching chats:", err);
          setError("Failed to load chats. Please try again.");
          setLoading(false);
          setShowError(true);
        }
      );

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        unsubscribe();
        document.title = 'Messages'; // Reset title on cleanup
      };
    } catch (err) {
      console.error("Error setting up chat listener:", err);
      setError("Failed to initialize chat system. Please try again.");
      setLoading(false);
      setShowError(true);
    }
  }, [address]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleChatSelect = useCallback((chat: Chat) => {
    router.push(`/chat/${chat.id}`);
  }, [router]);

  const handleChatCreated = useCallback((chatId: string) => {
    setShowCreateChat(false);
    setShowGroupChat(false);
    router.push(`/chat/${chatId}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setShowError(false);
    fetchChats();
  }, [fetchChats]);

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">Please connect your wallet to view and manage your chats</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Messages
            {loading && <span className="ml-2 text-sm text-gray-500">(Updating...)</span>}
          </h1>
          <div className="flex space-x-4">
            <Button
              onClick={() => {
                setShowCreateChat(true);
                setShowGroupChat(false);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Start New Chat
            </Button>
            <Button
              onClick={() => {
                setShowCreateChat(true);
                setShowGroupChat(true);
              }}
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Create Group
            </Button>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your conversations...</p>
            </div>
          ) : chats.length > 0 ? (
            <ChatList
              chats={chats}
              onChatSelect={handleChatSelect}
              currentUserAddress={address}
              recipientAddress={address}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 text-lg mb-6">No conversations yet</p>
              <Button
                onClick={() => setShowCreateChat(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Start Your First Chat
              </Button>
            </div>
          )}
        </div>

        {showCreateChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <CreateChat
                onSuccess={handleChatCreated}
                onCancel={() => setShowCreateChat(false)}
                initialGroupChat={showGroupChat}
              />
            </div>
          </div>
        )}

        <AlertDialog open={showError} onOpenChange={setShowError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
                <div className="mt-4">
                  <Button onClick={handleRetry} className="mr-2">
                    Retry
                  </Button>
                  <Button variant="outline" onClick={() => setShowError(false)}>
                    Dismiss
                  </Button>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
