# PulseTrade: AI-Powered Web3 Trading Platform

![PulseTrade Logo](public/pulsetrade.png)

## 🚀 Project Overview

PulseTrade is an innovative web3 trading platform that leverages AI and blockchain technologies to provide advanced trading capabilities, AI chat assistance, and decentralized financial services.

### Key Features
- 🤖 AI-Powered Trading Assistant
- 💱 Multi-Blockchain Trading Support
- 🔒 Secure Web3 Authentication
- 📊 Advanced Trading Dashboard
- 💬 Real-time AI Trading Chat
- 🌐 Decentralized Data Protection

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm (v9 or later)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pulsetrade.git
cd pulsetrade
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
NEXT_PUBLIC_PARTICLE_APP_ID=your_particle_app_id
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=your_particle_client_key
NEXT_PUBLIC_FIREBASE_CONFIG=your_firebase_config_json
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

## 📂 Project Structure
```
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js page routes
│   ├── components/   # Reusable React components
│   ├── lib/          # Utility functions, hooks, services
│   └── styles/       # Global styles
├── contracts/        # Smart contract definitions
└── config/           # Configuration files
```

## 🔧 Technologies Used

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Web3 & Blockchain
- Ethers.js
- Starknet.js
- Particle Network Auth
- Web3.js

### AI & Services
- OpenAI / Groq AI
- Firebase
- iExec Data Protection

### Authentication
- Particle Network
- Web3 Wallet Integrations

## 🌟 Feature Highlights

### AI Trading Chat
- Real-time trading insights
- Market trend analysis
- Personalized trading recommendations

### Multi-Chain Support
- Ethereum trading
- Starknet integration
- Cross-chain capabilities

### Secure Authentication
- Web3 wallet connections
- Decentralized identity management
- Privacy-focused authentication

## 🔧 Configuration

The application can be configured via:
- `.env` file for environment-specific settings
- `next.config.mjs` for Next.js configurations
- `tailwind.config.ts` for styling customizations

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before getting started.

## 📬 Contact

- Project Maintainer: [@patrickkish1](https://github.com/patrickkish1)
- Project Link: [https://github.com/patrickkish1/pulsetrade](https://github.com/patrickkish1/pulsetrade)