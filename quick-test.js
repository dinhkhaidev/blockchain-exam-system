const fs = require('fs');
const path = require('path');

console.log('🔍 KIỂM TRA NHANH HỆ THỐNG BLOCKCHAIN EXAM AUTHENTICATION\n');

// Kiểm tra cấu trúc cơ bản
const criticalFiles = [
  'contracts/contracts/ExamRegistration.sol',
  'contracts/contracts/ExamCertificateNFT.sol',
  'contracts/hardhat.config.js',
  'contracts/package.json',
  'frontend/src/App.js',
  'backend/server.js',
  'package.json'
];

console.log('📁 Kiểm tra file quan trọng:');
let allFilesExist = true;
for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - KHÔNG TỒN TẠI`);
    allFilesExist = false;
  }
}

// Kiểm tra package.json files
console.log('\n📦 Kiểm tra dependencies:');
const packageFiles = ['package.json', 'contracts/package.json', 'frontend/package.json', 'backend/package.json'];
for (const pkgFile of packageFiles) {
  if (fs.existsSync(pkgFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      console.log(`✅ ${pkgFile} - ${pkg.name || 'package'}`);
    } catch (error) {
      console.log(`❌ ${pkgFile} - JSON không hợp lệ`);
    }
  }
}

// Kiểm tra node_modules
console.log('\n🔧 Kiểm tra node_modules:');
const nodeModulesDirs = ['contracts/node_modules', 'frontend/node_modules', 'backend/node_modules'];
for (const dir of nodeModulesDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} - Đã cài đặt`);
  } else {
    console.log(`⚠️  ${dir} - Chưa cài đặt (chạy npm install)`);
  }
}

// Kiểm tra artifacts (sau khi compile)
console.log('\n🔗 Kiểm tra artifacts:');
const artifactsDir = 'contracts/artifacts';
if (fs.existsSync(artifactsDir)) {
  const artifacts = fs.readdirSync(artifactsDir);
  if (artifacts.length > 0) {
    console.log(`✅ ${artifactsDir} - Đã compile (${artifacts.length} files)`);
  } else {
    console.log(`⚠️  ${artifactsDir} - Chưa compile (chạy npx hardhat compile)`);
  }
} else {
  console.log(`⚠️  ${artifactsDir} - Chưa tồn tại (chạy npx hardhat compile)`);
}

console.log('\n📊 TỔNG KẾT:');
console.log('=====================================');

if (allFilesExist) {
  console.log('🎉 HỆ THỐNG SẴN SÀNG!');
  console.log('\n🚀 Để chạy hệ thống:');
  console.log('1. Terminal 1: cd contracts && npx hardhat node');
  console.log('2. Terminal 2: cd contracts && npx hardhat run scripts/deploy.js --network localhost');
  console.log('3. Terminal 3: cd backend && npm start');
  console.log('4. Terminal 4: cd frontend && npm start');
  console.log('\n📝 Lưu ý:');
  console.log('- Đảm bảo MetaMask đã cài đặt');
  console.log('- Kết nối MetaMask với localhost:8545');
  console.log('- Import private key từ Hardhat node');
} else {
  console.log('❌ CÓ LỖI - Vui lòng kiểm tra lại!');
}

console.log('\n🔗 URLs:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend: http://localhost:3001');
console.log('- Hardhat Node: http://localhost:8545'); 
const path = require('path');

console.log('🔍 KIỂM TRA NHANH HỆ THỐNG BLOCKCHAIN EXAM AUTHENTICATION\n');
