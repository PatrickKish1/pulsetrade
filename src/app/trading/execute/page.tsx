// app/(routes)/trading/execute/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TradeExecutionForm from '@/components/trading/tradeExecutionForm';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import Header from '@/components/Header';

interface PriceFeed {
  symbol: string;
  price: number;
  change24h: number;
}

export default function TradingExecutionPage() {
  const { isConnected } = useParticleAuth();
  const [priceFeeds, setPriceFeeds] = useState<PriceFeed[]>([
    { symbol: 'BTC/USD', price: 45000, change24h: 2.5 },
    { symbol: 'ETH/USD', price: 2500, change24h: -1.2 }
  ]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
        <Header />
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Please connect your wallet to execute trades.
          </AlertDescription>
        </Alert>
      </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Execute Trade</h1>

      {/* Price Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceFeeds.map(feed => (
          <Card key={feed.symbol}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{feed.symbol}</p>
                  <p className="text-2xl font-bold">
                    ${feed.price.toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  feed.change24h >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feed.change24h >= 0 ? '+' : ''}{feed.change24h}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trade Execution Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradeExecutionForm />
        
        {/* Risk Management Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Account Balance</p>
                <p className="text-xl font-bold">$50,000</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Max Position Size</p>
                <p className="text-xl font-bold">$5,000</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Risk per Trade</p>
                <p className="text-xl font-bold">1%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}