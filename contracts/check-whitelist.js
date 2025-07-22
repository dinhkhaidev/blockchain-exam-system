const { ethers } = require("hardhat");

async function checkWhitelist() {
  try {
    console.log("🔍 Checking whitelist status...");
    
    // Contract address
    const CONTRACT_ADDRESS = "0x7B98682d9325d8E2602dD214155d320031e0e82c";
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("");
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
    // Get contract instance
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const contract = ExamRegistration.attach(CONTRACT_ADDRESS);
    
    // Check owner
    const owner = await contract.owner();
    console.log("👑 Contract owner:", owner);
    console.log("");
    
    // Addresses to check
    const addressesToCheck = [
      "0x8e4cf11a8f982c0cfd54f3f1f6a0db91f0c1b30a", // From error
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
    ];
    
    console.log("📋 Checking whitelist status for addresses:");
    console.log("");
    
    for (const address of addressesToCheck) {
      try {
        const isWhitelisted = await contract.isStudentWhitelisted(address);
        console.log(`${address}: ${isWhitelisted ? '✅ Whitelisted' : '❌ Not whitelisted'}`);
      } catch (error) {
        console.log(`${address}: ❌ Error checking - ${error.message}`);
      }
    }
    
    console.log("");
    console.log("✅ Check completed!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkWhitelist()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 