import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { AIInputCard } from './InputCard';

const chatInstructions = [
  "Ask about market analysis and trading insights",
  "Get real-time price information using (S:SYMBOL) format",
  "Analyze multiple assets by comparing different symbols",
  "Request technical analysis with specific indicators",
  "Get trade suggestions with stop loss and take profit levels"
];

export interface AIWelcomeProps {
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
}

export const AIWelcome = ({ onClose, onSendMessage }: AIWelcomeProps) => {
  const [showInput, setShowInput] = useState(false);

  const handleStartChat = () => {
    setShowInput(true);
    onClose();
  };

  return (
    <div className="flex flex-col items-center text-center p-6 animate-fadeIn">
      <div className="relative w-60 h-60 mb-6">
        <Image
          src="/trading.png"
          alt="AI Assistant"
          fill
          className="rounded-full object-cover"
        />
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Welcome to TradeLLM Assistant</h2>
      <p className="text-gray-600 mb-6">
        I'm here to help you with market analysis and trading insights.
      </p>
      
      <Card className="w-full max-w-md mb-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">How to interact with me:</h3>
          <ul className="space-y-2 text-left">
            {chatInstructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {!showInput ? (
        <Button 
          onClick={handleStartChat}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Start Chat
        </Button>
      ) : (
        <div className="w-full max-w-4xl">
          <AIInputCard
            onSendMessage={onSendMessage}
            onMessageSent={onClose}
          />
        </div>
      )}
    </div>
  );
};