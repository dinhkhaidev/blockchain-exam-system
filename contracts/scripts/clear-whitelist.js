const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const contractAddress = "0x02a40c9FFc1a3dB73036bc28663d7EA15c6e7752";
  const ExamRegistration = await hre.ethers.getContractAt("ExamRegistration", contractAddress);

  const addresses = await ExamRegistration.getWhitelistedAddresses();
  console.log("Whitelisted addresses:", addresses);

  for (const addr of addresses) {
    try {
      const tx = await ExamRegistration.removeStudentFromWhitelist(addr);
      await tx.wait();
      console.log("Removed:", addr);
    } catch (e) {
      console.log("Failed to remove:", addr, e.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 