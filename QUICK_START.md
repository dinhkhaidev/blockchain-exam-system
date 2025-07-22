# 🚀 Quick Start Guide - Blockchain Exam System

## 📋 Setup nhanh (Thủ công)

### **Bước 1: Khởi động Ganache**

#### **Option A: Ganache CLI**
```bash
# Terminal 1
ganache-cli --port 7545
```

#### **Option B: Ganache GUI (Khuyến nghị)**
1. Mở Ganache GUI
2. Vào Settings → Server
3. Set Port: `7545`, Network ID: `1337`
4. Click "Save and Restart"

### **Bước 2: Test kết nối Ganache**
```bash
# Terminal 2
cd contracts
npx hardhat run scripts/test-ganache.js --network ganache
```

### **Bước 3: Deploy contracts**
```bash
# Terminal 2 (tiếp tục)
npx hardhat run scripts/deploy-to-ganache.js --network ganache
```

### **Bước 4: Khởi động Backend**
```bash
# Terminal 3
cd backend
npm start
```

### **Bước 5: Khởi động Frontend**
```bash
# Terminal 4
cd frontend
npm start
```

## 🎯 Kết quả

Sau khi hoàn thành, bạn sẽ có:
- ✅ Ganache chạy trên port 7545
- ✅ Contracts đã deploy
- ✅ Backend chạy trên port 5000
- ✅ Frontend chạy trên port 3000

## 🌐 Truy cập

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Ganache**: http://localhost:7545

## 🔧 MetaMask Setup

1. Mở MetaMask
2. Thêm network mới:
   - **Network Name**: Ganache
   - **RPC URL**: http://localhost:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

## 🧪 Test nhanh

```bash
# Test backend API
curl http://localhost:3001/api/nft/pending-mint

# Test Ganache
curl http://localhost:7545
```

## 🆘 Troubleshooting

### **Lỗi thường gặp:**

1. **Port đã được sử dụng**
   ```bash
   # Kill process trên port
   netstat -ano | findstr :7545
   taskkill /PID <PID> /F
   ```

2. **Contracts không deploy**
   ```bash
   # Compile lại
   cd contracts
   npx hardhat compile
   ```

3. **Backend không start**
   ```bash
   # Cài đặt dependencies
   cd backend
   npm install
   ```

4. **Frontend không start**
   ```bash
   # Cài đặt dependencies
   cd frontend
   npm install
   ```

## 📝 Ghi chú

- Đảm bảo Ganache chạy trước khi deploy contracts
- Kiểm tra MetaMask network settings
- Backup contract addresses sau khi deploy
- Test từng bước trước khi chạy toàn bộ

**🎉 Chúc bạn setup thành công!** 