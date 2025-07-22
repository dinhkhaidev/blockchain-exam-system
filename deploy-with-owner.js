const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("🚀 Deploying contracts with custom owner...");
    
    // Địa chỉ ví sẽ trở thành owner
    const OWNER_ADDRESS = "0x4ee204518233e2e71025c75e59ef204435479844";
    
    console.log("👑 Owner address:", OWNER_ADDRESS);
    console.log("");
    
    // Deploy ExamRegistration contract
    console.log("📝 Deploying ExamRegistration contract...");
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const examRegistration = await ExamRegistration.deploy();
    await examRegistration.waitForDeployment();
    
    const examRegistrationAddress = await examRegistration.getAddress();
    console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);
    
    // Deploy ExamCertificateNFT contract
    console.log("🎨 Deploying ExamCertificateNFT contract...");
    const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
    const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
    await examCertificateNFT.waitForDeployment();
    
    const examCertificateNFTAddress = await examCertificateNFT.getAddress();
    console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);
    
    // Transfer ownership to target address
    console.log("🔄 Transferring ownership...");
    const tx = await examRegistration.transferOwnership(OWNER_ADDRESS);
    await tx.wait();
    
    // Verify ownership
    const newOwner = await examRegistration.owner();
    console.log("✅ New owner:", newOwner);
    
    console.log("");
    console.log("🎉 Deployment completed successfully!");
    console.log("");
    console.log("📋 Contract Addresses:");
    console.log("ExamRegistration:", examRegistrationAddress);
    console.log("ExamCertificateNFT:", examCertificateNFTAddress);
    console.log("Owner:", newOwner);
    console.log("");
    console.log("💡 Next steps:");
    console.log("1. Update frontend/src/contexts/Web3Context.js with new addresses");
    console.log("2. Restart frontend application");
    console.log("3. Connect wallet and access Admin Dashboard");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.log("");
    console.log("💡 Troubleshooting:");
    console.log("1. Make sure Ganache is running");
    console.log("2. Check if the address is valid");
    console.log("3. Ensure you have enough ETH for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
 
 
 