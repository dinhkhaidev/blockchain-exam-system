const { ethers } = require("hardhat");

async function main() {
  console.log("📖 Reading data from blockchain...");

  try {
    // Get contract instance
    const contractAddress = "0x..."; // Thay bằng địa chỉ contract đã deploy
    const ExamNFTRegistry = await ethers.getContractFactory("ExamNFTRegistry");
    const nftRegistry = ExamNFTRegistry.attach(contractAddress);

    console.log("📋 Contract address:", contractAddress);
    console.log("👑 Contract owner:", await nftRegistry.owner());

    // Get counts
    const pendingCount = await nftRegistry.getPendingCount();
    const completedCount = await nftRegistry.getCompletedCount();
    
    console.log("\n📊 Statistics:");
    console.log("   Pending students:", pendingCount.toString());
    console.log("   Completed students:", completedCount.toString());

    // Get all pending addresses
    console.log("\n⏳ Pending Students:");
    const pendingAddresses = await nftRegistry.getAllPendingAddresses();
    
    for (let i = 0; i < pendingAddresses.length; i++) {
      const address = pendingAddresses[i];
      const pendingInfo = await nftRegistry.getPendingMint(address);
      
      if (pendingInfo.exists) {
        console.log(`   ${i + 1}. ${address}`);
        console.log(`      Student ID: ${pendingInfo.studentId}`);
        console.log(`      Subject: ${pendingInfo.subject}`);
        console.log(`      Exam Session: ${pendingInfo.examSession}`);
        console.log(`      Score: ${pendingInfo.score.toString()}/3`);
        console.log(`      Exam Date: ${new Date(pendingInfo.examDate.toNumber() * 1000).toLocaleString()}`);
        console.log(`      IP Address: ${pendingInfo.ipAddress}`);
        console.log(`      Added At: ${new Date(pendingInfo.addedAt.toNumber() * 1000).toLocaleString()}`);
        console.log("");
      }
    }

    // Get all completed addresses
    console.log("✅ Completed Students:");
    const completedAddresses = await nftRegistry.getAllCompletedAddresses();
    
    for (let i = 0; i < completedAddresses.length; i++) {
      const address = completedAddresses[i];
      const completedInfo = await nftRegistry.getCompletedMint(address);
      
      if (completedInfo.exists) {
        console.log(`   ${i + 1}. ${address}`);
        console.log(`      Student ID: ${completedInfo.studentId}`);
        console.log(`      Subject: ${completedInfo.subject}`);
        console.log(`      Exam Session: ${completedInfo.examSession}`);
        console.log(`      Score: ${completedInfo.score.toString()}/3`);
        console.log(`      Exam Date: ${new Date(completedInfo.examDate.toNumber() * 1000).toLocaleString()}`);
        console.log(`      Mint Date: ${new Date(completedInfo.mintDate.toNumber() * 1000).toLocaleString()}`);
        console.log(`      Token ID: ${completedInfo.tokenId}`);
        console.log(`      IP Address: ${completedInfo.ipAddress}`);
        console.log("");
      }
    }

    // Test specific address
    const testAddress = "0x4EE204518233e2e71025C75E59eF204435479844";
    console.log(`\n🎯 Testing specific address: ${testAddress}`);
    
    const isPending = await nftRegistry.isPending(testAddress);
    const isCompleted = await nftRegistry.isCompleted(testAddress);
    
    console.log(`   Is Pending: ${isPending}`);
    console.log(`   Is Completed: ${isCompleted}`);
    
    if (isPending) {
      const pendingInfo = await nftRegistry.getPendingMint(testAddress);
      console.log(`   Pending Info: ${pendingInfo.studentId} - ${pendingInfo.subject}`);
    }
    
    if (isCompleted) {
      const completedInfo = await nftRegistry.getCompletedMint(testAddress);
      console.log(`   Completed Info: ${completedInfo.studentId} - ${completedInfo.subject}`);
    }

    console.log("\n🎉 Data reading completed successfully!");

  } catch (error) {
    console.error("❌ Error reading blockchain data:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure contract is deployed");
    console.log("2. Update contract address in script");
    console.log("3. Check if Ganache is running");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 