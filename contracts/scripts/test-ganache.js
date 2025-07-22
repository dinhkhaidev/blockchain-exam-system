const { ethers } = require("hardhat");

async function main() {
  console.log("Testing Ganache connection...\n");

  try {
    // Test connection
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name);
    console.log("🔗 Chain ID:", network.chainId);

    // Get accounts
    const accounts = await ethers.getSigners();
    console.log("👥 Found", accounts.length, "accounts");

    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      console.log("💰 First account:", firstAccount.address);
      
      // Get balance
      const balance = await provider.getBalance(firstAccount.address);
      console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    }

    console.log("\n🎉 Ganache connection test passed!");
    return true;

  } catch (error) {
    console.error("❌ Ganache connection test failed:", error.message);
    console.log("\n💡 Please make sure Ganache is running on port 7545");
    console.log("   Run: ganache-cli --port 7545");
    return false;
  }
}

main()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 