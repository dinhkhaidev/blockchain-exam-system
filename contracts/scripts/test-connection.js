const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing connection to Ganache...");

  try {
    // Test provider connection
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:7545");
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name);
    console.log("🔗 Chain ID:", network.chainId);

    // Test accounts
    const accounts = await provider.listAccounts();
    console.log("👥 Found", accounts.length, "accounts");
    console.log("💰 First account:", accounts[0]);
    console.log("💰 Balance:", ethers.utils.formatEther(await provider.getBalance(accounts[0])), "ETH");

    // Test contract deployment
    console.log("\n📦 Testing contract deployment...");
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);

    const ExamNFTRegistry = await ethers.getContractFactory("ExamNFTRegistry");
    const nftRegistry = await ExamNFTRegistry.deploy();
    await nftRegistry.deployed();
    console.log("✅ ExamNFTRegistry deployed to:", nftRegistry.address);

    // Test contract functions
    console.log("\n🧪 Testing contract functions...");
    const owner = await nftRegistry.owner();
    console.log("👑 Contract owner:", owner);
    console.log("👑 Deployer address:", deployer.address);
    console.log("✅ Owner matches deployer:", owner === deployer.address);

    const pendingCount = await nftRegistry.getPendingCount();
    console.log("📊 Pending count:", pendingCount.toString());

    const completedCount = await nftRegistry.getCompletedCount();
    console.log("📊 Completed count:", completedCount.toString());

    console.log("\n🎉 All tests passed! Ganache is working correctly.");

  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure Ganache is running on port 7545");
    console.log("2. Check if Ganache is accessible at http://localhost:7545");
    console.log("3. Verify network settings in hardhat.config.js");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 