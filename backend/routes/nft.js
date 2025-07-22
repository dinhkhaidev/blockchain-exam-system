const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { JsonRpcProvider, Contract, Wallet } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables from config.env
const loadEnvConfig = () => {
  try {
    const configPath = path.join(__dirname, 'config.env');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const lines = configContent.split('\n');
      
      lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
      console.log('✅ Loaded config from config.env');
    }
  } catch (error) {
    console.log('⚠️ Could not load config.env, using defaults');
  }
};

loadEnvConfig();

// Contract addresses (updated with new deployed addresses)
const EXAM_NFT_REGISTRY_ADDRESS = process.env.EXAM_NFT_REGISTRY_ADDRESS || "0x11C8F8E97F0Ff1741Bf9B565BeDA91740cd8a8E7";
const EXAM_REGISTRATION_ADDRESS = process.env.EXAM_REGISTRATION_ADDRESS || "0x7485b0810293AA7584b8A697e133A4F8785510fC";

// Provider setup
const provider = new JsonRpcProvider(process.env.RPC_URL || "http://localhost:7545");

// Signer setup (for write operations)
// Use your private key (the one who deployed contracts)
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // TODO: Replace with Ganache Account 0 private key
const signer = new Wallet(PRIVATE_KEY, provider);

// Contract ABIs
const EXAM_NFT_REGISTRY_ABI = require('../../frontend/src/contracts/ExamCertificateNFT.json').abi;
const EXAM_REGISTRATION_ABI = require('../../frontend/src/contracts/ExamRegistration.json').abi;

// Initialize contract instances
let nftRegistryContract = null;
let examRegistrationContract = null;
let nftRegistryContractWrite = null; // For write operations
let examRegistrationContractWrite = null; // For write operations

const initializeContracts = async () => {
  try {
    if (EXAM_NFT_REGISTRY_ADDRESS && EXAM_NFT_REGISTRY_ADDRESS !== "0x...") {
      // Read-only contract
      nftRegistryContract = new Contract(
        EXAM_NFT_REGISTRY_ADDRESS,
        EXAM_NFT_REGISTRY_ABI,
        provider
      );
      
      // Write contract with signer
      nftRegistryContractWrite = new Contract(
        EXAM_NFT_REGISTRY_ADDRESS,
        EXAM_NFT_REGISTRY_ABI,
        signer
      );
      console.log("✅ NFT Registry contract initialized (read & write)");
    }
    
    if (EXAM_REGISTRATION_ADDRESS && EXAM_REGISTRATION_ADDRESS !== "0x...") {
      // Read-only contract
      examRegistrationContract = new Contract(
        EXAM_REGISTRATION_ADDRESS,
        EXAM_REGISTRATION_ABI,
        provider
      );
      
      // Write contract with signer
      examRegistrationContractWrite = new Contract(
        EXAM_REGISTRATION_ADDRESS,
        EXAM_REGISTRATION_ABI,
        signer
      );
      console.log("✅ Exam Registration contract initialized (read & write)");
    }
    
    // Log signer address
    console.log("👤 Signer address:", await signer.getAddress());
  } catch (error) {
    console.error("❌ Error initializing contracts:", error);
  }
};

// Initialize contracts on startup
initializeContracts();

// Get pending students from blockchain
const getPendingStudentsFromBlockchain = async () => {
  try {
    if (!examRegistrationContract) {
      console.log("⚠️ Exam registration contract not available");
      return [];
    }

    // Get whitelist count
    const whitelistCount = await examRegistrationContract.whitelistCount();
    console.log(`📋 Whitelist count: ${whitelistCount.toString()}`);
    
    const pendingStudents = [];
    
    // Get all whitelisted students
    for (let i = 0; i < whitelistCount; i++) {
      try {
        const studentAddress = await examRegistrationContract.whitelistedStudents(i);
        const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAddress);
        
        if (isWhitelisted) {
          // Check if student already has NFT
          const hasNFT = await checkIfStudentHasNFT(studentAddress);
          
          if (!hasNFT) {
            pendingStudents.push({
              studentWallet: studentAddress,
              studentId: `STU${i + 1}`, // You might want to store this in contract
              subject: "Blockchain Exam",
              examSession: "2024",
              status: 'pending',
              addedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.log(`⚠️ Error getting student ${i}:`, error.message);
      }
    }
    
    return pendingStudents;
  } catch (error) {
    console.error("❌ Error getting pending students from blockchain:", error);
    return [];
  }
};

// Check if student already has NFT
const checkIfStudentHasNFT = async (studentAddress) => {
  try {
    if (!nftRegistryContract) {
      return false;
    }
    
    // Check if student has token ID assigned
    const tokenId = await nftRegistryContract.getTokenIdByWallet(studentAddress);
    return tokenId > 0;
  } catch (error) {
    console.error("❌ Error checking NFT ownership:", error);
    return false;
  }
};

// Get completed students from blockchain
const getCompletedStudentsFromBlockchain = async () => {
  try {
    if (!nftRegistryContract) {
      console.log("⚠️ NFT registry contract not available");
      return [];
    }

    // Get total certificates
    const totalCertificates = await nftRegistryContract.getTotalCertificates();
    console.log(`📋 Total certificates: ${totalCertificates.toString()}`);
    
    const completedStudents = [];

    // Get all minted certificates
    for (let i = 1; i <= totalCertificates; i++) {
      try {
        const owner = await nftRegistryContract.ownerOf(i);
        const tokenURI = await nftRegistryContract.tokenURI(i);
        const examInfo = await nftRegistryContract.getExamInfo(i);
        const isValid = await nftRegistryContract.isCertificateValid(i);
        
        if (isValid) {
          completedStudents.push({
            tokenId: i.toString(),
            studentWallet: owner,
            studentId: examInfo.studentId,
            subject: examInfo.subject,
            examSession: examInfo.examSession,
            examDate: new Date(examInfo.examDate * 1000).toISOString(),
            ipAddress: examInfo.ipAddress,
            mintDate: new Date(examInfo.verificationTime * 1000).toISOString(),
            status: 'completed',
            tokenURI: tokenURI
          });
        }
      } catch (error) {
        console.log(`⚠️ Error getting certificate ${i}:`, error.message);
      }
    }

    return completedStudents;
  } catch (error) {
    console.error("❌ Error getting completed students from blockchain:", error);
    return [];
  }
};

// In-memory storage for pending students (temporary until we implement proper event tracking)
let pendingStudents = [];
let completedStudents = [];

// Generate NFT metadata
const generateNFTMetadata = (examData) => {
  return {
    name: `Exam Certificate - ${examData.studentId}`,
    description: `Certificate for ${examData.subject} exam`,
    image: `https://ipfs.io/ipfs/${examData.imageHash}`,
    attributes: [
      {
        trait_type: "Student ID",
        value: examData.studentId
      },
      {
        trait_type: "Subject",
        value: examData.subject
      },
      {
        trait_type: "Exam Session",
        value: examData.examSession
      },
      {
        trait_type: "Exam Date",
        value: new Date(examData.examDate).toISOString().split('T')[0]
      },
      {
        trait_type: "Verification Time",
        value: new Date(examData.verificationTime).toISOString()
      },
      {
        trait_type: "IP Address",
        value: examData.ipAddress
      },
      {
        trait_type: "Certificate Type",
        value: "Blockchain Exam Authentication"
      }
    ],
    external_url: "https://blockchain-exam-auth.com",
    background_color: "000000"
  };
};

// Add student to pending mint (called when user completes exam)
router.post('/pending-mint', async (req, res) => {
  try {
    const { 
      studentWallet, 
      studentId, 
      subject, 
      examSession, 
      score,
      examDate,
      ipAddress 
    } = req.body;
    
    if (!studentWallet || !studentId || !subject || !examSession) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'studentWallet, studentId, subject, and examSession are required'
      });
    }

    // Check if student is already in pending list
    const existingIndex = pendingStudents.findIndex(
      student => student.studentWallet.toLowerCase() === studentWallet.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      return res.status(400).json({
        error: 'Student already in pending list',
        message: 'This student is already waiting for NFT mint'
      });
    }
    
    // Add to pending list
    const newStudent = {
      studentWallet,
      studentId,
      subject,
      examSession,
      score: score || 0,
      examDate: examDate || new Date().toISOString(),
      ipAddress: ipAddress || 'Unknown',
      addedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    pendingStudents.push(newStudent);
    
    res.json({
      success: true,
      message: 'Student added to pending mint list',
      data: {
        student: newStudent,
        totalPending: pendingStudents.length
      }
    });
    
  } catch (error) {
    console.error('Error adding to pending mint:', error);
    res.status(500).json({
      error: 'Failed to add to pending mint',
      message: error.message
    });
  }
});

// Get pending mint students
router.get('/pending-mint', async (req, res) => {
  try {
    // Try to get from blockchain first, fallback to in-memory
    let blockchainPending = [];
    try {
      blockchainPending = await getPendingStudentsFromBlockchain();
    } catch (error) {
      console.log('⚠️ Using in-memory pending students due to blockchain error:', error.message);
    }
    
    const allPending = [...blockchainPending, ...pendingStudents];
    
    res.json({
      success: true,
      data: {
        pendingStudents: allPending,
        totalPending: allPending.length,
        source: blockchainPending.length > 0 ? 'blockchain' : 'memory'
      }
    });
  } catch (error) {
    console.error('Error reading pending mint:', error);
    res.status(500).json({
      error: 'Failed to read pending mint',
      message: error.message
    });
  }
});

// Move student from pending to completed (when admin mints NFT)
router.post('/complete-mint/:studentWallet', async (req, res) => {
  try {
    const { studentWallet } = req.params;
    const { tokenId, mintDate } = req.body;
    
    // Find student in pending list
    const studentIndex = pendingStudents.findIndex(
      student => student.studentWallet.toLowerCase() === studentWallet.toLowerCase()
    );
    
    if (studentIndex === -1) {
      return res.status(404).json({
        error: 'Student not found in pending list',
        message: 'This student is not in the pending mint list'
      });
    }
    
    const student = pendingStudents[studentIndex];
    
    // Remove from pending list
    pendingStudents.splice(studentIndex, 1);
    
    // Add to completed list
    const completedStudent = {
      ...student,
      tokenId: tokenId || crypto.randomBytes(16).toString('hex'),
      mintDate: mintDate || new Date().toISOString(),
      status: 'completed'
    };
    
    completedStudents.push(completedStudent);
    
    res.json({
      success: true,
      message: 'Student moved to completed mint list',
      data: {
        student: completedStudent,
        totalPending: pendingStudents.length,
        totalCompleted: completedStudents.length
      }
    });
    
  } catch (error) {
    console.error('Error completing mint:', error);
    res.status(500).json({
      error: 'Failed to complete mint',
      message: error.message
    });
  }
});

// Get completed mint students
router.get('/completed-mint', async (req, res) => {
  try {
    // Try to get from blockchain first, fallback to in-memory
    let blockchainCompleted = [];
    try {
      blockchainCompleted = await getCompletedStudentsFromBlockchain();
    } catch (error) {
      console.log('⚠️ Using in-memory completed students due to blockchain error:', error.message);
    }
    
    const allCompleted = [...blockchainCompleted, ...completedStudents];
    
    res.json({
      success: true,
      data: {
        completedStudents: allCompleted,
        totalCompleted: allCompleted.length,
        source: blockchainCompleted.length > 0 ? 'blockchain' : 'memory'
      }
    });
  } catch (error) {
    console.error('Error reading completed mint:', error);
    res.status(500).json({
      error: 'Failed to read completed mint',
      message: error.message
    });
  }
});

// Mint NFT certificate
router.post('/mint', async (req, res) => {
  try {
    const { 
      studentWallet, 
      studentId, 
      subject, 
      examSession, 
      examDate, 
      verificationTime, 
      ipAddress,
      imageHash 
    } = req.body;
    
    if (!studentWallet || !studentId || !subject || !examSession) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'studentWallet, studentId, subject, and examSession are required'
      });
    }

    // Check if NFT already exists for this student
    const hasNFT = await checkIfStudentHasNFT(studentWallet);
    if (hasNFT) {
      return res.status(400).json({
        error: 'NFT certificate already exists',
        message: 'Student already has an NFT certificate'
      });
    }

    // Check if student is whitelisted
    if (!examRegistrationContract) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'Exam registration contract is not initialized'
      });
    }

    const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentWallet);
    if (!isWhitelisted) {
      return res.status(400).json({
        error: 'Student not whitelisted',
        message: 'Student is not in the whitelist'
      });
    }
    
    // Create exam data
    const examData = {
      studentWallet,
      studentId,
      subject,
      examSession,
      examDate: examDate || Date.now(),
      verificationTime: verificationTime || Date.now(),
      ipAddress: ipAddress || 'Unknown',
      imageHash: imageHash || crypto.randomBytes(32).toString('hex'),
      mintDate: new Date().toISOString(),
      isValid: true
    };

    // Generate metadata
    const metadata = generateNFTMetadata(examData);

    // Mint NFT on blockchain
    if (!nftRegistryContractWrite) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'NFT registry contract write is not initialized'
      });
    }

    console.log('🔄 Minting NFT for student:', studentWallet);
    console.log('👤 Signer address:', await signer.getAddress());
    
    // Generate token URI for metadata
    const tokenURI = `https://ipfs.io/ipfs/${examData.imageHash}`;
    
    // Call smart contract to mint NFT with signer
    const mintTx = await nftRegistryContractWrite.mintCertificate(
      studentWallet,
      studentId,
      subject,
      examSession,
      ipAddress || 'Unknown',
      tokenURI
    );
    const receipt = await mintTx.wait();
    
    console.log('✅ NFT minted successfully. Transaction hash:', receipt.hash);
    
    // Get the token ID from the transaction
    const tokenId = await nftRegistryContract.getTotalCertificates();

    res.json({
      success: true,
      message: 'NFT certificate minted successfully on blockchain',
      data: {
        tokenId: tokenId.toString(),
        studentWallet,
        transactionHash: receipt.hash,
        metadata,
        mintDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error minting NFT:', error);
    res.status(500).json({
      error: 'Failed to mint NFT',
      message: error.message
    });
  }
});

// Get all NFT certificates from blockchain
router.get('/certificates', async (req, res) => {
  try {
    if (!nftRegistryContract) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'NFT registry contract is not initialized'
      });
    }

    const totalCertificates = await nftRegistryContract.getTotalCertificates();
    const certificates = [];

    // Get all certificates from blockchain
    for (let i = 1; i <= totalCertificates; i++) {
      try {
        const owner = await nftRegistryContract.ownerOf(i);
        const tokenURI = await nftRegistryContract.tokenURI(i);
        const examInfo = await nftRegistryContract.getExamInfo(i);
        const isValid = await nftRegistryContract.isCertificateValid(i);
        
        certificates.push({
          tokenId: i.toString(),
          owner,
          tokenURI,
          studentId: examInfo.studentId,
          subject: examInfo.subject,
          examSession: examInfo.examSession,
          isValid: isValid,
          mintDate: new Date(examInfo.verificationTime * 1000).toISOString()
        });
      } catch (error) {
        console.log(`⚠️ Error getting certificate ${i}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      data: {
        certificates,
        totalCertificates: certificates.length,
        validCertificates: certificates.filter(c => c.isValid).length,
        revokedCertificates: 0 // Blockchain NFTs can't be revoked in this implementation
      }
    });
  } catch (error) {
    console.error('Error getting NFT certificates:', error);
    res.status(500).json({
      error: 'Failed to get NFT certificates',
      message: error.message
    });
  }
});

// Get NFT metadata by token ID from blockchain
router.get('/metadata/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    if (!nftRegistryContract) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'NFT registry contract is not initialized'
      });
    }

    // Check if token exists
    try {
      const owner = await nftRegistryContract.ownerOf(tokenId);
      const tokenURI = await nftRegistryContract.tokenURI(tokenId);
      
      const nft = {
        tokenId,
        owner,
        tokenURI,
        isValid: true,
        mintDate: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: nft
      });
    } catch (error) {
      return res.status(404).json({
        error: 'NFT certificate not found',
        message: 'No NFT certificate found with this token ID'
      });
    }
  } catch (error) {
    console.error('Error getting NFT metadata:', error);
    res.status(500).json({
      error: 'Failed to get NFT metadata',
      message: error.message
    });
  }
});

// Revoke NFT certificate (admin only)
router.post('/revoke/:tokenId', (req, res) => {
  try {
    const { tokenId } = req.params;
    const { reason } = req.body;
    
    if (!tokenId) {
      return res.status(400).json({
        error: 'Missing token ID'
      });
    }

    // This logic needs to be updated to revoke on the blockchain
    // For now, we'll just update the in-memory data
    const studentIndex = pendingStudents.findIndex(
      student => student.tokenId === tokenId
    );

    if (studentIndex !== -1) {
      pendingStudents[studentIndex].isValid = false;
      pendingStudents[studentIndex].revocationDate = new Date().toISOString();
      pendingStudents[studentIndex].revocationReason = reason || 'Admin revocation';
      return res.json({
        success: true,
        message: 'NFT certificate revoked successfully (in-memory)',
        data: {
          tokenId,
          revocationDate: pendingStudents[studentIndex].revocationDate,
          revocationReason: pendingStudents[studentIndex].revocationReason
        }
      });
    }

    const completedIndex = completedStudents.findIndex(
      student => student.tokenId === tokenId
    );

    if (completedIndex !== -1) {
      completedStudents[completedIndex].isValid = false;
      completedStudents[completedIndex].revocationDate = new Date().toISOString();
      completedStudents[completedIndex].revocationReason = reason || 'Admin revocation';
      return res.json({
      success: true,
        message: 'NFT certificate revoked successfully (in-memory)',
      data: {
        tokenId,
          revocationDate: completedStudents[completedIndex].revocationDate,
          revocationReason: completedStudents[completedIndex].revocationReason
        }
      });
    }

    return res.status(404).json({
      error: 'NFT certificate not found',
      message: 'No NFT certificate found with this token ID'
    });

  } catch (error) {
    console.error('Error revoking NFT:', error);
    res.status(500).json({
      error: 'Failed to revoke NFT',
      message: error.message
    });
  }
});

// Add student to whitelist (admin only)
router.post('/whitelist/add', async (req, res) => {
  try {
    const { studentAddress } = req.body;
    
    if (!studentAddress) {
      return res.status(400).json({
        error: 'Missing student address',
        message: 'studentAddress is required'
      });
    }

    if (!examRegistrationContract) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'Exam registration contract is not initialized'
      });
    }

    // Check if student is already whitelisted
    const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAddress);
    if (isWhitelisted) {
      return res.status(400).json({
        error: 'Student already whitelisted',
        message: 'This student is already in the whitelist'
      });
    }

    console.log('🔄 Adding student to whitelist:', studentAddress);
    console.log('👤 Signer address:', await signer.getAddress());
    
    // Call smart contract to add student to whitelist
    const addTx = await examRegistrationContractWrite.addStudentToWhitelist(studentAddress);
    const receipt = await addTx.wait();
    
    console.log('✅ Student added to whitelist. Transaction hash:', receipt.hash);
    
    res.json({
      success: true,
      message: 'Student added to whitelist successfully on blockchain',
      data: {
        studentAddress,
        transactionHash: receipt.hash,
        addedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding student to whitelist:', error);
    res.status(500).json({
      error: 'Failed to add student to whitelist',
      message: error.message
    });
  }
});

// Get whitelist status
router.get('/whitelist/status/:studentAddress', async (req, res) => {
  try {
    const { studentAddress } = req.params;
    
    if (!examRegistrationContract) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'Exam registration contract is not initialized'
      });
    }

    const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAddress);
    const whitelistCount = await examRegistrationContract.whitelistCount();
    
    res.json({
      success: true,
      data: {
        studentAddress,
        isWhitelisted,
        whitelistCount: whitelistCount.toString(),
        checkedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking whitelist status:', error);
    res.status(500).json({
      error: 'Failed to check whitelist status',
      message: error.message
    });
  }
});

// Test mint NFT (for development/testing)
router.post('/test-mint', async (req, res) => {
  try {
    const { studentWallet } = req.body;
    
    if (!studentWallet) {
      return res.status(400).json({
        error: 'Missing student wallet',
        message: 'studentWallet is required'
      });
    }

    if (!nftRegistryContractWrite) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'NFT registry contract write is not initialized'
      });
    }

    // Check if student already has NFT
    const hasNFT = await checkIfStudentHasNFT(studentWallet);
    if (hasNFT) {
      return res.status(400).json({
        error: 'Student already has NFT',
        message: 'This student already has an NFT certificate'
      });
    }

    console.log('🔄 Test minting NFT for student:', studentWallet);
    console.log('👤 Signer address:', await signer.getAddress());
    
    // Test data
    const testData = {
      studentId: "TEST001",
      subject: "Blockchain Development",
      examSession: "Test Session",
      ipAddress: "127.0.0.1",
      tokenURI: "https://ipfs.io/ipfs/QmTest123"
    };
    
    // Call smart contract to mint NFT with signer
    const mintTx = await nftRegistryContractWrite.mintCertificate(
      studentWallet,
      testData.studentId,
      testData.subject,
      testData.examSession,
      testData.ipAddress,
      testData.tokenURI
    );
    const receipt = await mintTx.wait();
    
    console.log('✅ Test NFT minted successfully. Transaction hash:', receipt.hash);
    
    // Get the token ID
    const tokenId = await nftRegistryContract.getTotalCertificates();
    
    res.json({
      success: true,
      message: 'Test NFT minted successfully on blockchain',
      data: {
        tokenId: tokenId.toString(),
        studentWallet,
        transactionHash: receipt.hash,
        testData,
        mintDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error test minting NFT:', error);
    res.status(500).json({
      error: 'Failed to test mint NFT',
      message: error.message
    });
  }
});

// Get contract status
router.get('/contract-status', async (req, res) => {
  try {
    const status = {
      nftContract: {
        address: EXAM_NFT_REGISTRY_ADDRESS,
        initialized: !!nftRegistryContract,
        totalCertificates: 0,
        owner: null
      },
      registrationContract: {
        address: EXAM_REGISTRATION_ADDRESS,
        initialized: !!examRegistrationContract,
        whitelistCount: 0,
        owner: null
      }
    };

    if (nftRegistryContract) {
      try {
        status.nftContract.totalCertificates = (await nftRegistryContract.getTotalCertificates()).toString();
        status.nftContract.owner = await nftRegistryContract.owner();
      } catch (error) {
        console.log('⚠️ Error getting NFT contract status:', error.message);
      }
    }

    if (examRegistrationContract) {
      try {
        status.registrationContract.whitelistCount = (await examRegistrationContract.whitelistCount()).toString();
        status.registrationContract.owner = await examRegistrationContract.owner();
      } catch (error) {
        console.log('⚠️ Error getting registration contract status:', error.message);
      }
    }

    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('❌ Error getting contract status:', error);
    res.status(500).json({
      error: 'Failed to get contract status',
      message: error.message
    });
  }
});

// Test add to whitelist (for development/testing)
router.post('/test-whitelist', async (req, res) => {
  try {
    const { studentAddress } = req.body;
    
    if (!studentAddress) {
      return res.status(400).json({
        error: 'Missing student address',
        message: 'studentAddress is required'
      });
    }

    if (!examRegistrationContractWrite) {
      return res.status(500).json({
        error: 'Contract not available',
        message: 'Exam registration contract write is not initialized'
      });
    }

    // Check if student is already whitelisted
    const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAddress);
    if (isWhitelisted) {
      return res.status(400).json({
        error: 'Student already whitelisted',
        message: 'This student is already in the whitelist'
      });
    }

    console.log('🔄 Test adding student to whitelist:', studentAddress);
    console.log('👤 Signer address:', await signer.getAddress());
    
    // Call smart contract to add student to whitelist
    const addTx = await examRegistrationContractWrite.addStudentToWhitelist(studentAddress);
    const receipt = await addTx.wait();
    
    console.log('✅ Test student added to whitelist. Transaction hash:', receipt.hash);
    
    res.json({
      success: true,
      message: 'Test student added to whitelist successfully on blockchain',
      data: {
        studentAddress,
        transactionHash: receipt.hash,
        addedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error test adding to whitelist:', error);
    res.status(500).json({
      error: 'Failed to test add to whitelist',
      message: error.message
    });
  }
});

module.exports = router; 
 
 
 