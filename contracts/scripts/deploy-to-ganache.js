const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts to Ganache...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying contracts with account:", deployer.address);
  
  // Get balance using provider
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy ExamNFTRegistry
  console.log("\n📦 Deploying ExamNFTRegistry...");
  const ExamNFTRegistry = await ethers.getContractFactory("ExamNFTRegistry");
  const examNFTRegistry = await ExamNFTRegistry.deploy();
  await examNFTRegistry.waitForDeployment();
  const examNFTRegistryAddress = await examNFTRegistry.getAddress();
  console.log("✅ ExamNFTRegistry deployed to:", examNFTRegistryAddress);

  // Deploy ExamRegistration
  console.log("\n📦 Deploying ExamRegistration...");
  const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
  const examRegistration = await ExamRegistration.deploy();
  await examRegistration.waitForDeployment();
  const examRegistrationAddress = await examRegistration.getAddress();
  console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);

  // Deploy ExamCertificateNFT
  console.log("\n📦 Deploying ExamCertificateNFT...");
  const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
  const examCertificateNFT = await ExamCertificateNFT.deploy();
  await examCertificateNFT.waitForDeployment();
  const examCertificateNFTAddress = await examCertificateNFT.getAddress();
  console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);

  // Verify ownership
  console.log("\n🔍 Verifying contract ownership...");
  const registryOwner = await examNFTRegistry.owner();
  const registrationOwner = await examRegistration.owner();
  const nftOwner = await examCertificateNFT.owner();

  console.log("👑 ExamNFTRegistry owner:", registryOwner);
  console.log("👑 ExamRegistration owner:", registrationOwner);
  console.log("👑 ExamCertificateNFT owner:", nftOwner);

  if (registryOwner === deployer.address && 
      registrationOwner === deployer.address && 
      nftOwner === deployer.address) {
    console.log("✅ All contracts owned by deployer");
  } else {
    console.log("❌ Ownership verification failed");
  }

  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  try {
    // Test ExamNFTRegistry
    const pendingCount = await examNFTRegistry.getPendingCount();
    const completedCount = await examNFTRegistry.getCompletedCount();
    console.log("📊 ExamNFTRegistry - Pending:", pendingCount.toString());
    console.log("📊 ExamNFTRegistry - Completed:", completedCount.toString());

    // Test ExamRegistration
    const isOwner = await examRegistration.owner();
    console.log("👑 ExamRegistration owner:", isOwner);

    // Test ExamCertificateNFT
    const nftOwner = await examCertificateNFT.owner();
    console.log("👑 ExamCertificateNFT owner:", nftOwner);

    console.log("✅ Basic functionality tests passed");
  } catch (error) {
    console.log("❌ Basic functionality tests failed:", error.message);
  }

  // Save contract addresses
  const contractAddresses = {
    examNFTRegistry: examNFTRegistryAddress,
    examRegistration: examRegistrationAddress,
    examCertificateNFT: examCertificateNFTAddress,
    deployer: deployer.address,
    network: "ganache",
    chainId: 1337
  };

  console.log("\n📋 Contract Addresses:");
  console.log("ExamNFTRegistry:", examNFTRegistryAddress);
  console.log("ExamRegistration:", examRegistrationAddress);
  console.log("ExamCertificateNFT:", examCertificateNFTAddress);

  // Save to file for easy access
  const fs = require('fs');
  const path = require('path');
  
  // Save to contracts directory
  fs.writeFileSync(
    path.join(__dirname, '../deployed-addresses.json'),
    JSON.stringify(contractAddresses, null, 2)
  );

  // Save to frontend
  fs.writeFileSync(
    path.join(__dirname, '../../frontend/src/contracts/contract-address.json'),
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("\n💾 Contract addresses saved to:");
  console.log("- contracts/deployed-addresses.json");
  console.log("- frontend/src/contracts/contract-address.json");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Update backend .env file with contract addresses");
  console.log("2. Start backend: cd backend && npm start");
  console.log("3. Start frontend: cd frontend && npm start");
  console.log("4. Connect MetaMask to Ganache (Chain ID: 1337)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 