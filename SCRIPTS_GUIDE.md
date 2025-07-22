# 📋 Scripts Guide - Blockchain Exam System

## 🚀 Quick Start Scripts

### **Windows Users:**

#### **1. Kiểm tra setup (Khuyến nghị trước tiên)**
```cmd
.\scripts\check-windows.bat
```

#### **2. Khởi động hệ thống**
```powershell
# PowerShell (đơn giản)
.\scripts\start-simple.ps1

# Hoặc Batch file
.\scripts\start-system.bat
```

### **Unix/Linux/Mac Users:**

#### **1. Kiểm tra setup**
```bash
node scripts/check-setup.js
```

#### **2. Khởi động hệ thống**
```bash
node scripts/start-system.js
```

## 📁 Available Scripts

### **Setup & Check Scripts:**

| Script | Platform | Purpose |
|--------|----------|---------|
| `check-setup.js` | All | Kiểm tra toàn bộ setup |
| `check-windows.bat` | Windows | Kiểm tra setup cho Windows |
| `start-system.js` | All | Khởi động hệ thống (Node.js) |
| `start-simple.ps1` | Windows | Khởi động hệ thống (PowerShell đơn giản) |
| `start-system.ps1` | Windows | Khởi động hệ thống (PowerShell đầy đủ) |
| `start-system.bat` | Windows | Khởi động hệ thống (Batch) |

### **Contract Scripts:**

| Script | Purpose |
|--------|---------|
| `deploy-to-ganache.js` | Deploy contracts lên Ganache |
| `test-connection.js` | Test kết nối blockchain |
| `read-blockchain-data.js` | Đọc dữ liệu từ blockchain |

## 🔧 Script Details

### **check-setup.js**
```bash
node scripts/check-setup.js
```
- ✅ Kiểm tra Node.js và npm
- ✅ Kiểm tra Ganache connection
- ✅ Kiểm tra contracts compilation
- ✅ Kiểm tra ports availability
- ✅ Báo cáo chi tiết trạng thái

### **check-windows.bat**
```cmd
.\scripts\check-windows.bat
```
- ✅ Kiểm tra Node.js và npm
- ✅ Kiểm tra Ganache CLI
- ✅ Kiểm tra Hardhat
- ✅ Kiểm tra contracts compilation
- ✅ Kiểm tra ports trên Windows

### **start-system.js**
```bash
node scripts/start-system.js
```
- 🚀 Tự động khởi động Ganache
- 🚀 Tự động deploy contracts
- 🚀 Khởi động backend và frontend
- 🚀 Wait for services ready
- 🚀 Error handling và cleanup

### **start-simple.ps1**
```powershell
.\scripts\start-simple.ps1
```
- 🚀 Script PowerShell đơn giản
- 🚀 Không có Unicode characters
- 🚀 Tương thích tốt với Windows
- 🚀 Error handling cơ bản

### **start-system.bat**
```cmd
.\scripts\start-system.bat
```
- 🚀 Script Batch đơn giản
- 🚀 Không cần PowerShell
- 🚀 Tự động kill processes khi exit
- 🚀 Timeout cho các services

## 🎯 Usage Examples

### **Scenario 1: First Time Setup**
```bash
# 1. Kiểm tra setup
node scripts/check-setup.js

# 2. Nếu có lỗi, fix theo hướng dẫn
# 3. Khởi động hệ thống
node scripts/start-system.js
```

### **Scenario 2: Windows Setup**
```cmd
# 1. Kiểm tra setup
.\scripts\check-windows.bat

# 2. Nếu OK, khởi động
.\scripts\start-simple.ps1
```

### **Scenario 3: Manual Setup**
```bash
# 1. Start Ganache
ganache-cli --port 7545

# 2. Deploy contracts
cd contracts
npx hardhat run scripts/deploy-to-ganache.js --network ganache

# 3. Start backend
cd ../backend
npm start

# 4. Start frontend
cd ../frontend
npm start
```

## 🔍 Troubleshooting

### **Lỗi thường gặp:**

#### **1. PowerShell không chạy được**
```cmd
# Sử dụng Batch file thay thế
.\scripts\start-system.bat
```

#### **2. Node.js script không chạy**
```bash
# Kiểm tra Node.js
node --version

# Cài đặt dependencies
npm install
```

#### **3. Ganache không start**
```bash
# Cài đặt Ganache CLI
npm install -g ganache-cli

# Hoặc sử dụng Ganache Desktop
```

#### **4. Contracts không deploy**
```bash
# Compile contracts
cd contracts
npx hardhat compile

# Deploy lại
npx hardhat run scripts/deploy-to-ganache.js --network ganache
```

## 📊 Script Output Examples

### **Successful Setup Check:**
```
🔍 Checking system setup...

📦 Checking Node.js...
✅ Node.js version: v18.17.0
✅ npm version: 9.6.7

⛓️ Checking Ganache...
✅ Ganache is running on port 7545

📋 Checking contracts...
✅ Contracts compiled successfully

🔧 Checking backend...
✅ Backend directory exists

🎨 Checking frontend...
✅ Frontend directory exists

🔌 Checking ports...
✅ Port 3000 (Frontend) is available
✅ Port 5000 (Backend) is available
✅ Port 7545 (Ganache) is in use

📊 Check Results:
✅ PASS - Node.js
✅ PASS - Ganache
✅ PASS - Contracts
✅ PASS - Backend
✅ PASS - Frontend
✅ PASS - Ports

🎯 Overall: 6/6 checks passed

🎉 All checks passed! System is ready to run.
```

### **Successful System Start:**
```
🚀 Starting Blockchain Exam System...

⛓️ Starting Ganache...
📦 Deploying contracts...
✅ Contracts deployed successfully
🔧 Starting backend...
🎨 Starting frontend...
✅ Backend is ready
✅ Frontend is ready

🎉 System started successfully!

📋 Services running:
✅ Ganache: http://localhost:7545
✅ Backend: http://localhost:3001
✅ Frontend: http://localhost:3000

🌐 Open your browser and go to: http://localhost:3000
🔗 Don't forget to connect MetaMask to Ganache network
```

## 🎯 Tips

1. **Luôn chạy check script trước** để đảm bảo setup đúng
2. **Sử dụng script phù hợp với OS** của bạn
3. **Kiểm tra ports** trước khi chạy
4. **Backup contract addresses** sau khi deploy
5. **Test từng bước** nếu gặp lỗi

## 🆘 Support

Nếu gặp vấn đề:
1. Chạy check script để diagnose
2. Kiểm tra logs trong terminal
3. Đảm bảo tất cả dependencies đã cài đặt
4. Restart services nếu cần
5. Kiểm tra network connectivity

**🎉 Chúc bạn sử dụng scripts thành công!** 