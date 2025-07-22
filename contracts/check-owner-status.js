const { ethers } = require("hardhat");

async function checkOwnerStatus() {
  console.log("🔍 Checking owner status...");
  
  try {
    // Get contract addresses
    const contractAddresses = require('../frontend/src/contracts/contract-address.json');
    console.log("📋 Contract addresses:", contractAddresses);
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
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
      console.log("🎯 Use this account for NFT minting");
    } else {
      console.log("❌ NFT owner account not found in available accounts");
    }
    
    if (registrationOwnerAccount) {
      console.log("✅ Registration owner account found:", registrationOwnerAccount.address);
    } else {
      console.log("❌ Registration owner account not found in available accounts");
    }
    
    // Check if any student has NFT
    const testAddresses = [
      "0x4EE204518233e2e71025C75E59eF204435479844",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    ];
    
    console.log("\n📋 Checking NFT status for test addresses:");
    for (const address of testAddresses) {
      try {
        const tokenId = await examCertificateNFT.getTokenIdByWallet(address);
        console.log(`   ${address}: Token ID ${tokenId.toString()}`);
        if (tokenId > 0) {
          console.log(`      ⚠️ Already has NFT`);
        } else {
          console.log(`      ✅ No NFT, can mint`);
        }
      } catch (error) {
        console.log(`   ${address}: Error checking - ${error.message}`);
      }
    }
    
    console.log("\n💡 Instructions:");
    console.log("1. Make sure you're connected with the owner account in MetaMask");
    console.log("2. Owner account should be:", nftOwner);
    console.log("3. Use an address that doesn't have NFT yet for testing");
    
  } catch (error) {
    console.error("❌ Error checking owner status:", error);
  }
}

checkOwnerStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 