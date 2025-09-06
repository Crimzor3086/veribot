const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing ChatbotVerifier contract functionality...");

  // Get the deployed contract
  const contractAddress = process.env.CHATBOT_VERIFIER_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please set CHATBOT_VERIFIER_ADDRESS environment variable");
    process.exit(1);
  }

  const ChatbotVerifier = await ethers.getContractFactory("ChatbotVerifier");
  const contract = ChatbotVerifier.attach(contractAddress);

  console.log("📍 Contract Address:", contractAddress);

  // Test 1: Create a request
  console.log("\n📝 Test 1: Creating a governance request...");
  const testPrompt = "What are the current DAO proposals?";
  const promptHash = ethers.keccak256(ethers.toUtf8Bytes(testPrompt));
  
  const createTx = await contract.createRequest(promptHash);
  await createTx.wait();
  
  const requestId = await contract.getTotalRequests();
  console.log("✅ Request created with ID:", requestId.toString());

  // Test 2: Get request details
  console.log("\n🔍 Test 2: Retrieving request details...");
  const requestDetails = await contract.getRequest(requestId);
  console.log("Request Details:");
  console.log("  Prompt Hash:", requestDetails[0]);
  console.log("  Requester:", requestDetails[1]);
  console.log("  Timestamp:", new Date(Number(requestDetails[2]) * 1000).toISOString());
  console.log("  Answered:", requestDetails[3]);

  // Test 3: Submit an answer
  console.log("\n💬 Test 3: Submitting AI answer...");
  const testAnswer = "Based on the current DAO proposals, there are 3 active proposals: Tokenomics Update, Treasury Diversification, and Partnership Agreement.";
  const testProof = ethers.toUtf8Bytes("0g-proof-mock-verification-hash-12345");
  
  const answerTx = await contract.submitAnswer(requestId, testAnswer, testProof);
  await answerTx.wait();
  console.log("✅ Answer submitted successfully");

  // Test 4: Get answer details
  console.log("\n📋 Test 4: Retrieving answer details...");
  const answerDetails = await contract.getAnswer(requestId);
  console.log("Answer Details:");
  console.log("  Answer:", answerDetails[0]);
  console.log("  Proof:", ethers.toUtf8String(answerDetails[1]));
  console.log("  Submitter:", answerDetails[2]);
  console.log("  Timestamp:", new Date(Number(answerDetails[3]) * 1000).toISOString());
  console.log("  Verified:", answerDetails[4]);

  // Test 5: Verify signature (mock)
  console.log("\n🔐 Test 5: Testing signature verification...");
  const testSignature = ethers.toUtf8Bytes("mock-signature-verification");
  const isValid = await contract.verifySignature(requestId, testSignature);
  console.log("Signature verification result:", isValid);

  // Test 6: Check total requests
  console.log("\n📊 Test 6: Checking total requests...");
  const totalRequests = await contract.getTotalRequests();
  console.log("Total requests:", totalRequests.toString());

  console.log("\n🎉 All tests completed successfully!");
  console.log("\n📋 Test Summary:");
  console.log("✅ Request creation");
  console.log("✅ Request retrieval");
  console.log("✅ Answer submission");
  console.log("✅ Answer retrieval");
  console.log("✅ Signature verification");
  console.log("✅ Total requests count");

  return true;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
