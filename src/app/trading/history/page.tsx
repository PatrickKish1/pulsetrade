// app/(routes)/trading/history/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { createEthereumTradingService } from '@/lib/services/ethereum-trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FilterIcon, LineChart, TrendingUp, TrendingDown } from 'lucide-react';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import Header from '@/components/Header';

interface Trade {
  id: number;
  type: string;
  asset: string;
  amount: number;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  timestamp: number;
}

interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  largestWin: number;
  largestLoss: number;
  averageTrade: number;
  winRate: number;
}

export default function TradeHistoryPage() {
  const { address, isConnected } = useParticleAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    largestWin: 0,
    largestLoss: 0,
    averageTrade: 0,
    winRate: 0
  });
  const [timeFilter, setTimeFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadTradeHistory();
    }
  }, [isConnected, address, timeFilter, assetFilter]);

  const loadTradeHistory = async () => {
    try {
      const ethService = createEthereumTradingService(
        process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!
      );

      // Mock trade data - replace with actual API calls
      const mockTrades: Trade[] = [
        {
          id: 1,
          type: 'Long',
          asset: 'BTC/USD',
          amount: 1000,
          entryPrice: 44000,
          exitPrice: 45000,
          profit: 1000,
          timestamp: Date.now() - 3600000
        },
        {
          id: 2,
          type: 'Short',
          asset: 'ETH/USD',
          amount: 2000,
          entryPrice: 2500,
          exitPrice: 2400,
          profit: 2000,
          timestamp: Date.now() - 7200000
        },
        {
          id: 3,
          type: 'Long',
          asset: 'BTC/USD',
          amount: 1500,
          entryPrice: 43000,
          exitPrice: 42000,
          profit: -1500,
          timestamp: Date.now() - 86400000
        }
      ];

      // Apply filters
      let filteredTrades = [...mockTrades];
      
      if (timeFilter !== 'all') {
        const now = Date.now();
        const filterMap = {
          '24h': now - 86400000,
          '7d': now - 604800000,
          '30d': now - 2592000000
        };
        filteredTrades = filteredTrades.filter(
          trade => trade.timestamp >= filterMap[timeFilter as keyof typeof filterMap]
        );
      }

      if (assetFilter !== 'all') {
        filteredTrades = filteredTrades.filter(trade => trade.asset === assetFilter);
      }

      setTrades(filteredTrades);
      calculateStats(filteredTrades);
    } catch (error) {
      console.error('Failed to load trade history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (trades: Trade[]) => {
    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit < 0);
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);

    setStats({
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalProfit,
      largestWin: Math.max(...trades.map(t => t.profit), 0),
      largestLoss: Math.min(...trades.map(t => t.profit), 0),
      averageTrade: totalProfit / trades.length || 0,
      winRate: (winningTrades.length / trades.length) * 100 || 0
    });
  };

  const exportTradeHistory = () => {
    const headers = ['ID', 'Type', 'Asset', 'Amount', 'Entry Price', 'Exit Price', 'Profit', 'Date'];
    const csv = [
      headers.join(','),
      ...trades.map(trade => [
        trade.id,
        trade.type,
        trade.asset,
        trade.amount,
        trade.entryPrice,
        trade.exitPrice,
        trade.profit,
        new Date(trade.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-history-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
      <Header />
          <div className="p-6">
          <Alert>
            <AlertDescription>
              Please connect your wallet to view your trade history.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <div className="flex gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="BTC/USD">BTC/USD</SelectItem>
              <SelectItem value="ETH/USD">ETH/USD</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportTradeHistory} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Profit/Loss</p>
                <p className={`text-2xl font-bold ${
                  stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${stats.totalProfit.toLocaleString()}
                </p>
              </div>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Largest Win</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.largestWin.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Largest Loss</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats.largestLoss.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Asset</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-right">Entry Price</th>
                  <th className="px-4 py-2 text-right">Exit Price</th>
                  <th className="px-4 py-2 text-right">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(trade => (
                  <tr key={trade.id} className="border-b">
                    <td className="px-4 py-2">
                      {new Date(trade.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        trade.type === 'Long' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{trade.asset}</td>
                    <td className="px-4 py-2 text-right">
                      ${trade.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${trade.entryPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${trade.exitPrice.toLocaleString()}
                    </td>
                    <td className={`px-4 py-2 text-right ${
                      trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${trade.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {trades.length === 0 && !isLoading && (
        <Alert>
          <AlertDescription>
            No trades found for the selected filters.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}