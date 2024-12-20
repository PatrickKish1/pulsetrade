import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import MaxWidthWrapper from '../MaxWidthWrapper';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isProcessing: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isProcessing
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <MaxWidthWrapper>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-4 mb-8 mt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
            disabled={isProcessing}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || isProcessing}
            className="bg-blue-500 text-white px-6"
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </MaxWidthWrapper>
    
  );
};
