const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');
// TODO: Thay thế bằng hàm thực tế của bạn
const { mintStudentIDNFT } = require('../blockchain-utils');
const { uploadToIPFS } = require('../ipfs-utils');

const router = express.Router();
const upload = multer();

router.post('/add-student', upload.single('face'), async (req, res) => {
  try {
    const { studentId, walletAddress } = req.body;
    const imageBuffer = req.file.buffer;
    console.log('[ADMIN] Nhận yêu cầu add student:', { studentId, walletAddress });

    // Gửi ảnh lên AI service để lấy embedding
    const form = new FormData();
    form.append('image', imageBuffer, 'face.jpg');
    console.log('[ADMIN] Gửi ảnh lên AI service...');
    const aiRes = await axios.post('http://localhost:5001/extract-embedding', form, {
      headers: form.getHeaders(),
    });
    const embedding = aiRes.data.embedding;
    console.log('[ADMIN] Nhận embedding:', embedding && embedding.length);

    // Tạo metadata NFT (không ghi file)
    const metadata = {
      name: "Student ID NFT",
      description: "Student identity NFT for exam authentication",
      studentId,
      walletAddress, // thêm address vào metadata
      faceEmbedding: embedding
    };
    console.log('[ADMIN] Tạo metadata object');

    // Upload metadata lên IPFS (truyền object)
    console.log('[ADMIN] Upload metadata lên IPFS...');
    const metadataURI = await uploadToIPFS(metadata);
    console.log('[ADMIN] MetadataURI:', metadataURI);

    // Mint StudentID NFT cho sinh viên
    console.log('[ADMIN] Mint StudentID NFT...');
    const tx = await mintStudentIDNFT(walletAddress, studentId, metadataURI);
    console.log('[ADMIN] Mint StudentID NFT thành công:', tx);

    res.json({ success: true, txHash: tx.hash, metadataURI, tokenId: tx.tokenId });
  } catch (err) {
    console.error('[ADMIN] Lỗi add-student:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router; 
 
 
 