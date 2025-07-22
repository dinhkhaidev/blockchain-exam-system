const hre = require("hardhat");

async function main() {
  try {
    console.log("🔍 Checking current contract owner...");
    
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
    
    // Check if connected account is owner
    const [deployer] = await hre.ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("🔗 Connected account:", deployerAddress);
    
    if (currentOwner.toLowerCase() === deployerAddress.toLowerCase()) {
      console.log("✅ Connected account IS the owner");
    } else {
      console.log("❌ Connected account is NOT the owner");
    }
    
    // Check whitelist status
    const isWhitelisted = await examRegistration.isStudentWhitelisted(deployerAddress);
    console.log("📝 Whitelist status:", isWhitelisted ? "✅ Whitelisted" : "❌ Not whitelisted");
    
    console.log("");
    console.log("💡 To become owner:");
    console.log("1. Deploy contracts with your address as owner");
    console.log("2. Or transfer ownership to your address");
    
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