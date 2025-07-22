const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Admin Dashboard Data Generation...");

  // Lấy signer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  // Lấy contract
  const examRegistration = await ethers.getContract("ExamRegistration");
  console.log("📋 Contract address:", await examRegistration.getAddress());

  // Danh sách địa chỉ test
  const testAddresses = [
    "0x4EE204518233e2e71025C75E59eF204435479844",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
  ];

  console.log("\n📊 Current Whitelist Status:");
  for (const address of testAddresses) {
    try {
      const isWhitelisted = await examRegistration.isStudentWhitelisted(address);
      const isRegistered = await examRegistration.isStudentRegistered(address);
      const isVerified = await examRegistration.isStudentVerified(address);
      
      console.log(`📍 ${address.slice(0, 10)}...${address.slice(-4)}:`);
      console.log(`   Whitelisted: ${isWhitelisted}`);
      console.log(`   Registered: ${isRegistered}`);
      console.log(`   Verified: ${isVerified}`);
    } catch (error) {
      console.log(`❌ Error checking ${address}:`, error.message);
    }
  }

  // Thêm tất cả vào whitelist
  console.log("\n➕ Adding all test addresses to whitelist...");
  for (const address of testAddresses) {
    try {
      const isWhitelisted = await examRegistration.isStudentWhitelisted(address);
      if (!isWhitelisted) {
        const tx = await examRegistration.addStudentToWhitelist(address);
        await tx.wait();
        console.log(`✅ Added ${address.slice(0, 10)}...${address.slice(-4)} to whitelist`);
      } else {
        console.log(`ℹ️  ${address.slice(0, 10)}...${address.slice(-4)} already in whitelist`);
      }
    } catch (error) {
      console.log(`❌ Error adding ${address}:`, error.message);
    }
  }

  // Kiểm tra whitelist count
  try {
    const whitelistCount = await examRegistration.whitelistCount();
    console.log(`\n📊 Total whitelisted students: ${whitelistCount}`);
  } catch (error) {
    console.log("❌ Error getting whitelist count:", error.message);
  }

  console.log("\n✅ Test completed! Check the Admin Dashboard for dynamic data.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 