const hre = require("hardhat");

async function main() {
  try {
    console.log("🔄 Transferring contract ownership...");
    
    // Địa chỉ ví sẽ nhận ownership - THAY ĐỔI THÀNH ĐỊA CHỈ CỦA BẠN
    const NEW_OWNER_ADDRESS = "0xb873ad3db908b6689e53ef8da3f36d82c7bdef84";
    
    console.log("👑 New owner address:", NEW_OWNER_ADDRESS);
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
    
    console.log("📋 Contract Address:", examRegistrationAddress);
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
    
    if (currentOwner.toLowerCase() !== deployerAddress.toLowerCase()) {
      console.log("❌ Connected account is NOT the owner. Cannot transfer ownership.");
      return;
    }
    
    console.log("✅ Connected account IS the owner. Proceeding with transfer...");
    console.log("");
    
    // Transfer ownership
    console.log("🔄 Transferring ownership...");
    const tx = await examRegistration.transferOwnership(NEW_OWNER_ADDRESS);
    await tx.wait();
    
    // Verify new owner
    const newOwner = await examRegistration.owner();
    console.log("✅ New owner:", newOwner);
    
    // Update contract address file
    contractData.owner = newOwner;
    fs.writeFileSync(contractAddressFile, JSON.stringify(contractData, undefined, 2));
    
    console.log("📄 Contract address file updated");
    console.log("");
    console.log("🎉 Ownership transfer completed successfully!");
    
  } catch (error) {
    console.error("❌ Transfer failed:", error.message);
    console.log("");
    console.log("💡 Troubleshooting:");
    console.log("1. Make sure you are the current owner");
    console.log("2. Check if Ganache is running");
    console.log("3. Ensure you have enough ETH for gas");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 