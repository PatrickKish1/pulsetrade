import { ChatMessage } from '@/lib/utils';
import React from 'react';
import MaxWidthWrapper from '../MaxWidthWrapper';


interface MessageListProps {
  messages: ChatMessage[];
  currentUserAddress: string;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserAddress 
}) => {
  const messageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <MaxWidthWrapper>
      <div 
      ref={messageRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.senderId === currentUserAddress ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.senderId === currentUserAddress
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            <p className="break-words">{message.content}</p>
            <span className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
    </MaxWidthWrapper>
    
  );
};