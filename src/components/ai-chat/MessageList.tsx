import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: number;
}

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export const MessageList = ({ messages, loading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isAi ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-[80%] lg:max-w-[70%] rounded-lg p-4 ${
              message.isAi ? 'bg-white border' : 'bg-blue-500 text-white'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Loading"
            width={32}
            height={32}
            className="animate-pulse"
          />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};