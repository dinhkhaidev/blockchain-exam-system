const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
// TODO: Thay thế bằng hàm thực tế của bạn
const { mintNFT, getNFTMetadataURI, mintStudentIDNFT } = require('../blockchain-utils');
const { getMetadataFromIPFS } = require('../ipfs-utils');
const { ethers } = require('ethers');
const contractAddresses = require('../../frontend/src/contracts/contract-address.json');
const ExamRegistration = require('../../frontend/src/contracts/ExamRegistration.json');

const router = express.Router();
const upload = multer();

// Thêm hàm lấy metadataURI từ StudentIDNFT
async function getStudentIDNFTMetadataURI(walletAddress) {
  // Kết nối contract StudentIDNFT
  const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:7545';
  const PRIVATE_KEY = process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY';
  const { ethers } = require('ethers');
  const StudentIDNFT = require('../../frontend/src/contracts/StudentIDNFT.json');
  const contractAddresses = require('../../frontend/src/contracts/contract-address.json');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    contractAddresses.StudentIDNFT,
    StudentIDNFT.abi,
    wallet
  );
  const tokenId = await contract.getTokenIdByWallet(walletAddress);
  return await contract.tokenURI(tokenId);
}

router.post('/verify', upload.single('face'), async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const imageBuffer = req.file.buffer;
    console.log('[STUDENT VERIFY] Nhận yêu cầu xác minh:', { walletAddress, imageSize: imageBuffer.length });

    // 1. Lấy metadataURI từ StudentIDNFT dựa vào ví sinh viên
    const metadataURI = await getStudentIDNFTMetadataURI(walletAddress);
    console.log('[STUDENT VERIFY] metadataURI:', metadataURI);

    // 2. Lấy embedding gốc từ metadata NFT trên IPFS
    const metadata = await getMetadataFromIPFS(metadataURI);
    console.log('[STUDENT VERIFY] metadata:', metadata);
    const embeddingFromNFT = metadata.faceEmbedding;
    if (!embeddingFromNFT) {
      console.log('[STUDENT VERIFY] Không tìm thấy embedding trong metadata!');
      return res.status(400).json({ success: false, error: 'Không tìm thấy embedding trong NFT' });
    }

    // 3. Gửi ảnh hiện tại lên AI service để lấy embedding
    const form = new FormData();
    form.append('image', imageBuffer, 'face.jpg');
    console.log('[STUDENT VERIFY] Gửi ảnh lên AI service...');
    const aiRes = await axios.post('http://localhost:5001/extract-embedding', form, {
      headers: form.getHeaders(),
    });
    const embeddingCurrent = aiRes.data.embedding;
    console.log('[STUDENT VERIFY] embeddingCurrent:', embeddingCurrent && embeddingCurrent.length);

    // 4. So sánh 2 embedding qua AI service
    console.log('[STUDENT VERIFY] So sánh embedding...');
    const compareRes = await axios.post('http://localhost:5001/compare-embedding', {
      embedding1: embeddingFromNFT,
      embedding2: embeddingCurrent
    });
    console.log('[STUDENT VERIFY] Kết quả so sánh:', compareRes.data);

    if (compareRes.data.match) {
      res.json({ success: true, verified: true });
    } else {
      res.json({ success: true, verified: false, reason: 'Face does not match NFT' });
    }
  } catch (err) {
    console.error('[STUDENT VERIFY] Lỗi xác minh:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API lấy studentId từ StudentIDNFT metadata
router.get('/id-nft', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    if (!walletAddress) return res.status(400).json({ error: 'Missing walletAddress' });
    const metadataURI = await getStudentIDNFTMetadataURI(walletAddress);
    const metadata = await getMetadataFromIPFS(metadataURI);
    if (metadata && metadata.studentId) {
      res.json({ studentId: metadata.studentId });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
  }
});

module.exports = router; 