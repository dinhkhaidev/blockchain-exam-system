const hre = require("hardhat");

async function main() {
  try {
    console.log("🚀 Deploying contracts with custom owner...");
    
    // Địa chỉ ví sẽ trở thành owner - ĐẢM BẢO ĐÚNG ĐỊA CHỈ CỦA BẠN
    const OWNER_ADDRESS = "0xb873ad3db908b6689e53ef8da3f36d82c7bdef84";
    
    console.log("👑 Owner address:", OWNER_ADDRESS);
    console.log("");
    
    // Deploy ExamRegistration contract
    console.log("📝 Deploying ExamRegistration contract...");
    const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
    const examRegistration = await ExamRegistration.deploy();
    await examRegistration.waitForDeployment();
    
    const examRegistrationAddress = await examRegistration.getAddress();
    console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);
    
    // Deploy ExamCertificateNFT contract
    console.log("🎨 Deploying ExamCertificateNFT contract...");
    const ExamCertificateNFT = await hre.ethers.getContractFactory("ExamCertificateNFT");
    const examCertificateNFT = await ExamCertificateNFT.deploy();
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
    
    // Lưu địa chỉ contracts vào file
    const fs = require("fs");
    const path = require("path");
    const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
    
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    const contractsData = {
      ExamRegistration: examRegistrationAddress,
      ExamCertificateNFT: examCertificateNFTAddress,
      network: hre.network.name,
      owner: newOwner
    };

    fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify(contractsData, undefined, 2)
    );

    console.log("📄 Contract addresses saved to frontend/src/contracts/contract-address.json");
    
    // Copy contract artifacts to frontend
    console.log("📋 Copying contract artifacts to frontend...");
    const examRegArtifact = path.join(__dirname, "..", "artifacts", "contracts", "ExamRegistration.sol", "ExamRegistration.json");
    const examNFTArtifact = path.join(__dirname, "..", "artifacts", "contracts", "ExamCertificateNFT.sol", "ExamCertificateNFT.json");
    
    if (fs.existsSync(examRegArtifact)) {
      fs.copyFileSync(examRegArtifact, path.join(contractsDir, "ExamRegistration.json"));
      console.log("✅ ExamRegistration.json copied");
    }
    
    if (fs.existsSync(examNFTArtifact)) {
      fs.copyFileSync(examNFTArtifact, path.join(contractsDir, "ExamCertificateNFT.json"));
      console.log("✅ ExamCertificateNFT.json copied");
    }
    
    console.log("");
    console.log("🎉 Deployment completed successfully!");
    console.log("");
    console.log("📋 Contract Addresses:");
    console.log("ExamRegistration:", examRegistrationAddress);
    console.log("ExamCertificateNFT:", examCertificateNFTAddress);
    console.log("Owner:", newOwner);
    console.log("");
    console.log("💡 Next steps:");
    console.log("1. Restart frontend application");
    console.log("2. Connect MetaMask with owner account");
    console.log("3. Access Admin Dashboard");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.log("");
    console.log("💡 Troubleshooting:");
    console.log("1. Make sure Ganache is running on port 7545");
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