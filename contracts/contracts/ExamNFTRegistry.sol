// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ExamNFTRegistry is Ownable, ReentrancyGuard {
    
    struct PendingMint {
        string studentId;
        string subject;
        string examSession;
        uint256 score;
        uint256 examDate;
        string ipAddress;
        uint256 addedAt;
        bool exists;
    }
    
    struct CompletedMint {
        string studentId;
        string subject;
        string examSession;
        uint256 score;
        uint256 examDate;
        string ipAddress;
        uint256 mintDate;
        string tokenId;
        bool exists;
    }
    
    // Mapping from student wallet to pending mint info
    mapping(address => PendingMint) public pendingMints;
    
    // Mapping from student wallet to completed mint info
    mapping(address => CompletedMint) public completedMints;
    
    // Arrays to track all pending and completed mints
    address[] public pendingAddresses;
    address[] public completedAddresses;
    
    // Events
    event StudentAddedToPending(address indexed studentWallet, string studentId, string subject);
    event StudentMovedToCompleted(address indexed studentWallet, string tokenId);
    event NFTMinted(address indexed studentWallet, string tokenId, uint256 timestamp);
    
    modifier onlyOwnerOrAuthorized() {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");
        _;
    }
    
    // Add student to pending mint list
    function addToPendingMint(
        address studentWallet,
        string memory studentId,
        string memory subject,
        string memory examSession,
        uint256 score,
        string memory ipAddress
    ) external onlyOwnerOrAuthorized {
        require(!pendingMints[studentWallet].exists, "Student already in pending list");
        require(!completedMints[studentWallet].exists, "Student already has NFT");
        
        pendingMints[studentWallet] = PendingMint({
            studentId: studentId,
            subject: subject,
            examSession: examSession,
            score: score,
            examDate: block.timestamp,
            ipAddress: ipAddress,
            addedAt: block.timestamp,
            exists: true
        });
        
        pendingAddresses.push(studentWallet);
        
        emit StudentAddedToPending(studentWallet, studentId, subject);
    }
    
    // Move student from pending to completed
    function moveToCompleted(
        address studentWallet,
        string memory tokenId
    ) external onlyOwnerOrAuthorized {
        require(pendingMints[studentWallet].exists, "Student not in pending list");
        require(!completedMints[studentWallet].exists, "Student already completed");
        
        PendingMint memory pending = pendingMints[studentWallet];
        
        completedMints[studentWallet] = CompletedMint({
            studentId: pending.studentId,
            subject: pending.subject,
            examSession: pending.examSession,
            score: pending.score,
            examDate: pending.examDate,
            ipAddress: pending.ipAddress,
            mintDate: block.timestamp,
            tokenId: tokenId,
            exists: true
        });
        
        // Remove from pending
        delete pendingMints[studentWallet];
        
        // Remove from pending addresses array
        for (uint i = 0; i < pendingAddresses.length; i++) {
            if (pendingAddresses[i] == studentWallet) {
                pendingAddresses[i] = pendingAddresses[pendingAddresses.length - 1];
                pendingAddresses.pop();
                break;
            }
        }
        
        completedAddresses.push(studentWallet);
        
        emit StudentMovedToCompleted(studentWallet, tokenId);
        emit NFTMinted(studentWallet, tokenId, block.timestamp);
    }
    
    // Get pending mint info
    function getPendingMint(address studentWallet) external view returns (PendingMint memory) {
        return pendingMints[studentWallet];
    }
    
    // Get completed mint info
    function getCompletedMint(address studentWallet) external view returns (CompletedMint memory) {
        return completedMints[studentWallet];
    }
    
    // Get all pending addresses
    function getAllPendingAddresses() external view returns (address[] memory) {
        return pendingAddresses;
    }
    
    // Get all completed addresses
    function getAllCompletedAddresses() external view returns (address[] memory) {
        return completedAddresses;
    }
    
    // Get pending count
    function getPendingCount() external view returns (uint256) {
        return pendingAddresses.length;
    }
    
    // Get completed count
    function getCompletedCount() external view returns (uint256) {
        return completedAddresses.length;
    }
    
    // Check if student is pending
    function isPending(address studentWallet) external view returns (bool) {
        return pendingMints[studentWallet].exists;
    }
    
    // Check if student is completed
    function isCompleted(address studentWallet) external view returns (bool) {
        return completedMints[studentWallet].exists;
    }
    
    // Emergency function to remove from pending (only owner)
    function emergencyRemoveFromPending(address studentWallet) external onlyOwner {
        require(pendingMints[studentWallet].exists, "Student not in pending list");
        
        delete pendingMints[studentWallet];
        
        // Remove from pending addresses array
        for (uint i = 0; i < pendingAddresses.length; i++) {
            if (pendingAddresses[i] == studentWallet) {
                pendingAddresses[i] = pendingAddresses[pendingAddresses.length - 1];
                pendingAddresses.pop();
                break;
            }
        }
    }
} 