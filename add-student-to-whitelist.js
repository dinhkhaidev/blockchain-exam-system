const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
    
// Mock các hàm blockchain/IPFS (thay bằng code thực tế nếu có)
const { mintNFT } = require('./backend/blockchain-utils');
const { uploadToIPFS } = require('./backend/ipfs-utils');

// Lấy tham số dòng lệnh
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return null;
}

const studentId = getArg('--id');
const studentAddress = getArg('--address');
const imagePath = getArg('--img');

if (!studentId || !studentAddress || !imagePath) {
  console.error('❌ Thiếu tham số! Dùng: node add-student-to-whitelist.js --id <mã_sv> --address <ví> --img <file_ảnh>');
  process.exit(1);
}

async function main() {
  try {
    console.log('🔄 Đang xử lý sinh viên:', studentId, studentAddress, imagePath);
    // 1. Đọc file ảnh
    if (!fs.existsSync(imagePath)) {
      throw new Error('Không tìm thấy file ảnh: ' + imagePath);
    }
    const imageBuffer = fs.readFileSync(imagePath);

    // 2. Gửi ảnh lên AI service để lấy embedding
    const form = new FormData();
    form.append('image', imageBuffer, path.basename(imagePath));
    const aiRes = await axios.post('http://localhost:5001/extract-embedding', form, {
      headers: form.getHeaders(),
    });
    const embedding = aiRes.data.embedding;
    console.log('✅ Lấy embedding thành công');
    
    // 3. Tạo metadata NFT
    const metadata = {
      name: 'Student ID NFT',
      description: 'Student identity NFT for exam authentication',
      studentId,
      faceEmbedding: embedding
    };
    fs.writeFileSync('metadata.json', JSON.stringify(metadata));
    console.log('✅ Tạo metadata NFT thành công');

    // 4. Upload metadata lên IPFS
    const metadataURI = await uploadToIPFS('metadata.json');
    console.log('✅ Upload metadata lên IPFS thành công:', metadataURI);

    // 5. Mint NFT cho sinh viên
    const tx = await mintNFT(studentAddress, metadataURI);
    console.log('✅ Mint NFT thành công! TxHash:', tx.hash);

    // 6. (Tùy chọn) Add vào whitelist (nếu cần, gọi smart contract)
    // ...

    console.log('🎉 Đã hoàn tất thêm sinh viên:', studentId, studentAddress);
    console.log('MetadataURI:', metadataURI);
    console.log('TxHash:', tx.hash);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

main(); 