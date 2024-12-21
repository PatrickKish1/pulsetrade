// app/(routes)/prop-firm/pools/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { createStarkNetTradingService } from '@/lib/services/starknet-trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';
import { Plus, Users, ArrowRight, Bookmark, AlertCircle, TrendingUp } from 'lucide-react';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';

interface Pool {
  id: string;
  totalAmount: number;
  allocatedAmount: number;
  tradersCount: number;
  performance: number;
  status: 'active' | 'full' | 'closed';
  createdAt: number;
  minAllocation: number;
  maxAllocation: number;
  riskLevel: number;
}

interface AllocationRequest {
  id: string;
  traderAddress: string;
  experience: string;
  requestedAmount: number;
  strategy: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PoolManagementPage() {
  const { address, isConnected } = useParticleAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [newPoolAmount, setNewPoolAmount] = useState('');
  const [minAllocation, setMinAllocation] = useState('');
  const [maxAllocation, setMaxAllocation] = useState('');
  const [riskLevel, setRiskLevel] = useState('1');
  const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPoolDialog, setShowNewPoolDialog] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadPools();
    }
  }, [isConnected, address]);

  const loadPools = async () => {
    try {
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );

      // Mock data - replace with actual contract calls
      setPools([
        {
          id: '1',
          totalAmount: 500000,
          allocatedAmount: 300000,
          tradersCount: 15,
          performance: 12.5,
          status: 'active',
          createdAt: Date.now() - 2592000000,
          minAllocation: 10000,
          maxAllocation: 50000,
          riskLevel: 2
        },
        {
          id: '2',
          totalAmount: 250000,
          allocatedAmount: 250000,
          tradersCount: 10,
          performance: 8.2,
          status: 'full',
          createdAt: Date.now() - 5184000000,
          minAllocation: 5000,
          maxAllocation: 25000,
          riskLevel: 3
        }
      ]);

      setAllocationRequests([
        {
          id: '1',
          traderAddress: '0xabcd...1234',
          experience: 'intermediate',
          requestedAmount: 25000,
          strategy: 'Swing Trading',
          timestamp: Date.now() - 86400000,
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Failed to load pools:', error);
      toast.error('Failed to load pool data');
    } finally {
      setIsLoading(false);
    }
  };

  const createPool = async () => {
    if (!newPoolAmount || !minAllocation || !maxAllocation) {
      toast.error('Please fill all required fields');
      return;
    }

    if (Number(minAllocation) >= Number(maxAllocation)) {
      toast.error('Minimum allocation must be less than maximum allocation');
      return;
    }

    setIsLoading(true);
    try {
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );

      const poolParams = {
        minAllocation: Number(minAllocation),
        maxAllocation: Number(maxAllocation),
        riskLevel: Number(riskLevel),
        createdAt: Date.now()
      };

      await starkNetService.createPropPool(
        Number(newPoolAmount),
        JSON.stringify(poolParams)
      );

      toast.success('Pool created successfully');
      setShowNewPoolDialog(false);
      setNewPoolAmount('');
      setMinAllocation('');
      setMaxAllocation('');
      setRiskLevel('1');
      loadPools();
    } catch (error) {
      console.error('Failed to create pool:', error);
      toast.error('Failed to create pool');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocationRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setIsLoading(true);
    try {
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );

      // Update request status
      setAllocationRequests(requests =>
        requests.map(request =>
          request.id === requestId ? { ...request, status } : request
        )
      );

      toast.success(`Request ${status} successfully`);
    } catch (error) {
      console.error('Failed to handle allocation request:', error);
      toast.error('Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Please connect your wallet to manage prop firm pools.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pool Management</h1>
        <Dialog open={showNewPoolDialog} onOpenChange={setShowNewPoolDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Pool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pool</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Pool Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newPoolAmount}
                  onChange={(e) => setNewPoolAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Allocation</label>
                <Input
                  type="number"
                  placeholder="Minimum allocation per trader"
                  value={minAllocation}
                  onChange={(e) => setMinAllocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Allocation</label>
                <Input
                  type="number"
                  placeholder="Maximum allocation per trader"
                  value={maxAllocation}
                  onChange={(e) => setMaxAllocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Level</label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low Risk</SelectItem>
                    <SelectItem value="2">Medium Risk</SelectItem>
                    <SelectItem value="3">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={createPool}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Pool'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Pools */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pools.map((pool) => (
              <Card key={pool.id} className="border-2">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-bold">${pool.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Allocated</p>
                      <p className="text-lg font-bold">${pool.allocatedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Traders</p>
                      <p className="text-lg font-bold">{pool.tradersCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Performance</p>
                      <p className={`text-lg font-bold ${
                        pool.performance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pool.performance}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Min Allocation</p>
                      <p className="text-sm font-medium">${pool.minAllocation.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Max Allocation</p>
                      <p className="text-sm font-medium">${pool.maxAllocation.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Risk Level</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-full rounded ${
                              i < pool.riskLevel ? 'bg-yellow-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pool.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : pool.status === 'full'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allocationRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Trader: {request.traderAddress}</p>
                    <p className="text-sm text-gray-500">Experience: {request.experience}</p>
                    <p className="text-sm text-gray-500">Strategy: {request.strategy}</p>
                  </div>
                  <p className="font-medium">${request.requestedAmount.toLocaleString()}</p>
                </div>
                {request.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAllocationRequest(request.id, 'approved')}
                      disabled={isLoading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAllocationRequest(request.id, 'rejected')}
                      disabled={isLoading}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {allocationRequests.length === 0 && (
              <Alert>
                <AlertDescription>
                  No pending allocation requests.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}