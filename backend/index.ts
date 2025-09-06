import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { ZeroGClient } from './0g-client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize 0G client
const zeroGClient = new ZeroGClient();

// Initialize Ethereum provider and contract
let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contract: ethers.Contract;

// Contract ABI (simplified version of our ChatbotVerifier contract)
const CONTRACT_ABI = [
  "function createRequest(bytes32 promptHash) external returns (uint256)",
  "function submitAnswer(uint256 requestId, string memory answer, bytes memory proof) external",
  "function verifySignature(uint256 requestId, bytes memory signature) external view returns (bool)",
  "function getRequest(uint256 requestId) external view returns (bytes32, address, uint256, bool)",
  "function getAnswer(uint256 requestId) external view returns (string memory, bytes memory, address, uint256, bool)",
  "function getTotalRequests() external view returns (uint256)",
  "event RequestCreated(uint256 indexed requestId, bytes32 indexed promptHash, address indexed requester)",
  "event AnswerSubmitted(uint256 indexed requestId, string answer, bytes proof, address indexed submitter)"
];

// Initialize blockchain connection
async function initializeBlockchain() {
  try {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CHATBOT_VERIFIER_ADDRESS || '0x0B1eB634c9F6Cf22B831ca5B7B66E8CBeD3BfC78';

    if (!privateKey) {
      console.log('⚠️  No private key found. Running in mock mode.');
      return;
    }

    if (!contractAddress) {
      console.log('⚠️  No contract address found. Please deploy the contract first.');
      return;
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

    console.log('✅ Blockchain connection initialized');
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`👤 Wallet address: ${wallet.address}`);
  } catch (error) {
    console.error('❌ Failed to initialize blockchain connection:', error);
    console.log('🔄 Running in mock mode');
  }
}

// Mock governance proposals data
const mockProposals = [
  {
    id: 123,
    title: "Tokenomics Update",
    description: "Increase staking rewards from 5% to 7% APY and reduce inflation rate by 2%",
    status: "Active",
    votesFor: 67,
    votesAgainst: 33,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    proposer: "0x1234...5678"
  },
  {
    id: 124,
    title: "Treasury Diversification",
    description: "Allocate 20% of treasury to DeFi yield farming and invest in blue-chip NFTs",
    status: "Passed",
    votesFor: 89,
    votesAgainst: 11,
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    proposer: "0x2345...6789"
  },
  {
    id: 125,
    title: "Governance Token Distribution",
    description: "Airdrop 1M tokens to active community members with 12-month linear vesting",
    status: "Draft",
    votesFor: 0,
    votesAgainst: 0,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    proposer: "0x3456...7890"
  },
  {
    id: 126,
    title: "Partnership with DeFi Protocol",
    description: "Establish strategic partnership with leading DeFi protocol for cross-chain integration",
    status: "Active",
    votesFor: 45,
    votesAgainst: 55,
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    proposer: "0x4567...8901"
  },
  {
    id: 127,
    title: "Community Rewards Program",
    description: "Launch comprehensive rewards program for active contributors and early adopters",
    status: "Completed",
    votesFor: 92,
    votesAgainst: 8,
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    proposer: "0x5678...9012"
  }
];

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    blockchain: contract ? 'connected' : 'mock'
  });
});

/**
 * Get mock governance proposals
 */
app.get('/api/proposals', (req, res) => {
  res.json({
    proposals: mockProposals,
    total: mockProposals.length,
    active: mockProposals.filter(p => p.status === 'Active').length
  });
});

/**
 * Main chat endpoint for AI governance assistance
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Prompt is required and must be a string' 
      });
    }

    console.log(`🤖 Processing governance query: "${prompt}"`);

    // Generate hash of the prompt
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes(prompt));
    console.log(`📝 Prompt hash: ${promptHash}`);

    let requestId: number;

    // Create request on blockchain (if connected)
    if (contract) {
      try {
        const tx = await contract.createRequest(promptHash);
        await tx.wait();
        
        // Get the request ID from the transaction logs
        const filter = contract.filters.RequestCreated();
        const events = await contract.queryFilter(filter);
        const latestEvent = events[events.length - 1];
        requestId = Number((latestEvent as any).args[0]);
        
        console.log(`✅ Request created on blockchain: ${requestId}`);
      } catch (error) {
        console.error('❌ Failed to create blockchain request:', error);
        // Fallback to mock request ID
        requestId = Math.floor(Math.random() * 1000000);
      }
    } else {
      // Mock request ID when blockchain is not connected
      requestId = Math.floor(Math.random() * 1000000);
      console.log(`🔄 Mock request ID: ${requestId}`);
    }

    // Generate AI response using 0G client
    const aiResponse = await zeroGClient.generateResponse({
      prompt: prompt,
      model: '0g-governance-assistant-v1',
      temperature: 0.7,
      maxTokens: 1000
    });

    console.log(`🎯 AI response generated (${aiResponse.usage.totalTokens} tokens)`);

    // Submit answer to blockchain (if connected)
    if (contract) {
      try {
        const proofBytes = ethers.toUtf8Bytes(aiResponse.proof);
        const tx = await contract.submitAnswer(requestId, aiResponse.text, proofBytes);
        await tx.wait();
        
        console.log(`✅ Answer submitted to blockchain`);
      } catch (error) {
        console.error('❌ Failed to submit answer to blockchain:', error);
      }
    }

    // Return response
    res.json({
      requestId: requestId,
      text: aiResponse.text,
      proof: aiResponse.proof,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
      verifiable: !!contract // Indicates if the response is on-chain verifiable
    });

  } catch (error) {
    console.error('❌ Error processing chat request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get request details from blockchain
 */
app.get('/api/request/:requestId', async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);

    if (!contract) {
      return res.status(400).json({ 
        error: 'Blockchain not connected' 
      });
    }

    const request = await contract.getRequest(requestId);
    const answer = await contract.getAnswer(requestId);

    res.json({
      requestId: requestId,
      request: {
        promptHash: request[0],
        requester: request[1],
        timestamp: Number(request[2]),
        answered: request[3]
      },
      answer: {
        text: answer[0],
        proof: answer[1],
        submitter: answer[2],
        timestamp: Number(answer[3]),
        verified: answer[4]
      }
    });

  } catch (error) {
    console.error('❌ Error fetching request:', error);
    res.status(500).json({ 
      error: 'Failed to fetch request details' 
    });
  }
});

/**
 * Verify a response signature
 */
app.post('/api/verify', async (req, res) => {
  try {
    const { requestId, signature } = req.body;

    if (!contract) {
      return res.status(400).json({ 
        error: 'Blockchain not connected' 
      });
    }

    const isValid = await contract.verifySignature(requestId, signature);

    res.json({
      requestId: requestId,
      verified: isValid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error verifying signature:', error);
    res.status(500).json({ 
      error: 'Failed to verify signature' 
    });
  }
});

// Start server
async function startServer() {
  await initializeBlockchain();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`📋 Proposals endpoint: http://localhost:${PORT}/api/proposals`);
  });
}

startServer().catch(console.error);
