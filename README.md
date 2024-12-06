# AI-Powered Trading Platform

Welcome to the **AI-Powered Trading Platform** repository! This platform combines cutting-edge AI capabilities, blockchain technology, and seamless integration to deliver a state-of-the-art trading experience. It is designed to empower both individual traders and trade administrators to maximize profits, manage accounts efficiently, and execute trades with real-time intelligence.

---

## Key Features

1. **AI-Driven Trading Assistance**

   - Automated trade execution with real-time decision-making.
   - Trade signal generation for manual approval or autonomous operation.
   - Configurable AI settings for risk tolerance and trade size.
   - Portfolio management with AI-based suggestions for diversification and optimization.
   - Trade signal suggestions based on technical, fundamental, and sentiment analysis.
   - Updates on market news and trends across stocks, forex, and crypto assets.

2. **Trade Admin Features**

   - Sub-account management with virtual balances to prevent direct fund access.
   - Profit-sharing mechanisms with blockchain-based smart contracts.
   - Aggregated portfolio views for all managed accounts.
   - AI-assisted sub-account trading and management.

3. **User Types**

   - **Regular Users**: Beginner, intermediate, and pro traders leveraging AI and platform tools for trading.
   - **Trade Admins**: Manage sub-accounts, use AI to optimize multiple portfolios, and earn profit shares.

4. **Blockchain Integration**

   - Smart contracts for profit sharing and virtual balance management.
   - Decentralized wallet connectivity with support for MetaMask and StarkNet's Argent Wallet.

5. **Rich Analytics and Reporting**

   - Performance insights with charts and metrics.
   - Comparative analysis of AI-driven vs. manual trades.

6. **Learning and Rewards**
   - Tutorials for beginner traders as Koii tasks, rewarding users with platform tokens upon completion.
   - Tokens created on Koii are used to incentivize engagement and learning.

---

## Technologies Used

### **Core Technologies**

- **Particle**: Ensures seamless interaction with blockchain networks for executing trades and smart contract functionalities.
- **iExec**: Provides decentralized computing power for AI model execution, data sharing, and secure data access through Data Protectors and Web3Mail.
- **Spectral**: Enhances risk assessment by analyzing user creditworthiness for trading decisions.
- **Citrea**: Manages complex workflows, ensuring AI and user actions are synchronized effectively.
- **Koii**: Facilitates decentralized content validation and distribution for learning modules and rewards with platform tokens.
- **StarkNet**: Offers scalable and secure Layer 2 solutions for faster blockchain interactions, supporting smart contracts for specific services like profit sharing.

### **Frontend**

- **Next.js**: For building a responsive and dynamic user interface.
- **Chart.js**: For visualizing trade data and performance metrics.
- **Tailwind CSS**: For a consistent and modern design system.

### **Backend**

- **Node.js**: Provides APIs for communication between the frontend and services.
- **Express.js**: Powers the RESTful API endpoints.
- **WebSockets**: For real-time notifications and updates.

### **AI Engine**

- **Open Source LLMs**:
  - **GPT-J**: Handles natural language understanding for sentiment analysis and trade-related news. It analyzes market trends, social media sentiments, and financial news to influence trading decisions.
  - **Falcon**: Focuses on technical data analysis and trade signal generation. It processes technical indicators like moving averages, RSI, and MACD to create actionable trade signals.
  - **LLaMA**: Synthesizes technical, fundamental, and sentiment data to generate a final trade recommendation. This model integrates inputs from both Falcon’s technical analysis and GPT-J’s sentiment insights for holistic decision-making.
- **AI Functionality**:
  - Technical analysis of trading indicators (e.g., RSI, MACD, moving averages).
  - Fundamental analysis, including earnings reports and economic data.
  - Sentiment analysis using news and social media trends.
  - Dynamic trade signal generation tailored to user profiles (e.g., beginner, intermediate, pro).

### **Blockchain**

- **Ethereum/Polygon**: For deploying general smart contracts that handle profit sharing and virtual balances.
- **StarkNet**: Used specifically for faster, secure Layer 2 smart contracts, including those for trust agreements and trade-related services.
- **Web3.js**: Facilitates interactions between the app and blockchain networks.
- **Wallet Integration**:
  - **MetaMask**: Standard wallet for Ethereum-based interactions.
  - **Argent Wallet**: A StarkNet-compatible wallet for decentralized transactions, providing an additional layer of scalability and security for StarkNet-based interactions.

### **Database**

- **PostgreSQL**: For storing user data, trade history, and performance metrics.
- **Redis**: For caching frequently accessed data, such as live trade signals.

### **DevOps and Deployment**

- **Docker**: For containerizing application components.
- **Kubernetes**: For orchestrating containers in a scalable way.
- **AWS/GCP**: Cloud hosting for frontend, backend, and AI services.

---

## System Architecture

### **Workflow Overview**

1. **User Registration & Onboarding**:
   - Users create accounts, configure AI settings, and link wallets (MetaMask/Argent).
2. **AI-Driven Operations**:

   - AI analyzes market data and generates trade signals.
   - Signals are sent to users for approval or executed autonomously.

3. **Trade Execution**:

   - Trades initiated by AI or users are executed via integrated APIs and reflected on the platform dashboard.

4. **Profit Sharing**:

   - Smart contracts ensure automatic profit distribution between trade admins and sub-accounts.
   - Virtual balances are updated after each trade.

5. **Analytics & Reporting**:

   - Users view performance metrics, trade history, and profit/loss reports.
   - Admins monitor sub-account activities and overall portfolio performance.

6. **Learning and Rewards**:
   - Tutorials on Koii educate beginners about trading strategies.
   - Completing tasks rewards users with platform tokens.

### **Integration Overview**

| Component      | Technology                                        | Functionality                                              |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| **Frontend**   | Next.js, Chart.js                                 | User interface, dashboards, and data visualization.        |
| **Backend**    | Node.js, Express                                  | API management, user authentication, and trade sync logic. |
| **AI Engine**  | GPT-J, Falcon, LLaMA                              | Multi-LLM collaboration for trade insights and decisions.  |
| **Blockchain** | Solidity, Web3.js                                 | Smart contracts for profit sharing and virtual balances.   |
| **Database**   | PostgreSQL, Redis                                 | Persistent and cached data storage.                        |
| **DevOps**     | Docker, Kubernetes                                | Scalable deployment and container orchestration.           |
| **Core Tech**  | Particle, iExec, Spectral, Citrea, Koii, StarkNet | Decentralized workflows, risk assessment, and performance. |

---

---

## Smart Contracts Overview

The following table outlines the smart contracts required for the platform, their deployment platforms, and functionality:

| **Contract Name**              | **Platform**        | **Purpose**                                                                  |
| ------------------------------ | ------------------- | ---------------------------------------------------------------------------- |
| User Management Contract       | Ethereum (Solidity) | Manage users, roles, and wallet connections.                                 |
| Profit-Sharing Contract        | Ethereum (Solidity) | Handle profit distribution between trade admins and sub-accounts.            |
| Token Contract                 | Ethereum (Solidity) | Manage platform tokens for rewards and transactions.                         |
| Reward Distribution Contract   | Ethereum (Solidity) | Incentivize users for completing tasks (can merge with token contract).      |
| Trade Execution Contract       | Ethereum (Solidity) | Record trade details and ensure transparency.                                |
| Virtual Balance Contract       | Ethereum (Solidity) | Manage virtual balances for trade admins and sub-accounts.                   |
| Data Protection Contract       | iExec (Off-chain)   | Store encrypted data references and enable secure communication via iExec.   |
| Workflow Management Contract   | Citrea (StarkNet)   | Manage workflows and tasks within the platform (Citrea integration).         |
| Wallet Compatibility Contracts | Ethereum, StarkNet  | Support MetaMask and StarkNet Argent wallets for decentralized transactions. |

---

## Installation and Setup

### Prerequisites

- **Node.js** (v14+)
- **Python** (3.8+)
- **Docker**
- **MetaMask/Argent Wallet**

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/trading-platform.git
   cd trading-platform
   ```

2. Install dependencies:

   ```bash
   npm install
   cd ai-engine && pip install -r requirements.txt
   ```

3. Start the services:

   - **Frontend**:
     ```bash
     npm run start
     ```
   - **Backend**:
     ```bash
     npm run server
     ```
   - **AI Engine**:
     ```bash
     cd ai-engine && uvicorn main:app --reload
     ```

4. Configure MT5 API and Blockchain network:

   - Update `.env` with API keys and smart contract addresses.

5. Access the platform at `http://localhost:3000`.

---

## Contributing

We welcome contributions! Please follow the standard GitHub workflow:

1. Fork the repository.
2. Create a new feature branch.
3. Submit a pull request with detailed notes on the changes.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
