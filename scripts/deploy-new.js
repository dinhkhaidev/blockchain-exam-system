const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  // Kết nối provider Ganache GUI (cổng 7545)
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

  // Lấy private key từ biến môi trường
  const privateKey = "0x0f898c6050a0bc3e927cddb339259da9cc73ecf267c97cb2d72481858d81aa1e";
  if (!privateKey) {
    throw new Error("Bạn cần cung cấp PRIVATE_KEY (account đầu tiên của Ganache) qua biến môi trường. Ví dụ: PRIVATE_KEY=0xabc... node deploy-new.js");
  }
  const wallet = new ethers.Wallet(privateKey, provider);

  // Đọc ABI và bytecode
  const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/ExamRegistration.sol/ExamRegistration.json", "utf8"));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode;

  // Deploy contract
  console.log("[DEPLOY] Đang deploy ExamRegistration lên Ganache (7545)...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("[DEPLOY] ExamRegistration đã deploy tại:", address);

  // Lưu địa chỉ vào contracts/contract-address.json
  let config = {};
  const configPath = "./contracts/contract-address.json";
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  config.ExamRegistration = address;
  config.network = "localhost";
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("[DEPLOY] Đã lưu địa chỉ contract vào", configPath);
}

main().catch((err) => {
  console.error("[DEPLOY] Deploy failed:", err);
  process.exit(1);
}); 