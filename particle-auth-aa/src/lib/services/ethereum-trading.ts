import { ethers, Contract, BigNumberish, Provider } from 'ethers';
import { toast } from 'react-hot-toast';
import { PULSE_TRADE_ABI } from './abi-config';

// Contract ABI - import from your contract artifacts
const ABI = PULSE_TRADE_ABI;

// Types
export interface SubAccount {
  owner: string;
  admin: string;
  balance: BigNumberish;
  profitShare: number;
  isActive: boolean;
  totalTrades: number;
  totalProfit: BigNumberish;
}

export interface Trade {
  tradeId: number;
  subAccount: string;
  amount: BigNumberish;
  profit: BigNumberish;
  timestamp: number;
  isComplete: boolean;
}

export interface TradeExecutionParams {
  subAccountAddress: string;
  amount: BigNumberish;
}

export interface TradeCompletionParams {
  tradeId: number;
  profit: BigNumberish;
}

class EthereumTradingService {
  private contract: Contract | null = null;
  private contractAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  // Initialize contract with signer
  public async initializeContract(provider: Provider): Promise<void> {
    try {
      const signer = await (provider as any).getSigner();
      this.contract = new ethers.Contract(
        this.contractAddress,
        ABI,
        signer
      );
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      toast.error('Failed to initialize trading contract');
      throw error;
    }
  }

  // Admin Management
  public async registerTradeAdmin(): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.registerTradeAdmin();
      await tx.wait();
      
      toast.success('Successfully registered as trade admin');
      return true;
    } catch (error) {
      console.error('Failed to register trade admin:', error);
      toast.error('Failed to register as trade admin');
      throw error;
    }
  }

  // Sub-account Management
  public async createSubAccount(
    adminAddress: string,
    profitShare: number
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.createSubAccount(
        adminAddress,
        profitShare
      );
      await tx.wait();

      toast.success('Successfully created sub-account');
      return true;
    } catch (error) {
      console.error('Failed to create sub-account:', error);
      toast.error('Failed to create sub-account');
      throw error;
    }
  }

  public async getSubAccountDetails(
    subAccountAddress: string
  ): Promise<SubAccount> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const details = await this.contract.getSubAccountDetails(subAccountAddress);
      return {
        owner: details[0],
        admin: details[1],
        balance: details[2],
        profitShare: details[3].toNumber(),
        isActive: details[4],
        totalTrades: details[5].toNumber(),
        totalProfit: details[6]
      };
    } catch (error) {
      console.error('Failed to get sub-account details:', error);
      toast.error('Failed to fetch account details');
      throw error;
    }
  }

  // Trading Operations
  public async executeTrade(params: TradeExecutionParams): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.executeTrade(
        params.subAccountAddress,
        params.amount
      );
      await tx.wait();

      toast.success('Trade executed successfully');
      return true;
    } catch (error) {
      console.error('Failed to execute trade:', error);
      toast.error('Failed to execute trade');
      throw error;
    }
  }

  public async completeTrade(params: TradeCompletionParams): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.completeTrade(
        params.tradeId,
        params.profit
      );
      await tx.wait();

      toast.success('Trade completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to complete trade:', error);
      toast.error('Failed to complete trade');
      throw error;
    }
  }

  public async getTradeDetails(tradeId: number): Promise<Trade> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const details = await this.contract.getTradeDetails(tradeId);
      return {
        tradeId,
        subAccount: details[0],
        amount: details[1],
        profit: details[2],
        timestamp: details[3].toNumber(),
        isComplete: details[4]
      };
    } catch (error) {
      console.error('Failed to get trade details:', error);
      toast.error('Failed to fetch trade details');
      throw error;
    }
  }

  // Balance Management
  public async deposit(amount: BigNumberish): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.deposit({ value: amount });
      await tx.wait();

      toast.success('Deposit successful');
      return true;
    } catch (error) {
      console.error('Failed to deposit:', error);
      toast.error('Failed to process deposit');
      throw error;
    }
  }

  public async withdraw(amount: BigNumberish): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const tx = await this.contract.withdraw(amount);
      await tx.wait();

      toast.success('Withdrawal successful');
      return true;
    } catch (error) {
      console.error('Failed to withdraw:', error);
      toast.error('Failed to process withdrawal');
      throw error;
    }
  }

  // Event Listeners
  public onTradeExecuted(
    callback: (trade: Trade) => void
  ): void {
    if (!this.contract) throw new Error('Contract not initialized');

    this.contract.on('TradeExecuted', 
      (tradeId, admin, subAccount, amount, event) => {
        callback({
          tradeId: tradeId.toNumber(),
          subAccount,
          amount,
          profit: BigInt(0),
          timestamp: Math.floor(Date.now() / 1000),
          isComplete: false
        });
      }
    );
  }

  public onProfitDistributed(
    callback: (tradeId: number, adminShare: BigNumberish, userShare: BigNumberish) => void
  ): void {
    if (!this.contract) throw new Error('Contract not initialized');

    this.contract.on('ProfitDistributed',
      (tradeId, admin, subAccount, adminShare, userShare, event) => {
        callback(
          tradeId.toNumber(),
          adminShare,
          userShare
        );
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

export const createEthereumTradingService = (contractAddress: string) => {
  return new EthereumTradingService(contractAddress);
};

export type { EthereumTradingService };