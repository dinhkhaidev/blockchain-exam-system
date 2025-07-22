# 🚀 Hướng dẫn cài đặt và chạy hệ thống Blockchain Exam Authentication

## 📋 Yêu cầu hệ thống

- **Node.js** (v18+)
- **npm** hoặc **yarn**
- **MetaMask** extension (v11+)
- **Ganache** (v2.7+ cho blockchain local)
- **Git** (để clone repository)

## 🔧 Cài đặt từng bước

### Bước 1: Chuẩn bị môi trường

#### Kiểm tra Node.js
```bash
node --version  # Phải >= 18.0.0
npm --version   # Phải >= 8.0.0
```

#### Cài đặt Ganache
- Tải từ: https://trufflesuite.com/ganache/
- Hoặc cài qua npm: `npm install -g ganache-cli`

### Bước 2: Clone và cài đặt dependencies

```bash
# Clone repository (nếu chưa có)
git clone <repository-url>
cd cuoi_ki

# Cài đặt dependencies cho từng phần
cd contracts && npm install
cd ../frontend && npm install  
cd ../backend && npm install
cd ..
```

### Bước 3: Cấu hình môi trường

#### Tạo file backend/.env
```bash
cd backend
```

Tạo file `.env` với nội dung:
```env
PORT=5000
NODE_ENV=development
ETHEREUM_NETWORK=localhost
GANACHE_URL=http://127.0.0.1:7545
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
```

#### Tạo file frontend/.env
```bash
cd ../frontend
```

Tạo file `.env` với nội dung:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_NETWORK_ID=1337
REACT_APP_CHAIN_ID=0x539
```

## 🏃‍♂️ Chạy hệ thống

### Bước 1: Khởi động Ganache

#### Cách 1: Ganache GUI
- Mở Ganache
- Tạo workspace mới
- Đảm bảo server chạy trên port **7545**
- Ghi lại địa chỉ ví và private key

#### Cách 2: Ganache CLI
```bash
ganache-cli --port 7545 --network-id 1337
```

### Bước 2: Deploy Smart Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Lựa chọn 1: Deploy contracts cơ bản (owner = account deployer)
npx hardhat run scripts/deploy.js --network localhost

# Lựa chọn 2: Deploy contracts với owner tùy chỉnh
# (Chỉnh sửa OWNER_ADDRESS trong file trước khi chạy)
npx hardhat run scripts/deploy-with-owner.js --network localhost
```

**Sau khi deploy thành công, ghi lại địa chỉ contracts và cập nhật:**

#### Cập nhật frontend/src/contracts/contract-address.json
```json
{
  "ExamRegistration": "0x...",
  "ExamCertificateNFT": "0x..."
}
```

#### Copy contract artifacts
```bash
cp artifacts/contracts/ExamRegistration.sol/ExamRegistration.json ../frontend/src/contracts/
cp artifacts/contracts/ExamCertificateNFT.sol/ExamCertificateNFT.json ../frontend/src/contracts/
```

### Bước 3: Khởi động Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy trên http://localhost:3001

### Bước 4: Khởi động Frontend

```bash
cd frontend
npm start
```

Frontend sẽ chạy trên http://localhost:3000

### Bước 5: Chạy toàn bộ hệ thống (tùy chọn)

Từ thư mục root:
```bash
npm run dev  # Nếu có script này
```

## 🔗 Cấu hình MetaMask

### Bước 1: Thêm network Ganache
- Mở MetaMask
- Vào Settings > Networks > Add Network
- Thông tin network:
  - **Network Name**: Ganache
  - **RPC URL**: http://127.0.0.1:7545
  - **Chain ID**: 1337
  - **Currency Symbol**: ETH

### Bước 2: Import account
- Copy private key từ Ganache (account đầu tiên)
- Vào MetaMask > Import Account
- Paste private key

### Bước 3: Kiểm tra kết nối
- Chuyển sang network Ganache
- Đảm bảo có ETH trong account

## 📖 Sử dụng hệ thống

### 1. Thiết lập Owner/Admin
- Truy cập http://localhost:3000
- Chọn role "Admin/Owner"
- Kết nối MetaMask với account owner
- Vào Admin Dashboard
- Sử dụng "Owner Setup" để thiết lập owner

### 2. Quản lý Whitelist
- Trong Admin Dashboard, vào tab "Whitelist Management"
- Thêm địa chỉ ví của sinh viên vào whitelist
- Chỉ sinh viên trong whitelist mới được đăng ký

### 3. Đăng ký thi (Sinh viên)
- Chọn role "Student"
- Kết nối MetaMask với account sinh viên
- Vào trang "Đăng ký thi"
- Nhập MSSV, chọn môn học và ca thi
- Xác nhận giao dịch

### 4. Xác minh danh tính
- Vào trang "Xác minh"
- Chụp ảnh xác minh
- Hệ thống sẽ kiểm tra và xác minh

### 5. Tham gia thi
- Sau khi xác minh thành công
- Vào trang "Thi" để tham gia

### 6. Nhận NFT
- Sau khi hoàn thành thi
- Hệ thống tự động mint NFT chứng nhận

## 🛠️ Troubleshooting

### Lỗi Duplicate Content (Quan trọng!)
```bash
# Nếu gặp lỗi "Identifier has already been declared":
# 1. Kiểm tra các file sau có duplicate content:
- frontend/src/index.js
- frontend/src/App.js
- frontend/package.json
- frontend/src/contracts/*.json

# 2. Xóa duplicate content, chỉ giữ lại 1 version
# 3. Restart frontend
```

### Lỗi JSON Parse
```bash
# Nếu gặp lỗi JSON parse trong contract files:
- Xóa file contract JSON bị lỗi
- Copy lại từ artifacts/contracts/
- Đảm bảo file JSON hợp lệ và không có duplicate
```

### Lỗi kết nối MetaMask
```bash
# Kiểm tra:
- MetaMask đã được cài đặt và unlock
- Đã kết nối đúng network Ganache
- Account có đủ ETH (> 0.1 ETH)
- Chain ID đúng (1337)
```

### Lỗi deploy contracts
```bash
# Kiểm tra:
- Ganache đang chạy trên port 7545
- Hardhat config đúng network
- Private key có đủ ETH
- Port 7545 không bị chiếm
```

### Lỗi API Backend
```bash
# Kiểm tra:
- Backend đang chạy trên port 5000
- File .env đúng cấu hình
- CORS configuration
- Database connection (nếu có)
```

### Lỗi Frontend
```bash
# Kiểm tra:
- React app đang chạy trên port 3000
- Contract addresses đúng trong contract-address.json
- MetaMask đã kết nối
- Clear browser cache và localStorage
```

### Reset toàn bộ hệ thống
```bash
# 1. Dừng tất cả services
# 2. Xóa node_modules và package-lock.json
cd frontend && rm -rf node_modules package-lock.json
cd ../backend && rm -rf node_modules package-lock.json
cd ../contracts && rm -rf node_modules package-lock.json

# 3. Cài đặt lại dependencies
cd ../frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install

# 4. Restart Ganache
# 5. Deploy lại contracts
# 6. Update contract addresses
# 7. Restart backend và frontend
```

## 📁 Cấu trúc dự án

```
cuoi_ki/
├── contracts/              # Smart contracts
│   ├── contracts/          # Solidity contracts
│   │   ├── ExamRegistration.sol
│   │   └── ExamCertificateNFT.sol
│   ├── scripts/           # Deploy scripts
│   ├── test/             # Contract tests
│   ├── artifacts/        # Compiled contracts
│   └── hardhat.config.js
├── frontend/             # React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # Web3 context
│   │   ├── utils/        # Utility functions
│   │   └── contracts/    # Contract ABIs
│   ├── public/
│   └── package.json
├── backend/              # Node.js API
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── server.js         # Main server file
│   └── package.json
├── docs/                # Documentation
├── scripts/             # Deployment scripts
│   ├── deploy.js        # Deploy contracts cơ bản
│   └── deploy-with-owner.js # Deploy với owner tùy chỉnh
└── README.md
```

## 🔒 Bảo mật và Best Practices

### Smart Contracts
- Không commit private keys
- Sử dụng environment variables
- Kiểm tra smart contract security
- Validate input data
- Sử dụng SafeMath (nếu cần)

### Frontend
- Validate user input
- Handle Web3 errors gracefully
- Implement proper error boundaries
- Secure localStorage usage
- **Quan trọng**: Kiểm tra duplicate content trong files

### Backend
- Validate API requests
- Implement rate limiting
- Use HTTPS in production
- Secure JWT tokens

## 📞 Hỗ trợ và Debug

### Logs quan trọng
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs  
cd frontend && npm start

# Contract deployment logs
cd contracts && npx hardhat run scripts/deploy.js --network localhost
```

### Kiểm tra kết nối
```bash
# Test Ganache connection
cd contracts && node test-connection.js

# Deploy contracts với scripts có sẵn
cd contracts && npx hardhat run scripts/deploy.js --network localhost

# Hoặc deploy với owner tùy chỉnh
cd contracts && npx hardhat run scripts/deploy-with-owner.js --network localhost
```

### Kiểm tra duplicate content
```bash
# Tìm duplicate imports
grep -r "import.*from" frontend/src/ | sort | uniq -d

# Tìm duplicate exports
grep -r "export default" frontend/src/ | sort | uniq -d
```

## 🚀 Production Deployment

### Smart Contracts
- Deploy lên testnet (Sepolia/Goerli)
- Verify contracts trên Etherscan
- Sử dụng environment variables

### Frontend
- Build production: `npm run build`
- Deploy lên Vercel/Netlify
- Cấu hình environment variables

### Backend
- Deploy lên Heroku/VPS
- Sử dụng production database
- Cấu hình CORS cho domain thật

## ⚠️ Lưu ý quan trọng

1. **Duplicate Content**: Nếu gặp lỗi "Identifier has already been declared", kiểm tra và xóa duplicate content trong các file JavaScript/JSON.

2. **Contract Artifacts**: Luôn copy contract artifacts từ `contracts/artifacts/` sang `frontend/src/contracts/` sau khi deploy. Sử dụng script `contracts/scripts/deploy.js` để deploy.

3. **Environment Variables**: Đảm bảo tất cả file `.env` được tạo đúng cách.

4. **MetaMask**: Luôn kiểm tra network và account trước khi test.

5. **Dependencies**: Nếu gặp lỗi, thử xóa `node_modules` và `package-lock.json`, sau đó chạy `npm install` lại.

---

**Lưu ý**: Đảm bảo tất cả services đang chạy trước khi test hệ thống. Nếu gặp vấn đề, hãy kiểm tra logs và restart services. 
 