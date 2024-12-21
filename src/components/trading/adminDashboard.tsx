"use client";

import { useEffect, useState } from 'react';
import { createStarkNetTradingService } from '@/lib/services/starknet-trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';

interface AdminStats {
  trustScore: number;
  totalManagedAccounts: number;
  successRate: number;
}

export default function AdminDashboard() {
  const { address, isConnected } = useParticleAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
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
      await starkNetService.initializeContract(address!);

      const [performanceStats, status] = await Promise.all([
        starkNetService.getAdminPerformance(address!),
        starkNetService.checkAdminStatus(address!)
      ]);

      setStats(performanceStats);
      setAdminStatus(status);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>;
      case 1:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Warning</span>;
      case 2:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Banned</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Current Status</h3>
              {getStatusBadge(adminStatus)}
            </div>
            <Button
              variant="outline"
              onClick={loadAdminData}
            >
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust Score */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Trust Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={stats.trustScore} max={100} />
              <p className="text-sm text-gray-600">
                Current Score: {stats.trustScore}/100
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Managed Accounts
                </h4>
                <p className="text-2xl font-bold">
                  {stats.totalManagedAccounts}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Success Rate
                </h4>
                <p className="text-2xl font-bold">
                  {stats.successRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Alerts */}
      {adminStatus === 1 && (
        <Alert variant='destructive'>
          <AlertDescription>
            Your address has received warnings. Please review your trading practices.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}