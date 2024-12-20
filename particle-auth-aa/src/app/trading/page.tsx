// app/(routes)/trading/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createEthereumTradingService } from '@/lib/services/ethereum-trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, TrendingUp, History, DollarSign } from 'lucide-react';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import Header from '@/components/Header';

interface DashboardStats {
  totalBalance: number;
  openPositions: number;
  totalProfitLoss: number;
  winRate: number;
}

export default function TradingDashboard() {
  const { address, isConnected } = useParticleAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    openPositions: 0,
    totalProfitLoss: 0,
    winRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    try {
      const ethService = createEthereumTradingService(
        process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!
      );
      
      // Load address details and stats
      // This would be replaced with actual contract data
      setStats({
        totalBalance: 50000,
        openPositions: 3,
        totalProfitLoss: 1500,
        winRate: 65
      });

      setRecentTrades([
        { id: 1, type: 'Long', asset: 'BTC/USD', amount: 1000, profit: 150, timestamp: Date.now() },
        { id: 2, type: 'Short', asset: 'ETH/USD', amount: 500, profit: -50, timestamp: Date.now() - 3600000 }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Please connect your wallet to view your trading dashboard.</p>
          </CardContent>
        </Card>
      </div>
      </div>
      
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trading Dashboard</h1>
        <Link href="/trading/execute">
          <Button>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            New Trade
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold">${stats.totalBalance.toLocaleString()}</p>
              </div>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Open Positions</p>
                <p className="text-2xl font-bold">{stats.openPositions}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total P/L</p>
                <p className={`text-2xl font-bold ${
                  stats.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${stats.totalProfitLoss.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate}%</p>
              </div>
              <History className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Trades</CardTitle>
            <Link href="/trading/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrades.map(trade => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{trade.asset}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(trade.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={`font-medium ${
                    trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${trade.profit.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${trade.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}