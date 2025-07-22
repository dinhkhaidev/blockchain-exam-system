# 🚀 Ganache GUI Quick Start

## 📋 Setup nhanh Ganache GUI

### **1. Mở Ganache GUI**
- Khởi động Ganache GUI từ Start Menu
- Chọn "Quickstart"

### **2. Cấu hình Port**
1. Click **Settings** (biểu tượng bánh răng)
2. Tab **Server**:
   - **Port Number**: `7545`
   - **Network ID**: `1337`
3. Click **Save and Restart**

### **3. Kiểm tra kết nối**
```powershell
# PowerShell
.\scripts\run-simple.ps1

# Hoặc Batch
.\scripts\run-simple.bat
```

## 🎯 Test Ganache GUI

### **Option 1: Script đơn giản**
```powershell
# Chọn option 1 để kiểm tra Ganache GUI
.\scripts\run-simple.ps1
```

### **Option 2: Thủ công**
```bash
# Test kết nối
curl http://127.0.0.1:7545

# Hoặc
curl http://localhost:7545
```

### **Option 3: Hardhat test**
```bash
cd contracts
npx hardhat run scripts/test-ganache.js --network ganache
```

## 🔧 Các bước tiếp theo

### **1. Deploy contracts**
```bash
cd contracts
npx hardhat run scripts/deploy-to-ganache.js --network ganache
```

### **2. Start backend**
```bash
cd backend
npm start
```

### **3. Start frontend**
```bash
cd frontend
npm start
```

## 🌐 Truy cập

- **Ganache GUI**: http://127.0.0.1:7545 hoặc http://localhost:7545
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🔗 MetaMask Setup

### **Import Account**
1. Mở Ganache GUI
2. Copy private key từ account đầu tiên
3. Mở MetaMask → Import Account
4. Paste private key

### **Add Network**
1. MetaMask → Add Network
2. Thông tin:
   - **Network Name**: Ganache
   - **RPC URL**: http://127.0.0.1:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

## 🆘 Troubleshooting

### **Lỗi: Ganache không kết nối**
1. Kiểm tra Ganache GUI đang chạy
2. Kiểm tra port 7545 trong Settings
3. Restart Ganache GUI

### **Lỗi: Hardhat không kết nối**
```bash
cd contracts
npx hardhat run scripts/test-ganache.js --network ganache
```

### **Lỗi: Port đã được sử dụng**
```bash
# Kiểm tra process
netstat -ano | findstr :7545

# Kill process
taskkill /PID <PID> /F
```

## 📝 Ghi chú

- Ganache GUI chạy độc lập, không cần CLI
- Port 7545 phải được cấu hình trong Settings
- Có thể truy cập qua http://127.0.0.1:7545 hoặc http://localhost:7545
- Private keys có thể copy từ Ganache GUI

**🎉 Ganache GUI ready!** 