// backend/blockchain-utils.js

const { ethers } = require('ethers');
const contractAddresses = require('../frontend/src/contracts/contract-address.json');
const ExamCertificateNFT = require('../frontend/src/contracts/ExamCertificateNFT.json');
const StudentIDNFT = require('../frontend/src/contracts/StudentIDNFT.json');

// Thay bằng RPC của bạn (Ganache, Hardhat, hoặc testnet)
const RPC_URL = 'http://127.0.0.1:7545'; // hoặc https://sepolia.infura.io/v3/...
const PRIVATE_KEY = '0x0f898c6050a0bc3e927cddb339259da9cc73ecf267c97cb2d72481858d81aa1e'; // Private key của owner (không public!)

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const nftContract = new ethers.Contract(
  contractAddresses.ExamCertificateNFT,
  ExamCertificateNFT.abi,
  wallet
);

const studentIdNftContract = new ethers.Contract(
  contractAddresses.StudentIDNFT,
  StudentIDNFT.abi,
  wallet
);

// Mint NFT thực tế (gọi mintCertificate)
async function mintNFT(walletAddress, metadataURI, studentId = '', subject = '', examSession = '', ipAddress = '', score = 0) {
  // Các tham số subject, examSession, ipAddress, score có thể để rỗng hoặc truyền từ backend nếu cần
  const tx = await nftContract.mintCertificate(
    walletAddress,
    studentId,
    subject,
    examSession,
    ipAddress,
    score,
    metadataURI
  );
  const receipt = await tx.wait();
  // Lấy tokenId từ event hoặc mapping contract
  const event = receipt.logs
    .map(log => {
      try { return nftContract.interface.parseLog(log); } catch { return null; }
    })
    .find(e => e && e.name === 'CertificateMinted');
  const tokenId = event ? event.args.tokenId.toString() : null;
  return { hash: receipt.transactionHash, tokenId };
}

// Lấy metadataURI từ tokenId (dựa vào mapping contract)
async function getNFTMetadataURI(walletAddress) {
  // Dùng hàm getTokenIdByWallet nếu contract có
  const tokenId = await nftContract.getTokenIdByWallet(walletAddress);
  return await nftContract.tokenURI(tokenId);
}

// Mint StudentID NFT (dùng cho xác thực danh tính)
async function mintStudentIDNFT(walletAddress, studentId, metadataURI) {
  const tx = await studentIdNftContract.mintStudentID(
    walletAddress,
    studentId,
    metadataURI
  );
  const receipt = await tx.wait();
  // Lấy tokenId từ event hoặc mapping contract
  const event = receipt.logs
    .map(log => {
      try { return studentIdNftContract.interface.parseLog(log); } catch { return null; }
    })
    .find(e => e && e.name === 'StudentIDMinted');
  const tokenId = event ? event.args.tokenId.toString() : null;
  return { hash: receipt.transactionHash, tokenId };
}

module.exports = { mintNFT, getNFTMetadataURI, mintStudentIDNFT }; 