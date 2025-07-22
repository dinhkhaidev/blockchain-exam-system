const { ethers } = require("hardhat");

async function checkContractDeployment() {
  console.log("🔍 Checking contract deployment...");
  
  try {
    // Get contract addresses
    const contractAddresses = require('../frontend/src/contracts/contract-address.json');
    console.log("📋 Contract addresses:", contractAddresses);
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
    // Check if contracts exist
    const nftCode = await provider.getCode(contractAddresses.examCertificateNFT);
    const registrationCode = await provider.getCode(contractAddresses.examRegistration);
    
    console.log("📋 NFT Contract deployed:", nftCode !== "0x");
    console.log("📋 Registration Contract deployed:", registrationCode !== "0x");
    
    if (nftCode === "0x") {
      console.log("❌ NFT Contract not deployed!");
      return;
    }
    
    if (registrationCode === "0x") {
      console.log("❌ Registration Contract not deployed!");
      return;
    }
    
    // Get contract instances
    const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
    const examCertificateNFT = ExamCertificateNFT.attach(contractAddresses.examCertificateNFT);
    
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const examRegistration = ExamRegistration.attach(contractAddresses.examRegistration);
    
    // Check owners
    const nftOwner = await examCertificateNFT.owner();
    const registrationOwner = await examRegistration.owner();
    
    console.log("👑 NFT Contract owner:", nftOwner);
    console.log("👑 Registration Contract owner:", registrationOwner);
    
    // Get accounts
    const accounts = await ethers.getSigners();
    console.log("👤 Available accounts:");
    accounts.forEach((account, index) => {
      console.log(`   ${index}: ${account.address}`);
    });
    
    // Check which account is owner
    const nftOwnerAccount = accounts.find(acc => acc.address.toLowerCase() === nftOwner.toLowerCase());
    const registrationOwnerAccount = accounts.find(acc => acc.address.toLowerCase() === registrationOwner.toLowerCase());
    
    if (nftOwnerAccount) {
      console.log("✅ NFT owner account found:", nftOwnerAccount.address);
    } else {
      console.log("❌ NFT owner account not found in available accounts");
    }
    
    if (registrationOwnerAccount) {
      console.log("✅ Registration owner account found:", registrationOwnerAccount.address);
    } else {
      console.log("❌ Registration owner account not found in available accounts");
    }
    
    // Test mint function
    if (nftOwnerAccount) {
      try {
        console.log("🧪 Testing mint function...");
        
        const testData = {
          studentWallet: "0x4EE204518233e2e71025C75E59eF204435479844",
          studentId: "TEST123",
          subject: "Test Subject",
          examSession: "Test Session",
          ipAddress: "127.0.0.1",
          tokenURI: JSON.stringify({
            name: "Test Certificate",
            description: "Test certificate for debugging"
          })
        };
        
        // Check if student already has NFT
        const existingTokenId = await examCertificateNFT.getTokenIdByWallet(testData.studentWallet);
        console.log("📋 Existing token ID:", existingTokenId.toString());
        
        if (existingTokenId > 0) {
          console.log("⚠️ Student already has NFT, minting will fail");
        } else {
          console.log("✅ Student has no NFT, minting should work");
          
          // Estimate gas
          const gasEstimate = await examCertificateNFT.mintCertificate.estimateGas(
            testData.studentWallet,
            testData.studentId,
            testData.subject,
            testData.examSession,
            testData.ipAddress,
            testData.tokenURI
          );
          
          console.log("✅ Gas estimate successful:", gasEstimate.toString());
        }
        
      } catch (error) {
        console.error("❌ Error testing mint function:", error.message);
      }
    }
    
    console.log("✅ Contract deployment check completed!");
    
  } catch (error) {
    console.error("❌ Error checking contract deployment:", error);
  }
}

checkContractDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 