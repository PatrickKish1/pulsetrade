import { Chat } from '@/lib/utils';
import React from 'react';

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chat: Chat) => void;
  currentUserAddress: string;
  recipientAddress: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatSelect,
  currentUserAddress,
  recipientAddress,
}) => {
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

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group' && chat.name) {
      return `${chat.name} (${chat.participants.length})`;
    }
    
    const otherParticipant = chat.participants.find(
      (p) => p.address.toLowerCase() !== currentUserAddress.toLowerCase()
    );

    if (!otherParticipant) {
      return 'Unknown User';
    }

    return `${otherParticipant.address.slice(0, 6)}...${otherParticipant.address.slice(-4)}`;
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.lastMessage) return 'No messages yet';

    const sender = chat.participants.find(p => 
      p.address.toLowerCase() === chat.lastMessage?.senderId.toLowerCase()
    );

    const receiver = chat.participants.find(p => 
      p.address.toLowerCase() === chat.lastMessage?.senderId.toLowerCase()
    );
    
    const isCurrentUser = sender?.address.toLowerCase() === currentUserAddress.toLowerCase();
    const isRecipient = receiver?.address.toLowerCase() === recipientAddress.toLowerCase();
    const senderLabel = isCurrentUser ? 'You' : 
      `${sender?.address.slice(0, 6)}...${sender?.address.slice(-4)}`;

    const receiverLabel = isRecipient ? `${receiver?.address.slice(0, 6)}...${receiver?.address.slice(-4)}` : 
      `${sender?.address.slice(0, 6)}...${sender?.address.slice(-4)}`;

    if (!isCurrentUser) {
      return `${receiverLabel}: ${chat.lastMessage.content}`;
    }
    else {
      return `${senderLabel}: ${chat.lastMessage.content}`;
    }
  };

  const getUnreadCount = (chat: Chat): number => {
    return chat.unreadCount[currentUserAddress.toLowerCase()] || 0;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onChatSelect(chat)}
          className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
        >
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-semibold truncate">
                {getChatName(chat)}
              </h3>
              {chat.lastMessage && (
                <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                  {formatTime(chat.lastMessage.timestamp)}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm truncate">
              {getLastMessagePreview(chat)}
            </p>
          </div>
          {getUnreadCount(chat) > 0 && (
            <div className="ml-4 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
              {getUnreadCount(chat)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
