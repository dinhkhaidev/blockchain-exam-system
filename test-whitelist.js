const { ethers } = require("hardhat");

async function testWhitelist() {
  try {
    console.log("🧪 Testing whitelist functionality...");
    
    // Contract address
    const CONTRACT_ADDRESS = "0x7B98682d9325d8E2602dD214155d320031e0e82c";
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("");
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
    // Get contract instance
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const contract = ExamRegistration.attach(CONTRACT_ADDRESS);
    
    // Get signer
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    console.log("🔗 Signer address:", signerAddress);
    
    // Check owner
    const owner = await contract.owner();
    console.log("👑 Contract owner:", owner);
    console.log("✅ Is signer owner:", signerAddress.toLowerCase() === owner.toLowerCase());
    console.log("");
    
    // Test addresses
    const testAddresses = [
      "0x8e4cf11a8f982c0cfd54f3f1f6a0db91f0c1b30a", // From error
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    ];
    
    for (const address of testAddresses) {
      console.log(`🔍 Testing address: ${address}`);
      
      // Check if already whitelisted
      const isWhitelisted = await contract.isStudentWhitelisted(address);
      console.log(`   Whitelisted: ${isWhitelisted}`);
      
      if (!isWhitelisted) {
        try {
          console.log(`   🔄 Adding to whitelist...`);
          const tx = await contract.addStudentToWhitelist(address);
          await tx.wait();
          console.log(`   ✅ Successfully added to whitelist`);
          
          // Verify
          const isWhitelistedAfter = await contract.isStudentWhitelisted(address);
          console.log(`   Verified: ${isWhitelistedAfter}`);
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ℹ️  Already in whitelist`);
      }
      console.log("");
    }
    
    console.log("✅ Test completed!");
    
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

testWhitelist()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 