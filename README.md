# VeriBot - On-Chain AI Chatbot for DAO Governance

A minimal but working prototype of an **On-Chain AI Chatbot** specialized as a **DAO Governance & Voting Helper**. Built with modern full-stack architecture including smart contracts, backend API, and React frontend.

## 🚀 Features

- **Smart Contract**: `ChatbotVerifier.sol` for storing AI responses with cryptographic verification
- **Backend API**: Node.js/TypeScript with Express and `/api/chat` endpoint
- **Frontend**: React with Tailwind CSS for DAO governance dashboard
- **AI Integration**: Mock 0G Inference SDK integration (ready for real implementation)
- **On-Chain Verification**: Cryptographic proof storage for AI responses
- **Governance Dashboard**: View and interact with DAO proposals

## 📁 Project Structure

```
onchain-ai-chatbot/
├── contracts/
│   └── ChatbotVerifier.sol          # Smart contract for AI response verification
├── backend/
│   ├── index.ts                     # Express server with /api/chat endpoint
│   ├── 0g-client.ts                 # Mock 0G Inference SDK client
│   ├── package.json                 # Backend dependencies
│   └── tsconfig.json                # TypeScript configuration
├── frontend/
│   ├── src/
│   │   ├── App.js                   # Main React component
│   │   ├── index.js                 # React entry point
│   │   └── index.css                 # Tailwind CSS styles
│   ├── public/
│   │   └── index.html                # HTML template
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind configuration
│   └── postcss.config.js            # PostCSS configuration
├── scripts/
│   ├── deploy.js                    # Contract deployment script
│   └── test-contract.js             # Contract testing script
├── hardhat.config.js                # Hardhat configuration
├── package.json                     # Root package.json
└── README.md                        # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd VeriBot

# Install all dependencies (root, backend, frontend)
npm run install-all
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your values:

```env
# Ethereum Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Contract Address (will be filled after deployment)
CHATBOT_VERIFIER_ADDRESS=

# Backend Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### 3. Deploy Smart Contract

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet (requires PRIVATE_KEY and SEPOLIA_RPC_URL)
npm run deploy

# Or deploy to local Hardhat network
npx hardhat run scripts/deploy.js --network hardhat
```

After deployment, update your `.env` file with the contract address:

```env
CHATBOT_VERIFIER_ADDRESS=0x1234...5678
REACT_APP_CONTRACT_ADDRESS=0x1234...5678
```

### 4. Test Contract (Optional)

```bash
# Test the deployed contract functionality
npx hardhat run scripts/test-contract.js --network sepolia
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## 💬 Usage

### Chat Interface

1. Open the frontend at `http://localhost:3000`
2. Navigate to the "Chat Assistant" tab
3. Ask governance-related questions such as:
   - "Summarize recent proposals"
   - "Explain our tokenomics"
   - "How does voting work?"
   - "What's our treasury status?"

### Proposals Dashboard

1. Click on the "Proposals" tab
2. View active, passed, and draft proposals
3. See voting progress and time remaining

### API Endpoints

The backend exposes several endpoints:

- `GET /health` - Health check
- `GET /api/proposals` - Get mock governance proposals
- `POST /api/chat` - Send chat message to AI
- `GET /api/request/:requestId` - Get request details from blockchain
- `POST /api/verify` - Verify response signature

## 🔧 Smart Contract Details

### ChatbotVerifier.sol

The smart contract provides:

- `createRequest(promptHash)` - Register governance queries
- `submitAnswer(requestId, answer, proof)` - Store AI answers with cryptographic proof
- `verifySignature(requestId, signature)` - Verify cryptographic signatures
- `getRequest(requestId)` - Retrieve request details
- `getAnswer(requestId)` - Retrieve answer details

### Key Features

- **Cryptographic Verification**: Each AI response includes a proof that can be verified on-chain
- **Request Tracking**: All governance queries are tracked with unique IDs
- **Answer Storage**: AI responses are permanently stored on the blockchain
- **Signature Verification**: Mock verification system (ready for real cryptographic proofs)

## 🤖 AI Integration

### 0G Inference SDK

The backend includes a mock implementation of the 0G Inference SDK:

- **Mock Responses**: Generates contextual responses for governance queries
- **Proof Generation**: Creates mock cryptographic proofs
- **Verification**: Includes proof verification functionality

### Supported Query Types

- Proposal summaries
- Tokenomics explanations
- Voting process guidance
- Treasury status reports
- General governance assistance

## 🔐 Security & Verification

### On-Chain Verification

- All AI responses are stored on the blockchain
- Cryptographic proofs accompany each response
- Request/response pairs are permanently recorded
- Verification can be performed by anyone

### Mock Implementation

The current implementation uses mock verification. In production, this would integrate with:

- **BLS Signatures**: For cryptographic proof verification
- **ORA (Oracle Randomness)**: For randomness verification
- **Supra**: For oracle-based verification
- **0G Network**: For actual AI inference verification

## 🧪 Testing

### Contract Testing

```bash
# Test contract functionality
npx hardhat run scripts/test-contract.js --network sepolia
```

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 📊 Mock Data

The application includes mock governance proposals:

- **Proposal #123**: Tokenomics Update (Active)
- **Proposal #124**: Treasury Diversification (Passed)
- **Proposal #125**: Governance Token Distribution (Draft)
- **Proposal #126**: Partnership with DeFi Protocol (Active)
- **Proposal #127**: Community Rewards Program (Completed)

## 🚀 Deployment

### Smart Contract Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy

# Deploy to mainnet (update hardhat.config.js first)
npx hardhat run scripts/deploy.js --network mainnet
```

### Backend Deployment

The backend can be deployed to any Node.js hosting service:

- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

### Frontend Deployment

The frontend can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🔄 Development Workflow

1. **Smart Contract Changes**: Modify `contracts/ChatbotVerifier.sol`
2. **Backend Changes**: Update `backend/index.ts` or `backend/0g-client.ts`
3. **Frontend Changes**: Modify `frontend/src/App.js`
4. **Testing**: Run tests and verify functionality
5. **Deployment**: Deploy contracts and update environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Contract deployment fails**: Check your private key and RPC URL
2. **Backend won't start**: Ensure all dependencies are installed
3. **Frontend won't connect**: Check the API URL in environment variables
4. **Blockchain connection issues**: Verify your RPC endpoint is working

### Getting Help

- Check the console logs for error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed
- Check network connectivity

## 🔮 Future Enhancements

- Real 0G Inference SDK integration
- Advanced cryptographic proof systems
- Multi-chain support
- Real DAO API integration
- Advanced governance analytics
- Mobile app support
- Voice interface
- Multi-language support

---

**Built with ❤️ for the Web3 community**