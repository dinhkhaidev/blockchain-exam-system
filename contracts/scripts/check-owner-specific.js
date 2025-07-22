const hre = require("hardhat");

async function main() {
  try {
    console.log("🔍 Checking contract owner with specific account...");
    
    // Địa chỉ account bạn muốn check
    const TARGET_ADDRESS = "0xb873ad3db908b6689e53ef8da3f36d82c7bdef84";
    
    console.log("🎯 Target address:", TARGET_ADDRESS);
    console.log("");
    
    // Đọc contract addresses từ file
    const fs = require("fs");
    const path = require("path");
    const contractAddressFile = path.join(__dirname, "..", "..", "frontend", "src", "contracts", "contract-address.json");
    
    if (!fs.existsSync(contractAddressFile)) {
      console.log("❌ Contract address file not found. Please deploy contracts first.");
      return;
    }
    
    const contractData = JSON.parse(fs.readFileSync(contractAddressFile, "utf8"));
    const examRegistrationAddress = contractData.ExamRegistration;
    
    console.log("📋 Contract Addresses:");
    console.log("ExamRegistration:", examRegistrationAddress);
    console.log("ExamCertificateNFT:", contractData.ExamCertificateNFT);
    console.log("");
    
    // Lấy contract instance
    const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
    const examRegistration = ExamRegistration.attach(examRegistrationAddress);
    
    // Check current owner
    const currentOwner = await examRegistration.owner();
    console.log("👑 Current owner:", currentOwner);
    
    // Check if target address is owner
    if (currentOwner.toLowerCase() === TARGET_ADDRESS.toLowerCase()) {
      console.log("✅ Target address IS the owner");
    } else {
      console.log("❌ Target address is NOT the owner");
    }
    
    // Check whitelist status for target address
    const isWhitelisted = await examRegistration.isStudentWhitelisted(TARGET_ADDRESS);
    console.log("📝 Whitelist status for target address:", isWhitelisted ? "✅ Whitelisted" : "❌ Not whitelisted");
    
    // Check registration status for target address
    const isRegistered = await examRegistration.isStudentRegistered(TARGET_ADDRESS);
    console.log("📝 Registration status for target address:", isRegistered ? "✅ Registered" : "❌ Not registered");
    
    // Check verification status for target address
    const isVerified = await examRegistration.isStudentVerified(TARGET_ADDRESS);
    console.log("📝 Verification status for target address:", isVerified ? "✅ Verified" : "❌ Not verified");
    
    console.log("");
    console.log("💡 Summary:");
    console.log("- Owner:", currentOwner);
    console.log("- Target:", TARGET_ADDRESS);
    console.log("- Is Owner:", currentOwner.toLowerCase() === TARGET_ADDRESS.toLowerCase());
    console.log("- Is Whitelisted:", isWhitelisted);
    console.log("- Is Registered:", isRegistered);
    console.log("- Is Verified:", isVerified);
    
  } catch (error) {
    console.error("❌ Error checking owner:", error.message);
    console.log("");
    console.log("💡 Troubleshooting:");
    console.log("1. Make sure contracts are deployed");
    console.log("2. Check if Ganache is running");
    console.log("3. Verify contract addresses are correct");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 