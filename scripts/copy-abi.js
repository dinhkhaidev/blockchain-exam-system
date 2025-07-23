const fs = require("fs");
const path = require("path");

const contracts = [
  "ExamRegistration",
  "ExamCertificateNFT",
  "StudentIDNFT", // Thêm contract mới
  // Thêm tên contract khác nếu cần
];

for (const name of contracts) {
  const src = path.join(__dirname, "../contracts/artifacts/contracts", `${name}.sol`, `${name}.json`);
  const dest = path.join(__dirname, "../frontend/src/contracts", `${name}.json`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${name}.json to frontend/src/contracts/`);
  } else {
    console.warn(`⚠️  ABI not found for ${name}: ${src}`);
  }
} 