const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of ChatbotVerifier contract...");

  // Get the contract factory
  const ChatbotVerifier = await ethers.getContractFactory("ChatbotVerifier");

  // Deploy the contract
  console.log("📝 Deploying contract...");
  const chatbotVerifier = await ChatbotVerifier.deploy();

  // Wait for deployment to complete
  await chatbotVerifier.waitForDeployment();

  const contractAddress = await chatbotVerifier.getAddress();
  console.log("✅ ChatbotVerifier deployed to:", contractAddress);

  // Verify deployment by calling a function
  try {
    const totalRequests = await chatbotVerifier.getTotalRequests();
    console.log("🔍 Initial total requests:", totalRequests.toString());
  } catch (error) {
    console.log("⚠️  Could not verify deployment:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", deploymentInfo.contractAddress);
  console.log("Network:", deploymentInfo.network);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Block Number:", deploymentInfo.blockNumber);
  console.log("Timestamp:", deploymentInfo.timestamp);

  // Instructions for next steps
  console.log("\n🔧 Next Steps:");
  console.log("1. Update your .env file with the contract address:");
  console.log(`   CHATBOT_VERIFIER_ADDRESS=${contractAddress}`);
  console.log("2. Update frontend environment variables:");
  console.log(`   REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("3. Start the backend server:");
  console.log("   cd backend && npm run dev");
  console.log("4. Start the frontend:");
  console.log("   cd frontend && npm start");

  // Save to file for reference
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '..', 'deployments.json');
  let deployments = {};
  
  try {
    if (fs.existsSync(deploymentPath)) {
      deployments = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    }
  } catch (error) {
    console.log("Creating new deployments file...");
  }
  
  deployments[network.name] = deploymentInfo;
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
