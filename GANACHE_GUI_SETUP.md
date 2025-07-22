# 🖥️ Ganache GUI Setup Guide

## 📋 Cài đặt Ganache GUI

### **1. Tải Ganache GUI**
- Truy cập: https://trufflesuite.com/ganache/
- Tải phiên bản cho Windows
- Cài đặt như bình thường

### **2. Cấu hình Ganache GUI**

#### **Bước 1: Mở Ganache GUI**
- Khởi động Ganache GUI từ Start Menu
- Chọn "Quickstart" để tạo workspace mới

#### **Bước 2: Cấu hình Port**
1. Click vào **Settings** (biểu tượng bánh răng)
2. Trong tab **Server**:
   - **Port Number**: `7545`
   - **Network ID**: `1337`
   - **Automine**: ✅ Enabled
3. Click **Save and Restart**

#### **Bước 3: Kiểm tra kết nối**
- Ganache sẽ hiển thị 10 accounts với 100 ETH mỗi account
- Port 7545 sẽ được sử dụng

## 🚀 Sử dụng với Blockchain Exam System

### **Option 1: Kiểm tra Ganache GUI**
```powershell
# Kiểm tra Ganache GUI
.\scripts\check-ganache-gui.ps1
```

### **Option 2: Chạy từng lệnh**
```powershell
# Menu để chạy từng lệnh
.\scripts\run-commands-separate.ps1
```

### **Option 3: Thủ công**
```bash
# 1. Đảm bảo Ganache GUI đang chạy trên port 7545

# 2. Test kết nối
cd contracts
npx hardhat run scripts/test-ganache.js --network ganache

# 3. Deploy contracts
npx hardhat run scripts/deploy-to-ganache.js --network ganache

# 4. Start backend
cd ../backend
npm start

# 5. Start frontend
cd ../frontend
npm start
```

## 🔧 Cấu hình Hardhat

### **Kiểm tra hardhat.config.js**
Đảm bảo có network ganache:
```javascript
module.exports = {
  networks: {
    ganache: {
      url: "http://localhost:7545",
      chainId: 1337
    }
  }
}
```

## 🧪 Test kết nối

### **Test 1: Kiểm tra Ganache GUI**
```powershell
# PowerShell
.\scripts\check-ganache-gui.ps1
```

### **Test 2: Test Hardhat connection**
```bash
cd contracts
npx hardhat run scripts/test-ganache.js --network ganache
```

### **Test 3: Test API**
```bash
curl http://localhost:7545
```

## 📊 Ganache GUI Features

### **Accounts Tab**
- Xem 10 accounts với private keys
- Copy address và private key để import vào MetaMask

### **Blocks Tab**
- Xem các blocks đã tạo
- Xem transactions trong mỗi block

### **Transactions Tab**
- Xem tất cả transactions
- Xem chi tiết từng transaction

### **Logs Tab**
- Xem logs của Ganache
- Debug nếu có lỗi

## 🔗 MetaMask Integration

### **Import Account**
1. Mở MetaMask
2. Click "Import Account"
3. Copy private key từ Ganache GUI
4. Paste vào MetaMask

### **Add Network**
1. Mở MetaMask
2. Click "Add Network"
3. Thêm thông tin:
   - **Network Name**: Ganache
   - **RPC URL**: http://localhost:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

## 🆘 Troubleshooting

### **Lỗi 1: Port 7545 đã được sử dụng**
```bash
# Kiểm tra process
netstat -ano | findstr :7545

# Kill process
taskkill /PID <PID> /F
```

### **Lỗi 2: Ganache không kết nối**
1. Kiểm tra Ganache GUI đang chạy
2. Kiểm tra port 7545
3. Restart Ganache GUI

### **Lỗi 3: Hardhat không kết nối**
```bash
# Test connection
cd contracts
npx hardhat run scripts/test-ganache.js --network ganache
```

### **Lỗi 4: MetaMask không kết nối**
1. Kiểm tra network settings
2. Import account từ Ganache GUI
3. Đảm bảo Chain ID: 1337

## 📝 Ghi chú quan trọng

1. **Ganache GUI** chạy độc lập, không cần CLI
2. **Port 7545** phải được cấu hình trong Settings
3. **Private keys** có thể copy từ Ganache GUI
4. **Network ID** phải là 1337
5. **MetaMask** cần import account từ Ganache GUI

## 🎯 Kết quả

Sau khi setup:
- ✅ Ganache GUI chạy trên port 7545
- ✅ 10 accounts với 100 ETH mỗi account
- ✅ Hardhat có thể kết nối
- ✅ MetaMask có thể import accounts
- ✅ Contracts có thể deploy

**🎉 Ganache GUI setup hoàn tất!** 