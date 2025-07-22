# MetaMask Minting Debug Guide

## 🚨 Lỗi "missing revert data"

Lỗi này thường xảy ra khi có vấn đề với:
1. **Contract parameters** không đúng
2. **Owner status** không đúng
3. **Network connection** sai
4. **Gas estimation** fail

## 🔧 Cách Debug

### 1. Sử dụng Debug Script

Mở browser console trên MetaMask Admin page và chạy:

```javascript
// Copy nội dung từ file debug-metamask.js
// Sau đó chạy:
window.debugMetaMask.runAllDebug()
```

### 2. Sử dụng Simple Test

1. Truy cập: `http://localhost:3000/metamask-admin`
2. Chọn tab "Simple Test"
3. Click "Test Mint NFT"
4. Kiểm tra console logs

### 3. Kiểm tra thủ công

#### A. MetaMask Connection
```javascript
// Kiểm tra MetaMask
if (typeof window.ethereum !== 'undefined') {
  console.log('✅ MetaMask available');
} else {
  console.log('❌ MetaMask not available');
}
```

#### B. Network
```javascript
// Kiểm tra network
const chainId = await window.ethereum.request({
  method: 'eth_chainId'
});
console.log('Chain ID:', chainId); // Phải là 0x539 (Ganache)
```

#### C. Owner Status
```javascript
// Kiểm tra owner
const { contracts, account } = useWeb3();
const owner = await contracts.examCertificateNFT.owner();
console.log('Owner:', owner);
console.log('Account:', account);
console.log('Is owner:', owner.toLowerCase() === account.toLowerCase());
```

## 🛠️ Các bước sửa lỗi

### 1. Kiểm tra MetaMask Setup
- ✅ MetaMask extension đã cài
- ✅ Connect Ganache network (Chain ID: 1337)
- ✅ Import owner account (Account 0 từ Ganache)

### 2. Kiểm tra Contract
- ✅ Contract đã deploy
- ✅ Contract address đúng
- ✅ ABI đúng

### 3. Kiểm tra Parameters
- ✅ Student wallet address hợp lệ
- ✅ Token URI đúng format
- ✅ Tất cả required fields có giá trị

### 4. Kiểm tra Owner
- ✅ MetaMask account là contract owner
- ✅ Có đủ ETH cho gas fees

## 🧪 Test Cases

### Test 1: Basic Connection
```javascript
// Kiểm tra kết nối cơ bản
window.debugMetaMask.debugMetaMaskConnection()
```

### Test 2: Owner Status
```javascript
// Kiểm tra owner status
window.debugMetaMask.debugOwnerStatus()
```

### Test 3: Gas Estimation
```javascript
// Kiểm tra gas estimation
window.debugMetaMask.debugGasEstimation()
```

## 📋 Checklist

- [ ] MetaMask installed và connected
- [ ] Ganache network added (Chain ID: 1337)
- [ ] Owner account imported
- [ ] Contract deployed và address correct
- [ ] Sufficient ETH balance
- [ ] All form fields filled
- [ ] Token URI format correct

## 🚀 Quick Fix

Nếu vẫn gặp lỗi:

1. **Restart Ganache**
2. **Redeploy contracts**
3. **Clear browser cache**
4. **Reconnect MetaMask**
5. **Use Simple Test first**

## 📞 Support

Nếu vẫn không được:
1. Check console logs
2. Run debug script
3. Verify all checklist items
4. Try Simple Test component 