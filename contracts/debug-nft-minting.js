const { ethers } = require("hardhat");

async function debugNFTMinting() {
  try {
    console.log("🔍 Debugging NFT minting issue...");
    
    // Contract addresses
    const EXAM_REGISTRATION_ADDRESS = "0x7B98682d9325d8E2602dD214155d320031e0e82c";
    const EXAM_CERTIFICATE_NFT_ADDRESS = "0xb7282FB4979D0EF4e0EB81207517385E01E4cBEF";
    
    console.log("📋 Contract Addresses:");
    console.log("ExamRegistration:", EXAM_REGISTRATION_ADDRESS);
    console.log("ExamCertificateNFT:", EXAM_CERTIFICATE_NFT_ADDRESS);
    console.log("");
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
    // Get contract instances
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const examRegistration = ExamRegistration.attach(EXAM_REGISTRATION_ADDRESS);
    
    const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
    const examCertificateNFT = ExamCertificateNFT.attach(EXAM_CERTIFICATE_NFT_ADDRESS);
    
    // Test addresses
    const testAddresses = [
      '0x8e4cf11a8f982c0cfd54f3f1f6a0db91f0c1b30a',
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
    ];
    
    console.log("🔍 Checking student status for NFT eligibility:");
    console.log("");
    
    for (const address of testAddresses) {
      console.log(`🎯 Checking address: ${address}`);
      
      try {
        // Check registration status
        const isRegistered = await examRegistration.isStudentRegistered(address);
        console.log(`   📝 Is Registered: ${isRegistered}`);
        
        // Check verification status
        const isVerified = await examRegistration.isStudentVerified(address);
        console.log(`   ✅ Is Verified: ${isVerified}`);
        
        // Check whitelist status
        const isWhitelisted = await examRegistration.isStudentWhitelisted(address);
        console.log(`   📋 Is Whitelisted: ${isWhitelisted}`);
        
        // Get student info if registered
        if (isRegistered) {
          try {
            const studentInfo = await examRegistration.getStudentInfo(address);
            console.log(`   📋 Student Info:`);
            console.log(`      Student ID: ${studentInfo.studentId}`);
            console.log(`      Subject: ${studentInfo.subject}`);
            console.log(`      Exam Session: ${studentInfo.examSession}`);
            console.log(`      Is Registered: ${studentInfo.isRegistered}`);
            console.log(`      Is Verified: ${studentInfo.isVerified}`);
          } catch (error) {
            console.log(`   ❌ Error getting student info: ${error.message}`);
          }
        }
        
        // Check NFT status
        try {
          const balance = await examCertificateNFT.balanceOf(address);
          console.log(`   🎨 NFT Balance: ${balance.toString()}`);
          
          if (balance > 0) {
            console.log(`   ✅ Student already has NFT`);
          } else {
            console.log(`   ❌ Student has no NFT`);
          }
        } catch (error) {
          console.log(`   ❌ Error checking NFT balance: ${error.message}`);
        }
        
        // Determine eligibility
        const isEligibleForNFT = isRegistered && isVerified && isWhitelisted;
        console.log(`   🎯 Eligible for NFT: ${isEligibleForNFT ? 'YES' : 'NO'}`);
        
        if (isEligibleForNFT) {
          console.log(`   ➕ Should appear in admin's pending list`);
        } else {
          console.log(`   ❌ Will NOT appear in admin's pending list`);
          if (!isRegistered) console.log(`      Reason: Not registered`);
          if (!isVerified) console.log(`      Reason: Not verified`);
          if (!isWhitelisted) console.log(`      Reason: Not whitelisted`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking address: ${error.message}`);
      }
      
      console.log("");
    }
    
    // Check total NFTs minted
    try {
      console.log("📊 NFT Contract Status:");
      const totalSupply = await examCertificateNFT.totalSupply();
      console.log(`   Total NFTs minted: ${totalSupply.toString()}`);
      
      // Check owner
      const owner = await examCertificateNFT.owner();
      console.log(`   NFT Contract Owner: ${owner}`);
      
    } catch (error) {
      console.log(`❌ Error checking NFT contract: ${error.message}`);
    }
    
    console.log("✅ Debug completed!");
    
  } catch (error) {
    console.error("❌ Debug error:", error);
  }
}

debugNFTMinting()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 