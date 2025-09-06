// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ChatbotVerifier
 * @dev Smart contract for storing AI chatbot responses with cryptographic verification
 * Specialized for DAO Governance & Voting Helper queries
 */
contract ChatbotVerifier {
    // Events
    event RequestCreated(uint256 indexed requestId, bytes32 indexed promptHash, address indexed requester);
    event AnswerSubmitted(uint256 indexed requestId, string answer, bytes proof, address indexed submitter);
    
    // Structs
    struct GovernanceRequest {
        bytes32 promptHash;
        address requester;
        uint256 timestamp;
        bool answered;
    }
    
    struct GovernanceAnswer {
        string answer;
        bytes proof;
        address submitter;
        uint256 timestamp;
        bool verified;
    }
    
    // State variables
    mapping(uint256 => GovernanceRequest) public requests;
    mapping(uint256 => GovernanceAnswer) public answers;
    mapping(bytes32 => uint256) public promptHashToRequestId;
    
    uint256 public requestCounter;
    address public owner;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        requestCounter = 0;
    }
    
    /**
     * @dev Create a new governance query request
     * @param promptHash Hash of the user's prompt for governance assistance
     * @return requestId The unique identifier for this request
     */
    function createRequest(bytes32 promptHash) external returns (uint256) {
        require(promptHash != bytes32(0), "Prompt hash cannot be zero");
        require(promptHashToRequestId[promptHash] == 0, "Request already exists for this prompt");
        
        requestCounter++;
        uint256 requestId = requestCounter;
        
        requests[requestId] = GovernanceRequest({
            promptHash: promptHash,
            requester: msg.sender,
            timestamp: block.timestamp,
            answered: false
        });
        
        promptHashToRequestId[promptHash] = requestId;
        
        emit RequestCreated(requestId, promptHash, msg.sender);
        return requestId;
    }
    
    /**
     * @dev Submit an AI-generated answer with cryptographic proof
     * @param requestId The request ID to answer
     * @param answer The AI-generated response
     * @param proof Cryptographic proof of the answer's authenticity
     */
    function submitAnswer(
        uint256 requestId,
        string calldata answer,
        bytes calldata proof
    ) external {
        require(requestId > 0 && requestId <= requestCounter, "Invalid request ID");
        require(requests[requestId].answered == false, "Request already answered");
        require(bytes(answer).length > 0, "Answer cannot be empty");
        require(proof.length > 0, "Proof cannot be empty");
        
        // Mark request as answered
        requests[requestId].answered = true;
        
        // Store the answer
        answers[requestId] = GovernanceAnswer({
            answer: answer,
            proof: proof,
            submitter: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });
        
        emit AnswerSubmitted(requestId, answer, proof, msg.sender);
    }
    
    /**
     * @dev Verify the cryptographic signature/proof
     * @param requestId The request ID to verify
     * @param signature The signature to verify
     * @return verified Whether the signature is valid
     */
    function verifySignature(uint256 requestId, bytes calldata signature) external view returns (bool) {
        require(requestId > 0 && requestId <= requestCounter, "Invalid request ID");
        require(requests[requestId].answered == true, "No answer to verify");
        
        // TODO: Implement real cryptographic verification
        // This is a stub that will be replaced with:
        // - BLS signature verification
        // - ORA (Oracle Randomness) verification
        // - Supra verification
        // - Or other cryptographic proof systems
        
        // For now, return true if signature length > 0 (mock verification)
        return signature.length > 0;
    }
    
    /**
     * @dev Mark an answer as verified (only owner)
     * @param requestId The request ID to mark as verified
     */
    function markAsVerified(uint256 requestId) external onlyOwner {
        require(requestId > 0 && requestId <= requestCounter, "Invalid request ID");
        require(requests[requestId].answered == true, "No answer to verify");
        
        answers[requestId].verified = true;
    }
    
    /**
     * @dev Get request details
     * @param requestId The request ID
     * @return promptHash Hash of the original prompt
     * @return requester Address of the requester
     * @return timestamp When the request was created
     * @return answered Whether the request has been answered
     */
    function getRequest(uint256 requestId) external view returns (
        bytes32 promptHash,
        address requester,
        uint256 timestamp,
        bool answered
    ) {
        require(requestId > 0 && requestId <= requestCounter, "Invalid request ID");
        
        GovernanceRequest memory request = requests[requestId];
        return (request.promptHash, request.requester, request.timestamp, request.answered);
    }
    
    /**
     * @dev Get answer details
     * @param requestId The request ID
     * @return answer The AI-generated response
     * @return proof The cryptographic proof
     * @return submitter Address of the submitter
     * @return timestamp When the answer was submitted
     * @return verified Whether the answer has been verified
     */
    function getAnswer(uint256 requestId) external view returns (
        string memory answer,
        bytes memory proof,
        address submitter,
        uint256 timestamp,
        bool verified
    ) {
        require(requestId > 0 && requestId <= requestCounter, "Invalid request ID");
        require(requests[requestId].answered == true, "No answer available");
        
        GovernanceAnswer memory answerData = answers[requestId];
        return (answerData.answer, answerData.proof, answerData.submitter, answerData.timestamp, answerData.verified);
    }
    
    /**
     * @dev Get the total number of requests
     * @return count Total number of requests created
     */
    function getTotalRequests() external view returns (uint256) {
        return requestCounter;
    }
}
