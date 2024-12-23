// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

/**
 * @title CitreaTrading
 * @dev Implements complete trading functionality with profit distribution
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract CitreaTrading {
    // Structs
    struct SubAccount {
        address owner;
        address admin;
        uint256 balance;
        uint256 profitShare; // Percentage of profits shared with admin (in basis points)
        bool isActive;
        uint256 totalTrades;
        uint256 totalProfit;
    }

    struct Trade {
        uint256 tradeId;
        address subAccount;
        uint256 amount;
        uint256 profit;
        uint256 timestamp;
        bool isComplete;
    }

    struct TradeAdmin {
        bool isAdmin;
        uint256 totalManagedAccounts;
        uint256 totalTrades;
        mapping(address => bool) managedAccounts;
    }

    // State variables
    mapping(address => TradeAdmin) public tradeAdmins;
    mapping(address => SubAccount) public subAccounts;
    mapping(address => mapping(address => uint256)) private confidentialAgreements;
    mapping(uint256 => Trade) public trades;
    uint256 private nextTradeId;
    
    // Events
    event SubAccountCreated(address indexed owner, address indexed admin, uint256 profitShare);
    event TradeExecuted(uint256 indexed tradeId, address indexed admin, address indexed subAccount, uint256 amount);
    event ProfitDistributed(uint256 indexed tradeId, address indexed admin, address indexed subAccount, uint256 adminShare, uint256 userShare);
    event WithdrawalProcessed(address indexed account, uint256 amount);

    // Modifiers
    modifier onlyTradeAdmin() {
        require(tradeAdmins[msg.sender].isAdmin, "Not authorized as trade admin");
        _;
    }

    modifier onlySubAccountOwner(address subAccountAddress) {
        require(subAccounts[subAccountAddress].owner == msg.sender, "Not the sub-account owner");
        _;
    }

    modifier onlyActiveSubAccount(address subAccountAddress) {
        require(subAccounts[subAccountAddress].isActive, "Sub-account not active");
        _;
    }

    /**
     * @dev Register a new trade admin
     */
    function registerTradeAdmin() external {
        require(!tradeAdmins[msg.sender].isAdmin, "Already registered as admin");
        tradeAdmins[msg.sender].isAdmin = true;
    }

    /**
     * @dev Create a new sub-account
     * @param admin Address of the trade admin
     * @param profitShare Percentage of profits to share with admin (in basis points)
     */
    function createSubAccount(address admin, uint256 profitShare) external {
        require(tradeAdmins[admin].isAdmin, "Invalid trade admin");
        require(profitShare <= 10000, "Invalid profit share percentage");
        require(!subAccounts[msg.sender].isActive, "Sub-account already exists");

        subAccounts[msg.sender] = SubAccount({
            owner: msg.sender,
            admin: admin,
            balance: 0,
            profitShare: profitShare,
            isActive: true,
            totalTrades: 0,
            totalProfit: 0
        });

        tradeAdmins[admin].managedAccounts[msg.sender] = true;
        tradeAdmins[admin].totalManagedAccounts++;

        emit SubAccountCreated(msg.sender, admin, profitShare);
    }

    /**
     * @dev Deposit funds into sub-account
     */
    function deposit() external payable onlyActiveSubAccount(msg.sender) {
        subAccounts[msg.sender].balance += msg.value;
    }

    /**
     * @dev Execute a trade for a sub-account
     * @param subAccountAddress Address of the sub-account
     * @param amount Amount involved in the trade
     */
    function executeTrade(address subAccountAddress, uint256 amount) 
        external 
        onlyTradeAdmin 
        onlyActiveSubAccount(subAccountAddress) 
    {
        require(tradeAdmins[msg.sender].managedAccounts[subAccountAddress], "Not managing this account");
        require(subAccounts[subAccountAddress].balance >= amount, "Insufficient balance");

        uint256 tradeId = nextTradeId++;
        trades[tradeId] = Trade({
            tradeId: tradeId,
            subAccount: subAccountAddress,
            amount: amount,
            profit: 0,
            timestamp: block.timestamp,
            isComplete: false
        });

        subAccounts[subAccountAddress].totalTrades++;
        tradeAdmins[msg.sender].totalTrades++;

        emit TradeExecuted(tradeId, msg.sender, subAccountAddress, amount);
    }

    /**
     * @dev Complete a trade and distribute profits
     * @param tradeId ID of the trade
     * @param profit Amount of profit generated
     */
    function completeTrade(uint256 tradeId, uint256 profit) 
        external 
        onlyTradeAdmin 
    {
        Trade storage trade = trades[tradeId];
        require(!trade.isComplete, "Trade already completed");
        require(tradeAdmins[msg.sender].managedAccounts[trade.subAccount], "Not managing this account");

        SubAccount storage subAccount = subAccounts[trade.subAccount];
        
        trade.profit = profit;
        trade.isComplete = true;

        // Calculate profit shares
        uint256 adminShare = (profit * subAccount.profitShare) / 10000;
        uint256 userShare = profit - adminShare;

        // Update balances
        subAccount.balance += userShare;
        subAccount.totalProfit += profit;
        
        // Transfer admin share
        payable(msg.sender).transfer(adminShare);

        emit ProfitDistributed(tradeId, msg.sender, trade.subAccount, adminShare, userShare);
    }

    /**
     * @dev Withdraw funds from sub-account
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) 
        external 
        onlySubAccountOwner(msg.sender) 
        onlyActiveSubAccount(msg.sender) 
    {
        require(subAccounts[msg.sender].balance >= amount, "Insufficient balance");
        
        subAccounts[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);

        emit WithdrawalProcessed(msg.sender, amount);
    }

    /**
     * @dev Get complete sub-account details
     * @param subAccountAddress Address of the sub-account
     */
    function getSubAccountDetails(address subAccountAddress) 
        external 
        view 
        returns (
            address owner,
            address admin,
            uint256 balance,
            uint256 profitShare,
            bool isActive,
            uint256 totalTrades,
            uint256 totalProfit
        ) 
    {
        SubAccount storage account = subAccounts[subAccountAddress];
        return (
            account.owner,
            account.admin,
            account.balance,
            account.profitShare,
            account.isActive,
            account.totalTrades,
            account.totalProfit
        );
    }

    /**
     * @dev Get trade details
     * @param tradeId ID of the trade
     */
    function getTradeDetails(uint256 tradeId)
        external
        view
        returns (
            address subAccount,
            uint256 amount,
            uint256 profit,
            uint256 timestamp,
            bool isComplete
        )
    {
        Trade storage trade = trades[tradeId];
        return (
            trade.subAccount,
            trade.amount,
            trade.profit,
            trade.timestamp,
            trade.isComplete
        );
    }
}