# 🚀 Setup Hoàn Chỉnh - Blockchain Exam System

## 📋 Mục Lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt dependencies](#cài-đặt-dependencies)
3. [Setup Blockchain](#setup-blockchain)
4. [Setup Backend](#setup-backend)
5. [Setup Frontend](#setup-frontend)
6. [Test hệ thống](#test-hệ-thống)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu cầu hệ thống

### **Software cần thiết:**
- ✅ Node.js (v16+)
- ✅ npm hoặc yarn
- ✅ Ganache (Desktop hoặc CLI)
- ✅ Git

### **Ports cần mở:**
- ✅ Port 3000 (Frontend)
- ✅ Port 5000 (Backend)
- ✅ Port 7545 (Ganache)

---

## 📦 Cài đặt dependencies

### **1. Clone và cài đặt:**
```bash
# Clone repository
git clone <repository-url>
cd cuoi_ki

# Cài đặt dependencies cho contracts
cd contracts
npm install

# Cài đặt dependencies cho backend
cd ../backend
npm install

# Cài đặt dependencies cho frontend
cd ../frontend
npm install
```

### **2. Kiểm tra cài đặt:**
```bash
# Kiểm tra Node.js
node --version
npm --version

# Kiểm tra Hardhat
cd contracts
npx hardhat --version
```

---

## ⛓️ Setup Blockchain

### **1. Khởi động Ganache:**
```bash
# Cách 1: Ganache Desktop
# Mở Ganache Desktop và đảm bảo port 7545

# Cách 2: Ganache CLI
npm install -g ganache-cli
ganache-cli --port 7545 --chain.hardfork london
```

### **2. Compile contracts:**
```bash
cd contracts
npx hardhat compile
```

### **3. Deploy contracts:**
```bash
# Deploy tất cả contracts
npx hardhat run scripts/deploy-to-ganache.js --network ganache
```

### **4. Lưu contract addresses:**
Sau khi deploy, copy địa chỉ contracts từ output và cập nhật:

**File: `backend/routes/nft.js`**
```javascript
const EXAM_NFT_REGISTRY_ADDRESS = "0x..."; // Thay bằng địa chỉ thực
```

**File: `frontend/src/contracts/contract-address.json`**
```json
{
  "examNFTRegistry": "0x...",
  "examRegistration": "0x...",
  "examCertificateNFT": "0x..."
}
```

### **5. Test blockchain connection:**
```bash
cd contracts
npx hardhat run scripts/test-connection.js --network ganache
```

---

## 🔧 Setup Backend

### **1. Tạo file environment:**
```bash
cd backend
```

Tạo file `.env`:
```env
# Blockchain Network
RPC_URL=http://localhost:7545
CHAIN_ID=1337
NETWORK=ganache

# Contract Addresses (cập nhật sau khi deploy)
EXAM_NFT_REGISTRY_ADDRESS=0x...
EXAM_REGISTRATION_ADDRESS=0x...
EXAM_CERTIFICATE_NFT_ADDRESS=0x...

# Server Config
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-secret-key-here
```

### **2. Cài đặt dependencies:**
```bash
npm install express cors dotenv ethers
```

### **3. Khởi động backend:**
```bash
npm start
```

### **4. Test API:**
```bash
# Test connection
curl http://localhost:3001/api/nft/pending-mint

# Expected response:
# {"success":true,"data":{"pendingStudents":[],"totalPending":0,"source":"blockchain"}}
```

---

## 🎨 Setup Frontend

### **1. Cài đặt dependencies:**
```bash
cd frontend
npm install
```

### **2. Cập nhật contract addresses:**
Sau khi deploy contracts, cập nhật file `src/contracts/contract-address.json`

### **3. Khởi động frontend:**
```bash
npm start
```

### **4. Test frontend:**
- Mở browser: http://localhost:3000
- Kiểm tra kết nối MetaMask
- Test các chức năng

---

## 🧪 Test hệ thống

### **1. Test Blockchain:**
```bash
cd contracts
npx hardhat run scripts/test-connection.js --network ganache
```

**Expected output:**
```
✅ Connected to network: unknown
🔗 Chain ID: 1337
👥 Found 10 accounts
💰 First account: 0x...
✅ ExamNFTRegistry deployed to: 0x...
👑 Contract owner: 0x...
✅ Owner matches deployer: true
📊 Pending count: 0
📊 Completed count: 0
🎉 All tests passed! Ganache is working correctly.
```

### **2. Test Backend API:**
```bash
# Test pending mint
curl http://localhost:3001/api/nft/pending-mint

# Test completed mint
curl http://localhost:3001/api/nft/completed-mint

# Test certificates
curl http://localhost:3001/api/nft/certificates
```

### **3. Test Frontend:**
- ✅ Kết nối MetaMask
- ✅ Đăng ký thi
- ✅ Xác minh danh tính
- ✅ Làm bài thi
- ✅ Mint NFT

### **4. Test toàn bộ flow:**
```bash
# 1. User hoàn thành thi
# 2. Kiểm tra pending list
curl http://localhost:3001/api/nft/pending-mint

# 3. Admin mint NFT
# 4. Kiểm tra completed list
curl http://localhost:3001/api/nft/completed-mint
```

---

## 🔍 Troubleshooting

### **Lỗi 1: Ganache không kết nối**
```bash
# Kiểm tra Ganache
curl http://localhost:7545

# Restart Ganache
# Đảm bảo port 7545 không bị block
```

### **Lỗi 2: Contract deploy thất bại**
```bash
# Kiểm tra hardhat config
cat hardhat.config.js

# Kiểm tra network
npx hardhat console --network ganache
```

### **Lỗi 3: Backend không start**
```bash
# Kiểm tra port 5000
netstat -an | findstr :5000

# Kill process nếu cần
taskkill /f /im node.exe
```

### **Lỗi 4: Frontend không kết nối backend**
```bash
# Kiểm tra CORS
# Kiểm tra URL trong frontend
# Đảm bảo backend đang chạy
```

### **Lỗi 5: MetaMask không kết nối**
```bash
# Thêm network trong MetaMask:
# Network Name: Ganache
# RPC URL: http://localhost:7545
# Chain ID: 1337
# Currency Symbol: ETH
```

---

## 📊 Kiểm tra hoạt động

### **1. Blockchain Data:**
```bash
cd contracts
npx hardhat run scripts/read-blockchain-data.js --network ganache
```

### **2. API Endpoints:**
- ✅ `GET /api/nft/pending-mint` - Danh sách chờ mint
- ✅ `POST /api/nft/pending-mint` - Thêm vào danh sách chờ
- ✅ `GET /api/nft/completed-mint` - Danh sách đã mint
- ✅ `POST /api/nft/complete-mint/:address` - Chuyển sang đã mint

### **3. Frontend Pages:**
- ✅ `/` - Home page
- ✅ `/register` - Đăng ký thi
- ✅ `/verify` - Xác minh danh tính
- ✅ `/exam` - Làm bài thi
- ✅ `/admin` - Admin panel
- ✅ `/nft-gallery` - NFT Gallery

---

## 🎯 Checklist hoàn thành

### **Blockchain:**
- ✅ Ganache chạy trên port 7545
- ✅ Contracts đã compile
- ✅ Contracts đã deploy
- ✅ Contract addresses đã cập nhật
- ✅ Test connection thành công

### **Backend:**
- ✅ Dependencies đã cài đặt
- ✅ Environment variables đã set
- ✅ Server chạy trên port 5000
- ✅ API endpoints hoạt động
- ✅ Kết nối blockchain thành công

### **Frontend:**
- ✅ Dependencies đã cài đặt
- ✅ Contract addresses đã cập nhật
- ✅ App chạy trên port 3000
- ✅ MetaMask kết nối thành công
- ✅ Tất cả pages hoạt động

### **Integration:**
- ✅ User flow hoàn chỉnh
- ✅ Admin flow hoạt động
- ✅ NFT minting thành công
- ✅ Data persistence trên blockchain

---

## 🚀 Khởi động hệ thống

### **Terminal 1 - Ganache:**
```bash
ganache-cli --port 7545
```

### **Terminal 2 - Backend:**
```bash
cd backend
npm start
```

### **Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```

### **Browser:**
- Mở: http://localhost:3000
- Kết nối MetaMask
- Test toàn bộ flow

---

## 📝 Ghi chú quan trọng

1. **Đảm bảo Ganache chạy trước khi deploy contracts**
2. **Cập nhật contract addresses sau khi deploy**
3. **Kiểm tra MetaMask network settings**
4. **Backup private keys nếu cần**
5. **Test từng bước trước khi chạy toàn bộ**

---

## 🆘 Hỗ trợ

Nếu gặp lỗi:
1. Kiểm tra logs trong terminal
2. Đảm bảo tất cả ports không bị conflict
3. Restart các services nếu cần
4. Kiểm tra network connectivity
5. Verify contract addresses

**🎉 Chúc bạn setup thành công!** 