const { ethers } = require("hardhat");

async function debugWhitelist() {
  try {
    console.log("🔍 Debugging whitelist issue...");
    
    // Contract address from the error
    const CONTRACT_ADDRESS = "0x7B98682d9325d8E2602dD214155d320031e0e82c";
    const OWNER_ADDRESS = "0xB873AD3DB908B6689e53Ef8dA3f36d82C7bdEF84";
    const STUDENT_ADDRESS = "0x8e4cf11a8f982c0cfd54f3f1f6a0db91f0c1b30a"; // From error message
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("👑 Owner Address:", OWNER_ADDRESS);
    console.log("👤 Student Address:", STUDENT_ADDRESS);
    console.log("");
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
    // Get contract instance
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const contract = ExamRegistration.attach(CONTRACT_ADDRESS);
    
    // Check current owner
    console.log("🔍 Checking contract owner...");
    const currentOwner = await contract.owner();
    console.log("👑 Current owner:", currentOwner);
    console.log("✅ Owner matches:", currentOwner.toLowerCase() === OWNER_ADDRESS.toLowerCase());
    console.log("");
    
    // Check if student is already whitelisted
    console.log("🔍 Checking if student is already whitelisted...");
    const isWhitelisted = await contract.isStudentWhitelisted(STUDENT_ADDRESS);
    console.log("📝 Student whitelisted:", isWhitelisted);
    console.log("");
    
    // Check if address is valid (not zero)
    console.log("🔍 Checking address validity...");
    const isZeroAddress = STUDENT_ADDRESS === "0x0000000000000000000000000000000000000000";
    console.log("❌ Is zero address:", isZeroAddress);
    console.log("");
    
    // Try to add student to whitelist
    console.log("🔄 Attempting to add student to whitelist...");
    
    // Get signer (owner)
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    console.log("🔗 Signer address:", signerAddress);
    console.log("✅ Signer is owner:", signerAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase());
    console.log("");
    
    if (signerAddress.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
      console.log("❌ Signer is not the owner. Cannot proceed.");
      return;
    }
    
    try {
      const tx = await contract.addStudentToWhitelist(STUDENT_ADDRESS);
      console.log("📋 Transaction hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Transaction successful! Block:", receipt.blockNumber);
      
      // Verify the student was added
      const isWhitelistedAfter = await contract.isStudentWhitelisted(STUDENT_ADDRESS);
      console.log("📝 Student whitelisted after:", isWhitelistedAfter);
      
    } catch (error) {
      console.error("❌ Error adding student to whitelist:");
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error data:", error.data);
      
      // Try to decode the error
      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);
          console.error("   Decoded error:", decodedError);
        } catch (decodeError) {
          console.error("   Could not decode error");
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Script error:", error);
  }
}

debugWhitelist()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 