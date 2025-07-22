# 🎓 Blockchain Exam System

Hệ thống thi trực tuyến dựa trên blockchain với NFT chứng nhận.

## 🚀 Quick Start

### **Cách 1: Setup tự động (Khuyến nghị)**
```bash
# 1. Kiểm tra setup
node scripts/check-setup.js

# 2. Khởi động toàn bộ hệ thống
node scripts/start-system.js
```

### **Cách 2: Windows Setup**
```powershell
# PowerShell (step-by-step)
.\scripts\start-step-by-step.ps1

# PowerShell (command runner)
.\scripts\run-commands.ps1

# PowerShell (đơn giản)
.\scripts\start-simple.ps1

# Hoặc Batch file
.\scripts\start-system.bat
```

### **Cách 3: Setup thủ công**
```bash
# 1. Khởi động Ganache
ganache-cli --port 7545

# 2. Deploy contracts
cd contracts
npx hardhat run scripts/deploy-to-ganache.js --network ganache

# 3. Khởi động backend
cd ../backend
npm start

# 4. Khởi động frontend
cd ../frontend
npm start
```

## 📋 Tính năng chính

### **👤 User Features:**
- ✅ Đăng ký thi với thông tin sinh viên
- ✅ Xác minh danh tính qua admin
- ✅ Làm bài thi trực tuyến với timer
- ✅ Nhận NFT chứng nhận khi hoàn thành
- ✅ Xem gallery NFT đã mint

### **👑 Admin Features:**
- ✅ Xác minh danh tính sinh viên
- ✅ Quản lý danh sách chờ mint NFT
- ✅ Mint NFT chứng nhận cho sinh viên
- ✅ Xem thống kê hệ thống

### **⛓️ Blockchain Features:**
- ✅ Smart contracts cho đăng ký thi
- ✅ Smart contracts cho NFT chứng nhận
- ✅ Registry lưu trữ dữ liệu minting
- ✅ Events tracking cho transparency

## 🏗️ Kiến trúc hệ thống

```
📁 cuoi_ki/
├── 📁 contracts/          # Smart contracts
│   ├── 📄 ExamRegistration.sol
│   ├── 📄 ExamCertificateNFT.sol
│   └── 📄 ExamNFTRegistry.sol
├── 📁 backend/            # API Server
│   ├── 📄 server.js
│   └── 📁 routes/
├── 📁 frontend/           # React App
│   ├── 📁 src/
│   └── 📁 public/
└── 📁 scripts/            # Setup scripts
```

## 🔧 Setup chi tiết

### **Yêu cầu hệ thống:**
- Node.js v16+
- npm hoặc yarn
- Ganache (Desktop/CLI)
- MetaMask extension

### **Ports cần thiết:**
- Port 3000: Frontend
- Port 5000: Backend  
- Port 7545: Ganache

### **Setup từng bước:**

#### **1. Cài đặt dependencies**
```bash
# Contracts
cd contracts
npm install

# Backend
cd ../backend
npm install

# Frontend
cd ../frontend
npm install
```

#### **2. Khởi động Ganache**
```bash
# Cách 1: Ganache Desktop
# Mở Ganache Desktop và set port 7545

# Cách 2: Ganache CLI
npm install -g ganache-cli
ganache-cli --port 7545
```

#### **3. Deploy contracts**
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy-to-ganache.js --network ganache
```

#### **4. Cập nhật contract addresses**
Sau khi deploy, cập nhật:
- `backend/routes/nft.js`
- `frontend/src/contracts/contract-address.json`

#### **5. Khởi động services**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm start
```

#### **6. Cấu hình MetaMask**
- Network Name: Ganache
- RPC URL: http://localhost:7545
- Chain ID: 1337
- Currency Symbol: ETH

## 🧪 Testing

### **Test Blockchain:**
```bash
cd contracts
npx hardhat run scripts/test-connection.js --network ganache
```

### **Test API:**
```bash
# Test pending mint
curl http://localhost:3001/api/nft/pending-mint

# Test completed mint  
curl http://localhost:3001/api/nft/completed-mint
```

### **Test Frontend:**
1. Mở http://localhost:3000
2. Kết nối MetaMask
3. Test user flow: Register → Verify → Exam → NFT

## 📊 API Endpoints

### **NFT Management:**
- `GET /api/nft/pending-mint` - Lấy danh sách chờ mint
- `POST /api/nft/pending-mint` - Thêm vào danh sách chờ
- `GET /api/nft/completed-mint` - Lấy danh sách đã mint
- `POST /api/nft/complete-mint/:address` - Chuyển sang đã mint

### **Admin:**
- `GET /api/admin/students` - Lấy danh sách sinh viên
- `POST /api/admin/verify/:address` - Xác minh sinh viên

## 🔍 Troubleshooting

### **Lỗi thường gặp:**

#### **1. Ganache không kết nối**
```bash
# Kiểm tra Ganache
curl http://localhost:7545

# Restart Ganache
ganache-cli --port 7545
```

#### **2. Contract deploy thất bại**
```bash
# Kiểm tra hardhat config
cat contracts/hardhat.config.js

# Kiểm tra network
npx hardhat console --network ganache
```

#### **3. Backend không start**
```bash
# Kiểm tra port 5000
netstat -an | findstr :5000

# Kill process nếu cần
taskkill /f /im node.exe
```

#### **4. MetaMask không kết nối**
- Kiểm tra network settings
- Đảm bảo Chain ID: 1337
- Import account từ Ganache

## 📝 Smart Contracts

### **ExamRegistration.sol**
- Quản lý đăng ký thi
- Lưu thông tin sinh viên
- Xác minh danh tính

### **ExamCertificateNFT.sol**
- Mint NFT chứng nhận
- Metadata cho certificate
- Transfer ownership

### **ExamNFTRegistry.sol**
- Registry cho minting data
- Tracking pending/completed
- Events cho transparency

## 🎯 User Flow

### **Sinh viên:**
1. **Đăng ký thi** → Nhập thông tin sinh viên
2. **Xác minh** → Admin xác minh danh tính
3. **Làm bài thi** → Thi trực tuyến với timer
4. **Nhận NFT** → Admin mint NFT chứng nhận

### **Admin:**
1. **Xác minh sinh viên** → Duyệt danh sách đăng ký
2. **Quản lý minting** → Xem danh sách chờ mint
3. **Mint NFT** → Tạo chứng nhận cho sinh viên

## 🔐 Security Features

- ✅ Smart contract ownership control
- ✅ Admin-only functions
- ✅ Input validation
- ✅ Event logging
- ✅ Blockchain immutability

## 📈 Performance

- ✅ Caching cho blockchain data
- ✅ Optimized contract calls
- ✅ Efficient state management
- ✅ Responsive UI

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Đảm bảo tất cả ports không conflict
3. Restart services nếu cần
4. Kiểm tra network connectivity
5. Verify contract addresses

**🎉 Chúc bạn sử dụng hệ thống thành công!**
 
 
 