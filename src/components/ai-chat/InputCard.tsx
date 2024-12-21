import { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useClickOutside from '@/lib/hooks/useClickOutside';

const chatInstructions = [
  "Use (S:SYMBOL) for stock prices",
  "Ask for technical analysis",
  "Request trade suggestions",
  "Compare multiple assets"
];

export interface AIInputCardProps {
  onSendMessage: (message: string) => Promise<void>;
  onMessageSent?: () => void;
  disabled?: boolean;
}

export const AIInputCard = ({
  onSendMessage,
  onMessageSent,
  disabled = false
}: AIInputCardProps) => {
  const [message, setMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const instructionsRef = useClickOutside(() => setShowInstructions(false));

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    try {
      await onSendMessage(message.trim());
      setMessage('');
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Card className="relative mt-4">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 resize-none overflow-hidden focus:outline-none min-h-[44px] max-h-[200px]"
              disabled={disabled}
              style={{ maxWidth: 'calc(100% - 96px)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex space-x-2 items-start">
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
                
                {showInstructions && (
                  <div
                    ref={instructionsRef}
                    className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg p-4"
                  >
                    <div className="relative">
                      <div className="absolute -bottom-6 right-4 w-4 h-4 bg-white transform rotate-45" />
                      <div className="relative z-10 bg-white">
                        <h4 className="font-semibold mb-2">How to interact:</h4>
                        <ul className="text-sm space-y-2">
                          {chatInstructions.map((instruction, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={!message.trim() || disabled}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};