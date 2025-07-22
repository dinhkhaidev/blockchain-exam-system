const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts...");
  
  // Deploy ExamRegistration
  const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
  const examRegistration = await ExamRegistration.deploy();
  await examRegistration.waitForDeployment();
  
  const examRegistrationAddress = await examRegistration.getAddress();
  console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);
  
  // Deploy ExamCertificateNFT
  const ExamCertificateNFT = await hre.ethers.getContractFactory("ExamCertificateNFT");
  const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
  await examCertificateNFT.waitForDeployment();
  
  const examCertificateNFTAddress = await examCertificateNFT.getAddress();
  console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer (Owner):", deployer.address);
  
  console.log("");
  console.log("🎉 Deployment completed!");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("ExamRegistration:", examRegistrationAddress);
  console.log("ExamCertificateNFT:", examCertificateNFTAddress);
  console.log("Owner:", deployer.address);
  console.log("");
  console.log("💡 Next steps:");
  console.log("1. Update frontend/src/contexts/Web3Context.js with new addresses");
  console.log("2. Restart frontend application");
  console.log("3. Connect wallet and access Admin Dashboard");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 

async function main() {
  console.log("🚀 Deploying contracts...");
  
  // Deploy ExamRegistration
  const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
  const examRegistration = await ExamRegistration.deploy();
  await examRegistration.waitForDeployment();
  
  const examRegistrationAddress = await examRegistration.getAddress();
  console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);
  
  // Deploy ExamCertificateNFT
  const ExamCertificateNFT = await hre.ethers.getContractFactory("ExamCertificateNFT");
  const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
  await examCertificateNFT.waitForDeployment();
  
  const examCertificateNFTAddress = await examCertificateNFT.getAddress();
  console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer (Owner):", deployer.address);
  
  console.log("");
  console.log("🎉 Deployment completed!");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("ExamRegistration:", examRegistrationAddress);
  console.log("ExamCertificateNFT:", examCertificateNFTAddress);
  console.log("Owner:", deployer.address);
  console.log("");
  console.log("💡 Next steps:");
  console.log("1. Update frontend/src/contexts/Web3Context.js with new addresses");
  console.log("2. Restart frontend application");
  console.log("3. Connect wallet and access Admin Dashboard");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 

async function main() {
  console.log("🚀 Deploying contracts...");
  
  // Deploy ExamRegistration
  const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
  const examRegistration = await ExamRegistration.deploy();
  await examRegistration.waitForDeployment();
  
  const examRegistrationAddress = await examRegistration.getAddress();
  console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);
  
  // Deploy ExamCertificateNFT
  const ExamCertificateNFT = await hre.ethers.getContractFactory("ExamCertificateNFT");
  const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
  await examCertificateNFT.waitForDeployment();
  
  const examCertificateNFTAddress = await examCertificateNFT.getAddress();
  console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer (Owner):", deployer.address);
  
  console.log("");
  console.log("🎉 Deployment completed!");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("ExamRegistration:", examRegistrationAddress);
  console.log("ExamCertificateNFT:", examCertificateNFTAddress);
  console.log("Owner:", deployer.address);
  console.log("");
  console.log("💡 Next steps:");
  console.log("1. Update frontend/src/contexts/Web3Context.js with new addresses");
  console.log("2. Restart frontend application");
  console.log("3. Connect wallet and access Admin Dashboard");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 

async function main() {
  console.log("🚀 Deploying contracts...");
  
  // Deploy ExamRegistration
  const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
  const examRegistration = await ExamRegistration.deploy();
  await examRegistration.waitForDeployment();
  
  const examRegistrationAddress = await examRegistration.getAddress();
  console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);
  
  // Deploy ExamCertificateNFT
  const ExamCertificateNFT = await hre.ethers.getContractFactory("ExamCertificateNFT");
  const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
  await examCertificateNFT.waitForDeployment();
  
  const examCertificateNFTAddress = await examCertificateNFT.getAddress();
  console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer (Owner):", deployer.address);
  
  console.log("");
  console.log("🎉 Deployment completed!");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("ExamRegistration:", examRegistrationAddress);
  console.log("ExamCertificateNFT:", examCertificateNFTAddress);
  console.log("Owner:", deployer.address);
  console.log("");
  console.log("💡 Next steps:");
  console.log("1. Update frontend/src/contexts/Web3Context.js with new addresses");
  console.log("2. Restart frontend application");
  console.log("3. Connect wallet and access Admin Dashboard");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 