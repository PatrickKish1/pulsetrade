import { Contract, Provider, Account, stark, constants, ProviderInterface } from 'starknet';
import { toast } from 'react-hot-toast';
import { STARKNET_CONTRACT_ABI } from './abi-config';

// Contract ABI - import your compiled contract ABI
const ABI = STARKNET_CONTRACT_ABI;

// Types
export interface TrustAgreement {
  user: string;
  admin: string;
  agreementTerms: string;
  isValid: boolean;
}

export interface AdminStats {
  trustScore: number;
  status: number;
  totalManagedAccounts: number;
  successRate: number;
}

export interface PropPool {
  id: string;
  totalAmount: number;
  active: boolean;
  params: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalAdmins: number;
  totalTrades: number;
  activePoolsCount: number;
}

export interface VoteSubmission {
  admin: string;
  voteType: number;  // 0 for positive, 1 for negative
  voteWeight: number;
}

export interface ContractEvent {
  data: string[];
  keys: string[];
  transactionHash: string;
}

class StarkNetTradingService {
  private contract: Contract | null = null;
  private contractAddress: string;
  private provider: Provider;

  constructor(contractAddress: string, providerUrl: string) {
    this.contractAddress = contractAddress;
    this.provider = new Provider({
      nodeUrl: providerUrl
    });
  }

  // Initialize contract
  public async initializeContract(accountAddress: string): Promise<void> {
    try {
      const account = new Account(
        this.provider,
        accountAddress,
        constants.StarknetChainId.SN_MAIN
      );

      this.contract = new Contract(
        ABI,
        this.contractAddress,
        account
      );

      toast.success('StarkNet contract initialized');
    } catch (error) {
      console.error('Failed to initialize StarkNet contract:', error);
      toast.error('Failed to initialize StarkNet contract');
      throw error;
    }
  }

  // Identity Management
  public async registerIdentity(
    credentials: string,
    proof: string
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.register_identity(
        stark.makeAddress(credentials),
        stark.makeAddress(proof)
      );
      await this.provider.waitForTransaction(tx.transaction_hash);

      toast.success('Identity registered successfully');
      return true;
    } catch (error) {
      console.error('Failed to register identity:', error);
      toast.error('Failed to register identity');
      throw error;
    }
  }

  public async createTrustAgreement(
    admin: string,
    agreementTerms: string,
    signature: string
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.create_trust_agreement(
        admin,
        stark.makeAddress(agreementTerms),
        stark.makeAddress(signature)
      );
      await this.provider.waitForTransaction(tx.transaction_hash);

      toast.success('Trust agreement created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create trust agreement:', error);
      toast.error('Failed to create trust agreement');
      throw error;
    }
  }

  public async verifyTrustAgreement(
    user: string,
    admin: string
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const result = await this.contract.verify_trust_agreement(user, admin);
      return result.toNumber() === 1;
    } catch (error) {
      console.error('Failed to verify trust agreement:', error);
      toast.error('Failed to verify trust agreement');
      throw error;
    }
  }

  // Governance
  public async submitVote(params: VoteSubmission): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.submit_vote(
        params.admin,
        params.voteType,
        params.voteWeight
      );
      await this.provider.waitForTransaction(tx.transaction_hash);

      toast.success('Vote submitted successfully');
      return true;
    } catch (error) {
      console.error('Failed to submit vote:', error);
      toast.error('Failed to submit vote');
      throw error;
    }
  }

  public async validateVotes(
    admin: string,
    externalData: string
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.validate_votes(
        admin,
        stark.makeAddress(externalData)
      );
      await this.provider.waitForTransaction(tx.transaction_hash);

      toast.success('Votes validated successfully');
      return true;
    } catch (error) {
      console.error('Failed to validate votes:', error);
      toast.error('Failed to validate votes');
      throw error;
    }
  }

  public async checkAdminStatus(admin: string): Promise<number> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const status = await this.contract.check_admin_status(admin);
      return status.toNumber();
    } catch (error) {
      console.error('Failed to check admin status:', error);
      toast.error('Failed to check admin status');
      throw error;
    }
  }

  // Prop Firm Management
  public async createPropPool(
    initialAmount: number,
    poolParams: string
  ): Promise<string> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.create_prop_pool(
        initialAmount,
        stark.makeAddress(poolParams)
      );
      await this.provider.waitForTransaction(tx.transaction_hash);

      toast.success('Prop pool created successfully');
      return tx.transaction_hash;
    } catch (error) {
      console.error('Failed to create prop pool:', error);
      toast.error('Failed to create prop pool');
      throw error;
    }
  }

  public async donateToPool(
    poolId: string,
    amount: number
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.donate_to_pool(poolId, amount);
      await this.provider.waitForTransaction(tx.transaction_hash);

      toast.success('Donation successful');
      return true;
    } catch (error) {
      console.error('Failed to donate to pool:', error);
      toast.error('Failed to donate to pool');
      throw error;
    }
  }

  public async allocateToBeginner(
    beginner: string,
    poolId: string,
    amount: number
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.allocate_to_beginner(
        beginner,
        poolId,
        amount
      );
      await this.provider.waitForTransaction(tx.transaction_hash);

      toast.success('Funds allocated successfully');
      return true;
    } catch (error) {
      console.error('Failed to allocate funds:', error);
      toast.error('Failed to allocate funds');
      throw error;
    }
  }

  // Platform Statistics
  public async getPlatformStats(): Promise<PlatformStats> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const stats = await this.contract.get_platform_stats();
      return {
        totalUsers: stats.total_users.toNumber(),
        totalAdmins: stats.total_admins.toNumber(),
        totalTrades: stats.total_trades.toNumber(),
        activePoolsCount: stats.active_pools.toNumber()
      };
    } catch (error) {
      console.error('Failed to get platform stats:', error);
      toast.error('Failed to fetch platform statistics');
      throw error;
    }
  }

  public async getAdminPerformance(admin: string): Promise<AdminStats> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const stats = await this.contract.get_admin_performance(admin);
      return {
        trustScore: stats.trust_score.toNumber(),
        status: stats.status.toNumber(),
        totalManagedAccounts: stats.total_managed_accounts.toNumber(),
        successRate: stats.success_rate.toNumber()
      };
    } catch (error) {
      console.error('Failed to get admin performance:', error);
      toast.error('Failed to fetch admin performance');
      throw error;
    }
  }

  // Event Listeners
  public onTrustAgreementCreated(
    callback: (agreement: TrustAgreement) => void
  ): void {
    if (!this.contract) throw new Error('Contract not initialized');

    this.contract.on('TrustAgreementCreated', 
      (user: string, admin: string, terms: string, event: ContractEvent) => {
        callback({
          user,
          admin,
          agreementTerms: terms,
          isValid: true
        });
      }
    );
  }

  // Cleanup
  public removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const createStarkNetTradingService = (
  contractAddress: string,
  providerUrl: string
) => {
  return new StarkNetTradingService(contractAddress, providerUrl);
};

export type { StarkNetTradingService };