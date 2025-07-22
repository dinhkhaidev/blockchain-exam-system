const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
  const contract = await ExamRegistration.deploy();
  await contract.deployed();
  console.log("ExamRegistration deployed to:", contract.address);

  // Lưu địa chỉ vào contracts/contract-address.json
  const configPath = "./contracts/contract-address.json";
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  config.ExamRegistration = contract.address;
  config.network = "localhost";
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("Contract address saved to", configPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 