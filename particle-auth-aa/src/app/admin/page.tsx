// app/(routes)/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { createStarkNetTradingService } from '@/lib/services/starknet-trading';
import { createEthereumTradingService } from '@/lib/services/ethereum-trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Users, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import Header from '@/components/Header';

interface ManagedAccount {
  address: string;
  balance: number;
  profitShare: number;
  totalTrades: number;
  performance: number;
  lastActive: number;
}

interface AdminMetrics {
  trustScore: number;
  totalManagedAccounts: number;
  activeAgreements: number;
  successRate: number;
  totalVolume: number;
}

export default function AdminDashboard() {
  const { address, isConnected } = useParticleAuth();
  const [managedAccounts, setManagedAccounts] = useState<ManagedAccount[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    trustScore: 0,
    totalManagedAccounts: 0,
    activeAgreements: 0,
    successRate: 0,
    totalVolume: 0
  });
  const [adminStatus, setAdminStatus] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadAdminData();
    }
  }, [isConnected, address]);

  const loadAdminData = async () => {
    try {
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );
      
      const ethService = createEthereumTradingService(
        process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!
      );

      await starkNetService.initializeContract(address!);
      
      const [status, performance] = await Promise.all([
        starkNetService.checkAdminStatus(address!),
        starkNetService.getAdminPerformance(address!),
      ]);

      setAdminStatus(status);
      setMetrics({
        trustScore: performance.trustScore,
        totalManagedAccounts: performance.totalManagedAccounts,
        activeAgreements: performance.totalManagedAccounts,
        successRate: performance.successRate,
        totalVolume: 1000000 // Mock data
      });

      // Mock managed addresss data
      setManagedAccounts([
        {
          address: "0x1234...5678",
          balance: 50000,
          profitShare: 20,
          totalTrades: 45,
          performance: 15.5,
          lastActive: Date.now() - 3600000
        },
        {
          address: "0x8765...4321",
          balance: 75000,
          profitShare: 15,
          totalTrades: 32,
          performance: -5.2,
          lastActive: Date.now() - 7200000
        }
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
        <Header />
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Please connect your wallet to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/verify">
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            Verify New Agreement
          </Button>
        </Link>
      </div>

      {/* Admin Status Alert */}
      {adminStatus === 1 && (
        <Alert variant='destructive'>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your address has received warnings. Please review your trading practices.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Trust Score</p>
                <p className="text-2xl font-bold">{metrics.trustScore}/100</p>
              </div>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Managed Accounts</p>
                <p className="text-2xl font-bold">{metrics.totalManagedAccounts}</p>
              </div>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.successRate}%</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Volume</p>
                <p className="text-2xl font-bold">${metrics.totalVolume.toLocaleString()}</p>
              </div>
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Managed Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Managed Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Account</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                  <th className="px-4 py-2 text-right">Profit Share</th>
                  <th className="px-4 py-2 text-right">Total Trades</th>
                  <th className="px-4 py-2 text-right">Performance</th>
                  <th className="px-4 py-2 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {managedAccounts.map((address, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">
                      <span className="font-mono">{address.address}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${address.balance.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {address.profitShare}%
                    </td>
                    <td className="px-4 py-2 text-right">
                      {address.totalTrades}
                    </td>
                    <td className={`px-4 py-2 text-right ${
                      address.performance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {address.performance}%
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Date(address.lastActive).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}