"use client";

import { useState, useEffect } from 'react';
import { createStarkNetTradingService } from '@/lib/services/starknet-trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';

interface Pool {
  id: string;
  totalAmount: number;
  active: boolean;
  allocatedAmount: number;
  tradersCount: number;
}

export default function PropFirmPanel() {
  const { address, isConnected } = useParticleAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [newPoolAmount, setNewPoolAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState('');
  const [beginnerAddress, setBeginnerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadPools = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );
      await starkNetService.initializeContract(address);

      // This would be replaced with actual contract data in production
      const poolData = [
        { id: '1', totalAmount: 100000, allocatedAmount: 50000, tradersCount: 5, active: true },
        { id: '2', totalAmount: 50000, allocatedAmount: 20000, tradersCount: 3, active: true }
      ];
      setPools(poolData);
    } catch (error) {
      console.error('Failed to load pools:', error);
      toast.error('Failed to load pool data');
    }
  };

  useEffect(() => {
    loadPools();
  }, [isConnected, address]);

  const createPool = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!newPoolAmount || Number(newPoolAmount) <= 0) {
      toast.error('Please enter a valid pool amount');
      return;
    }

    setIsLoading(true);
    try {
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );
      await starkNetService.initializeContract(address);

      const poolParams = JSON.stringify({
        minAllocation: Number(newPoolAmount) * 0.01, // 1% minimum allocation
        maxAllocation: Number(newPoolAmount) * 0.1,  // 10% maximum allocation
        createdAt: Date.now()
      });

      const poolId = await starkNetService.createPropPool(
        Number(newPoolAmount),
        poolParams
      );

      toast.success('Pool created successfully');
      setNewPoolAmount('');
      loadPools();
    } catch (error) {
      console.error('Failed to create pool:', error);
      toast.error('Failed to create pool');
    } finally {
      setIsLoading(false);
    }
  };

  const allocateFunds = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!selectedPool || !allocationAmount || !beginnerAddress) {
      toast.error('Please fill in all allocation details');
      return;
    }

    const selectedPoolData = pools.find(pool => pool.id === selectedPool);
    if (!selectedPoolData) {
      toast.error('Invalid pool selected');
      return;
    }

    if (Number(allocationAmount) > selectedPoolData.totalAmount - selectedPoolData.allocatedAmount) {
      toast.error('Insufficient available funds in pool');
      return;
    }

    setIsLoading(true);
    try {
      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );
      await starkNetService.initializeContract(address);

      await starkNetService.allocateToBeginner(
        beginnerAddress,
        selectedPool,
        Number(allocationAmount)
      );

      toast.success('Funds allocated successfully');
      setAllocationAmount('');
      setBeginnerAddress('');
      setSelectedPool(null);
      loadPools();
    } catch (error) {
      console.error('Failed to allocate funds:', error);
      toast.error('Failed to allocate funds');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Pool Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Initial pool amount"
              value={newPoolAmount}
              onChange={(e) => setNewPoolAmount(e.target.value)}
              min="0"
              className="w-full"
            />
            <Button 
              onClick={createPool} 
              disabled={isLoading || !newPoolAmount}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Pool'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Pools Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pools.map(pool => (
              <div 
                key={pool.id} 
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Pool #{pool.id}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    pool.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pool.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-medium">${pool.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Allocated</p>
                    <p className="font-medium">${pool.allocatedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Available</p>
                    <p className="font-medium">
                      ${(pool.totalAmount - pool.allocatedAmount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Active Traders</p>
                    <p className="font-medium">{pool.tradersCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fund Allocation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Allocate Funds to Trader</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedPool ?? ''}
              onValueChange={(value) => setSelectedPool(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Pool" />
              </SelectTrigger>
              <SelectContent>
                {pools.map(pool => (
                  <SelectItem key={pool.id} value={pool.id}>
                    Pool #{pool.id} - ${pool.totalAmount.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Trader's wallet address"
              value={beginnerAddress}
              onChange={(e) => setBeginnerAddress(e.target.value)}
              className="w-full"
            />

            <Input
              type="number"
              placeholder="Allocation amount"
              value={allocationAmount}
              onChange={(e) => setAllocationAmount(e.target.value)}
              min="0"
              className="w-full"
            />

            <Button 
              onClick={allocateFunds}
              disabled={isLoading || !selectedPool || !allocationAmount || !beginnerAddress}
              className="w-full"
            >
              {isLoading ? 'Allocating...' : 'Allocate Funds'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!pools.length && (
        <Alert>
          <AlertDescription>
            No active pools found. Create a new pool to get started.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}