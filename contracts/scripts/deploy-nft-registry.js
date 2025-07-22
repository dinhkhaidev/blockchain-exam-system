const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ExamNFTRegistry contract...");

  // Get the contract factory
  const ExamNFTRegistry = await ethers.getContractFactory("ExamNFTRegistry");
  
  // Deploy the contract
  const nftRegistry = await ExamNFTRegistry.deploy();
  
  // Wait for deployment to finish
  await nftRegistry.deployed();

  console.log("✅ ExamNFTRegistry deployed to:", nftRegistry.address);
  console.log("👑 Contract owner:", await nftRegistry.owner());
  
  // Save contract address to file
  const fs = require('fs');
  const contractAddresses = {
    examNFTRegistry: nftRegistry.address
  };
  
  fs.writeFileSync(
    './contract-addresses.json',
    JSON.stringify(contractAddresses, null, 2)
  );
  
  console.log("📝 Contract addresses saved to contract-addresses.json");
  
  return nftRegistry;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 