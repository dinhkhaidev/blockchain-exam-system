const hre = require("hardhat");

async function main() {
  console.log("🚀 Bắt đầu deploy smart contracts...");

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

  // Deploy StudentIDNFT contract
  console.log("🆔 Deploying StudentIDNFT contract...");
  const StudentIDNFT = await hre.ethers.getContractFactory("StudentIDNFT");
  const studentIDNFT = await StudentIDNFT.deploy();
  await studentIDNFT.waitForDeployment();
  const studentIDNFTAddress = await studentIDNFT.getAddress();
  console.log("✅ StudentIDNFT deployed to:", studentIDNFTAddress);

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
    StudentIDNFT: studentIDNFTAddress,
    network: hre.network.name
  };

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(contractsData, undefined, 2)
  );

  console.log("📄 Contract addresses saved to frontend/src/contracts/contract-address.json");

  // Verify contracts trên Etherscan (nếu deploy lên testnet)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("🔍 Verifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: examRegistrationAddress,
        constructorArguments: [],
      });
      console.log("✅ ExamRegistration verified on Etherscan");
    } catch (error) {
      console.log("❌ Failed to verify ExamRegistration:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: examCertificateNFTAddress,
        constructorArguments: [],
      });
      console.log("✅ ExamCertificateNFT verified on Etherscan");
    } catch (error) {
      console.log("❌ Failed to verify ExamCertificateNFT:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: studentIDNFTAddress,
        constructorArguments: [],
      });
      console.log("✅ StudentIDNFT verified on Etherscan");
    } catch (error) {
      console.log("❌ Failed to verify StudentIDNFT:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract addresses:");
  console.log("   ExamRegistration:", examRegistrationAddress);
  console.log("   ExamCertificateNFT:", examCertificateNFTAddress);
  console.log("   StudentIDNFT:", studentIDNFTAddress);
  console.log("   Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 