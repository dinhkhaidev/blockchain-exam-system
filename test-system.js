const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra hệ thống Blockchain Exam Authentication...\n');

// Kiểm tra cấu trúc thư mục
const criticalFiles = [
  'contracts',
  'frontend',
  'backend',
  'frontend/src',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/contexts',
  'frontend/src/contracts',
  'backend/routes'
];

const requiredFiles = [
  'contracts/contracts/ExamRegistration.sol',
  'contracts/contracts/ExamCertificateNFT.sol',
  'contracts/scripts/deploy.js',
  'frontend/src/App.js',
  'frontend/src/components/Navbar.js',
  'frontend/src/pages/Home.js',
  'frontend/src/pages/Register.js',
  'frontend/src/pages/Verify.js',
  'frontend/src/pages/Exam.js',
  'frontend/src/pages/Dashboard.js',
  'frontend/src/pages/Admin.js',
  'frontend/src/pages/NFTGallery.js',
  'frontend/src/contexts/Web3Context.js',
  'frontend/src/contracts/ExamRegistration.json',
  'frontend/src/contracts/ExamCertificateNFT.json',
  'backend/server.js',
  'backend/routes/auth.js',
  'backend/routes/verification.js',
  'backend/routes/exam.js',
  'backend/routes/nft.js',
  'backend/routes/admin.js',
  'package.json',
  'README.md',
  'SETUP.md'
];

console.log('📁 Kiểm tra cấu trúc thư mục...');
let dirCheckPassed = true;
for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    console.log(`❌ Thiếu thư mục: ${dir}`);
    dirCheckPassed = false;
  } else {
    console.log(`✅ ${dir}`);
  }
}

console.log('\n📄 Kiểm tra các file cần thiết...');
let fileCheckPassed = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.log(`❌ Thiếu file: ${file}`);
    fileCheckPassed = false;
  } else {
    console.log(`✅ ${file}`);
  }
}

// Kiểm tra package.json files
console.log('\n📦 Kiểm tra dependencies...');
const packageFiles = [
  'package.json',
  'frontend/package.json',
  'backend/package.json',
  'contracts/package.json'
];

let packageCheckPassed = true;
for (const pkgFile of packageFiles) {
  if (fs.existsSync(pkgFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      console.log(`✅ ${pkgFile} - ${pkg.name || 'package'}`);
    } catch (error) {
      console.log(`❌ ${pkgFile} - JSON không hợp lệ`);
      packageCheckPassed = false;
    }
  } else {
    console.log(`❌ Thiếu file: ${pkgFile}`);
    packageCheckPassed = false;
  }
}

// Kiểm tra Smart Contracts
console.log('\n🔗 Kiểm tra Smart Contracts...');
const contractFiles = [
  'contracts/contracts/ExamRegistration.sol',
  'contracts/contracts/ExamCertificateNFT.sol'
];

let contractCheckPassed = true;
for (const contract of contractFiles) {
  if (fs.existsSync(contract)) {
    const content = fs.readFileSync(contract, 'utf8');
    if (content.includes('contract') && content.includes('function')) {
      console.log(`✅ ${contract} - Hợp lệ`);
    } else {
      console.log(`❌ ${contract} - Không phải Solidity contract`);
      contractCheckPassed = false;
    }
  } else {
    console.log(`❌ Thiếu file: ${contract}`);
    contractCheckPassed = false;
  }
}

// Kiểm tra React Components
console.log('\n⚛️ Kiểm tra React Components...');
const reactComponents = [
  'frontend/src/App.js',
  'frontend/src/components/Navbar.js',
  'frontend/src/pages/Home.js',
  'frontend/src/pages/Register.js',
  'frontend/src/pages/Verify.js',
  'frontend/src/pages/Exam.js',
  'frontend/src/pages/Dashboard.js',
  'frontend/src/pages/Admin.js',
  'frontend/src/pages/NFTGallery.js'
];

let reactCheckPassed = true;
for (const component of reactComponents) {
  if (fs.existsSync(component)) {
    const content = fs.readFileSync(component, 'utf8');
    if (content.includes('import React') || content.includes('export default')) {
      console.log(`✅ ${component} - Hợp lệ`);
    } else {
      console.log(`❌ ${component} - Không phải React component`);
      reactCheckPassed = false;
    }
  } else {
    console.log(`❌ Thiếu file: ${component}`);
    reactCheckPassed = false;
  }
}

// Kiểm tra Backend Routes
console.log('\n🔧 Kiểm tra Backend Routes...');
const backendRoutes = [
  'backend/routes/auth.js',
  'backend/routes/verification.js',
  'backend/routes/exam.js',
  'backend/routes/nft.js',
  'backend/routes/admin.js'
];

let backendCheckPassed = true;
for (const route of backendRoutes) {
  if (fs.existsSync(route)) {
    const content = fs.readFileSync(route, 'utf8');
    if (content.includes('router.get') || content.includes('router.post') || content.includes('express')) {
      console.log(`✅ ${route} - Hợp lệ`);
    } else {
      console.log(`❌ ${route} - Không phải Express route`);
      backendCheckPassed = false;
    }
  } else {
    console.log(`❌ Thiếu file: ${route}`);
    backendCheckPassed = false;
  }
}

// Tổng kết
console.log('\n📊 TỔNG KẾT KIỂM TRA:');
console.log('=====================================');

if (dirCheckPassed && fileCheckPassed && packageCheckPassed && contractCheckPassed && reactCheckPassed && backendCheckPassed) {
  console.log('🎉 TẤT CẢ KIỂM TRA ĐỀU THÀNH CÔNG!');
  console.log('✅ Hệ thống đã sẵn sàng để chạy');
  console.log('\n🚀 Để chạy hệ thống:');
  console.log('1. cd contracts && npm install');
  console.log('2. npx hardhat compile');
  console.log('3. npx hardhat node');
  console.log('4. npx hardhat run scripts/deploy.js --network localhost');
  console.log('5. cd ../backend && npm install');
  console.log('6. npm start');
  console.log('7. cd ../frontend && npm install');
  console.log('8. npm start');
} else {
  console.log('❌ CÓ LỖI TRONG HỆ THỐNG!');
  console.log('Vui lòng kiểm tra và sửa các lỗi trên trước khi chạy.');
}

console.log('\n📝 Lưu ý:');
console.log('- Đảm bảo MetaMask đã được cài đặt và kết nối');
console.log('- Đảm bảo có đủ ETH trong ví để deploy contracts');
console.log('- Kiểm tra port 3000, 5000, 8545 không bị chiếm');
console.log('- Đảm bảo Node.js version >= 14.0.0'); 
const path = require('path');

console.log('🔍 Kiểm tra hệ thống Blockchain Exam Authentication...\n');

// Kiểm tra cấu trúc thư mục
const requiredDirs = [
  'contracts',
  'frontend',
  'backend',
  'frontend/src',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/contexts',
  'frontend/src/contracts',
  'backend/routes'
];

