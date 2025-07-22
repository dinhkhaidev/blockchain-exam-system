const hre = require("hardhat");
const fs = require("fs");

const OWNER_ADDRESS = "0xYourOwnerAddressHere"; // <-- Chỉnh sửa địa chỉ owner tại đây

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const ExamRegistration = await hre.ethers.getContractFactory("ExamRegistration");
  const contract = await ExamRegistration.deploy();
  await contract.deployed();
  console.log("ExamRegistration deployed to:", contract.address);

  if (OWNER_ADDRESS && OWNER_ADDRESS.toLowerCase() !== deployer.address.toLowerCase()) {
    const tx = await contract.transferOwnership(OWNER_ADDRESS);
    await tx.wait();
    console.log("Ownership transferred to:", OWNER_ADDRESS);
  }

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