"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { createEthereumTradingService } from '@/lib/services/ethereum-trading';
import { createStarkNetTradingService } from '@/lib/services/starknet-trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';

interface TradeExecutionFormProps {
  subAccountAddress?: string;
}

export default function TradeExecutionForm({ subAccountAddress }: TradeExecutionFormProps) {
  const { address, isConnected } = useParticleAuth();
  const [amount, setAmount] = useState<string>('');
  const [positionSize, setPositionSize] = useState<string>('');
  const [riskPercentage, setRiskPercentage] = useState<string>('1');
  const [orderType, setOrderType] = useState<string>('market');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate position size based on risk percentage
  const calculatePositionSize = (addressSize: string, risk: string) => {
    if (!addressSize || !risk) return;
    const size = (parseFloat(addressSize) * (parseFloat(risk) / 100)).toString();
    setPositionSize(size);
  };

  const executeTrade = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Ethereum trading service
      const ethService = createEthereumTradingService(process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!);
      await ethService.initializeContract(window.ethereum);

      // Execute trade on Ethereum
      await ethService.executeTrade({
        subAccountAddress: subAccountAddress || address,
        amount: ethers.parseEther(amount)
      });

      // Initialize StarkNet service for additional verification if needed
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );
      await starkNetService.initializeContract(address);

      // Verify trust agreement if trading through admin
      if (subAccountAddress) {
        const isVerified = await starkNetService.verifyTrustAgreement(
          address,
          subAccountAddress
        );
        if (!isVerified) {
          throw new Error('Trust agreement verification failed');
        }
      }

      toast.success('Trade executed successfully');
    } catch (error) {
      console.error('Trade execution failed:', error);
      toast.error('Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Execute Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trade Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                calculatePositionSize(e.target.value, riskPercentage);
              }}
            />
          </div>

          {/* Risk Parameters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Percentage</label>
            <Select 
              value={riskPercentage}
              onValueChange={(value) => {
                setRiskPercentage(value);
                calculatePositionSize(amount, value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk %" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5%</SelectItem>
                <SelectItem value="1">1%</SelectItem>
                <SelectItem value="2">2%</SelectItem>
                <SelectItem value="3">3%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position Size Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Position Size</label>
            <Input
              type="text"
              value={positionSize}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Order Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Order Type</label>
            <Select 
              value={orderType}
              onValueChange={setOrderType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop">Stop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Execute Button */}
          <Button
            className="w-full"
            onClick={executeTrade}
            disabled={isLoading || !amount || !orderType}
          >
            {isLoading ? 'Executing...' : 'Execute Trade'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}