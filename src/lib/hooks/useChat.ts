import { useState, useEffect } from 'react';
import { Chat, ChatMessage } from '../utils';
import { listenToChat, listenToChatMessages } from '../firebase';

export const useChat = (chatId: string) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribeChat = listenToChat(chatId, (chat) => {
      setChat(chat);
      setLoading(false);
    });

    const unsubscribeMessages = listenToChatMessages(chatId, (messages) => {
      setMessages(messages);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [chatId]);

  return {
    chat,
    messages,
    loading,
    error,
  };
};