import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TradeValues {
  takeProfit: string;
  stopLoss: string;
  lotSize: string;
}

interface TradeValuesCardProps {
  values: TradeValues;
  onUpdate: (values: TradeValues) => void;
}

export const TradeValuesCard = ({ values, onUpdate }: TradeValuesCardProps) => {
  const router = useRouter();
  const [localValues, setLocalValues] = useState(values);
  
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const handleChange = (field: keyof TradeValues, value: string) => {
    const updated = { ...localValues, [field]: value };
    setLocalValues(updated);
    onUpdate(updated);
  };

  const handleExecute = () => {
    // Show success notification
    alert('Trade executed successfully');
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Take Profit</label>
            <input
              type="text"
              value={localValues.takeProfit}
              onChange={(e) => handleChange('takeProfit', e.target.value)}
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Stop Loss</label>
            <input
              type="text"
              value={localValues.stopLoss}
              onChange={(e) => handleChange('stopLoss', e.target.value)}
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Lot Size</label>
            <input
              type="text"
              value={localValues.lotSize}
              onChange={(e) => handleChange('lotSize', e.target.value)}
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-4 mt-2">
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={handleExecute}
            >
              Execute
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/chart')}
            >
              Go to Chart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};