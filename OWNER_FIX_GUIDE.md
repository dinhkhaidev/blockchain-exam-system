# Hướng dẫn khắc phục vấn đề Owner

## Vấn đề hiện tại
Bạn đang gặp lỗi "Không có quyền truy cập" mặc dù địa chỉ ví hiển thị là Owner. Điều này xảy ra vì:

1. **Contract chưa được deploy với địa chỉ ví của bạn làm owner**
2. **Địa chỉ contract trong frontend không đúng**
3. **Vấn đề với việc kiểm tra quyền owner**

## Giải pháp

### Bước 1: Kiểm tra trạng thái hiện tại

1. **Truy cập Admin Dashboard**
   - Vào `/admin`
   - Kết nối ví MetaMask
   - Xem thông tin Owner hiện tại

2. **Sử dụng component OwnerSetup**
   - Click "Kiểm tra Owner hiện tại"
   - Xem địa chỉ owner thực tế của contract

### Bước 2: Deploy lại contract (Nếu cần)

#### Cách 1: Sử dụng Hardhat Console
```bash
cd contracts
npx hardhat console --network localhost
```

Trong console:
```javascript
// Deploy ExamRegistration
const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
const examRegistration = await ExamRegistration.deploy();
await examRegistration.waitForDeployment();
const examRegistrationAddress = await examRegistration.getAddress();
console.log("ExamRegistration:", examRegistrationAddress);

// Deploy ExamCertificateNFT
const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
await examCertificateNFT.waitForDeployment();
const examCertificateNFTAddress = await examCertificateNFT.getAddress();
console.log("ExamCertificateNFT:", examCertificateNFTAddress);

// Transfer ownership
const tx = await examRegistration.transferOwnership("0xb873ad3db908b6689e53ef8da3f36d82c7bdef84");
await tx.wait();
console.log("Owner set to:", await examRegistration.owner());
```

#### Cách 2: Sử dụng script
```bash
cd contracts
npx hardhat run scripts/deploy-new.js --network localhost
```

### Bước 3: Cập nhật địa chỉ contract

Sau khi deploy, cập nhật file `frontend/src/contexts/Web3Context.js`:

```javascript
// Thay thế địa chỉ cũ bằng địa chỉ mới
const EXAM_REGISTRATION_ADDRESS = 'ĐỊA_CHỈ_MỚI_1';
const EXAM_CERTIFICATE_NFT_ADDRESS = 'ĐỊA_CHỈ_MỚI_2';
```

### Bước 4: Restart ứng dụng

```bash
cd frontend
npm start
```

### Bước 5: Kiểm tra lại

1. **Kết nối ví MetaMask**
2. **Truy cập Admin Dashboard**
3. **Kiểm tra quyền Owner**
4. **Thử sử dụng các tính năng Admin**

## Troubleshooting

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Bạn không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Contract not found"
- **Nguyên nhân**: Địa chỉ contract không đúng
- **Giải pháp**: Cập nhật địa chỉ contract trong frontend

### Lỗi "Network not found"
- **Nguyên nhân**: MetaMask chưa kết nối đúng network
- **Giải pháp**: Thêm network localhost:8545 vào MetaMask

### Lỗi "Insufficient funds"
- **Nguyên nhân**: Ví không đủ ETH để deploy
- **Giải pháp**: Import account có ETH vào Ganache

## Kiểm tra nhanh

### 1. Kiểm tra Ganache
- Đảm bảo Ganache đang chạy trên port 8545
- Kiểm tra có đủ ETH trong account

### 2. Kiểm tra MetaMask
- Kết nối network localhost:8545
- Đảm bảo đúng địa chỉ ví

### 3. Kiểm tra Contract
```javascript
// Trong browser console
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  ABI,
  provider
);
const owner = await contract.owner();
console.log('Owner:', owner);
```

## Thông tin liên hệ

### Địa chỉ ví của bạn
```
0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
```

### Địa chỉ contract hiện tại
```
ExamRegistration: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ExamCertificateNFT: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### Network
```
localhost:8545 (Ganache)
```

## Các bước tiếp theo

1. **Deploy contract mới** với địa chỉ ví của bạn làm owner
2. **Cập nhật địa chỉ** trong frontend
3. **Restart ứng dụng**
4. **Kiểm tra quyền** trong Admin Dashboard
5. **Thử sử dụng** các tính năng Admin

Nếu vẫn gặp vấn đề, hãy kiểm tra:
- Console log trong browser
- Ganache logs
- MetaMask connection
- Contract deployment status 

## Vấn đề hiện tại
Bạn đang gặp lỗi "Không có quyền truy cập" mặc dù địa chỉ ví hiển thị là Owner. Điều này xảy ra vì:

1. **Contract chưa được deploy với địa chỉ ví của bạn làm owner**
2. **Địa chỉ contract trong frontend không đúng**
3. **Vấn đề với việc kiểm tra quyền owner**

## Giải pháp

### Bước 1: Kiểm tra trạng thái hiện tại

1. **Truy cập Admin Dashboard**
   - Vào `/admin`
   - Kết nối ví MetaMask
   - Xem thông tin Owner hiện tại

2. **Sử dụng component OwnerSetup**
   - Click "Kiểm tra Owner hiện tại"
   - Xem địa chỉ owner thực tế của contract

### Bước 2: Deploy lại contract (Nếu cần)

#### Cách 1: Sử dụng Hardhat Console
```bash
cd contracts
npx hardhat console --network localhost
```

Trong console:
```javascript
// Deploy ExamRegistration
const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
const examRegistration = await ExamRegistration.deploy();
await examRegistration.waitForDeployment();
const examRegistrationAddress = await examRegistration.getAddress();
console.log("ExamRegistration:", examRegistrationAddress);

// Deploy ExamCertificateNFT
const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
await examCertificateNFT.waitForDeployment();
const examCertificateNFTAddress = await examCertificateNFT.getAddress();
console.log("ExamCertificateNFT:", examCertificateNFTAddress);

// Transfer ownership
const tx = await examRegistration.transferOwnership("0xb873ad3db908b6689e53ef8da3f36d82c7bdef84");
await tx.wait();
console.log("Owner set to:", await examRegistration.owner());
```

#### Cách 2: Sử dụng script
```bash
cd contracts
npx hardhat run scripts/deploy-new.js --network localhost
```

### Bước 3: Cập nhật địa chỉ contract

Sau khi deploy, cập nhật file `frontend/src/contexts/Web3Context.js`:

```javascript
// Thay thế địa chỉ cũ bằng địa chỉ mới
const EXAM_REGISTRATION_ADDRESS = 'ĐỊA_CHỈ_MỚI_1';
const EXAM_CERTIFICATE_NFT_ADDRESS = 'ĐỊA_CHỈ_MỚI_2';
```

### Bước 4: Restart ứng dụng

```bash
cd frontend
npm start
```

### Bước 5: Kiểm tra lại

1. **Kết nối ví MetaMask**
2. **Truy cập Admin Dashboard**
3. **Kiểm tra quyền Owner**
4. **Thử sử dụng các tính năng Admin**

## Troubleshooting

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Bạn không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Contract not found"
- **Nguyên nhân**: Địa chỉ contract không đúng
- **Giải pháp**: Cập nhật địa chỉ contract trong frontend

### Lỗi "Network not found"
- **Nguyên nhân**: MetaMask chưa kết nối đúng network
- **Giải pháp**: Thêm network localhost:8545 vào MetaMask

### Lỗi "Insufficient funds"
- **Nguyên nhân**: Ví không đủ ETH để deploy
- **Giải pháp**: Import account có ETH vào Ganache

## Kiểm tra nhanh

### 1. Kiểm tra Ganache
- Đảm bảo Ganache đang chạy trên port 8545
- Kiểm tra có đủ ETH trong account

### 2. Kiểm tra MetaMask
- Kết nối network localhost:8545
- Đảm bảo đúng địa chỉ ví

### 3. Kiểm tra Contract
```javascript
// Trong browser console
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  ABI,
  provider
);
const owner = await contract.owner();
console.log('Owner:', owner);
```

## Thông tin liên hệ

### Địa chỉ ví của bạn
```
0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
```

### Địa chỉ contract hiện tại
```
ExamRegistration: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ExamCertificateNFT: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### Network
```
localhost:8545 (Ganache)
```

## Các bước tiếp theo

1. **Deploy contract mới** với địa chỉ ví của bạn làm owner
2. **Cập nhật địa chỉ** trong frontend
3. **Restart ứng dụng**
4. **Kiểm tra quyền** trong Admin Dashboard
5. **Thử sử dụng** các tính năng Admin

Nếu vẫn gặp vấn đề, hãy kiểm tra:
- Console log trong browser
- Ganache logs
- MetaMask connection
- Contract deployment status 

## Vấn đề hiện tại
Bạn đang gặp lỗi "Không có quyền truy cập" mặc dù địa chỉ ví hiển thị là Owner. Điều này xảy ra vì:

1. **Contract chưa được deploy với địa chỉ ví của bạn làm owner**
2. **Địa chỉ contract trong frontend không đúng**
3. **Vấn đề với việc kiểm tra quyền owner**

## Giải pháp

### Bước 1: Kiểm tra trạng thái hiện tại

1. **Truy cập Admin Dashboard**
   - Vào `/admin`
   - Kết nối ví MetaMask
   - Xem thông tin Owner hiện tại

2. **Sử dụng component OwnerSetup**
   - Click "Kiểm tra Owner hiện tại"
   - Xem địa chỉ owner thực tế của contract

### Bước 2: Deploy lại contract (Nếu cần)

#### Cách 1: Sử dụng Hardhat Console
```bash
cd contracts
npx hardhat console --network localhost
```

Trong console:
```javascript
// Deploy ExamRegistration
const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
const examRegistration = await ExamRegistration.deploy();
await examRegistration.waitForDeployment();
const examRegistrationAddress = await examRegistration.getAddress();
console.log("ExamRegistration:", examRegistrationAddress);

// Deploy ExamCertificateNFT
const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
await examCertificateNFT.waitForDeployment();
const examCertificateNFTAddress = await examCertificateNFT.getAddress();
console.log("ExamCertificateNFT:", examCertificateNFTAddress);

// Transfer ownership
const tx = await examRegistration.transferOwnership("0xb873ad3db908b6689e53ef8da3f36d82c7bdef84");
await tx.wait();
console.log("Owner set to:", await examRegistration.owner());
```

#### Cách 2: Sử dụng script
```bash
cd contracts
npx hardhat run scripts/deploy-new.js --network localhost
```

### Bước 3: Cập nhật địa chỉ contract

Sau khi deploy, cập nhật file `frontend/src/contexts/Web3Context.js`:

```javascript
// Thay thế địa chỉ cũ bằng địa chỉ mới
const EXAM_REGISTRATION_ADDRESS = 'ĐỊA_CHỈ_MỚI_1';
const EXAM_CERTIFICATE_NFT_ADDRESS = 'ĐỊA_CHỈ_MỚI_2';
```

### Bước 4: Restart ứng dụng

```bash
cd frontend
npm start
```

### Bước 5: Kiểm tra lại

1. **Kết nối ví MetaMask**
2. **Truy cập Admin Dashboard**
3. **Kiểm tra quyền Owner**
4. **Thử sử dụng các tính năng Admin**

## Troubleshooting

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Bạn không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Contract not found"
- **Nguyên nhân**: Địa chỉ contract không đúng
- **Giải pháp**: Cập nhật địa chỉ contract trong frontend

### Lỗi "Network not found"
- **Nguyên nhân**: MetaMask chưa kết nối đúng network
- **Giải pháp**: Thêm network localhost:8545 vào MetaMask

### Lỗi "Insufficient funds"
- **Nguyên nhân**: Ví không đủ ETH để deploy
- **Giải pháp**: Import account có ETH vào Ganache

## Kiểm tra nhanh

### 1. Kiểm tra Ganache
- Đảm bảo Ganache đang chạy trên port 8545
- Kiểm tra có đủ ETH trong account

### 2. Kiểm tra MetaMask
- Kết nối network localhost:8545
- Đảm bảo đúng địa chỉ ví

### 3. Kiểm tra Contract
```javascript
// Trong browser console
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  ABI,
  provider
);
const owner = await contract.owner();
console.log('Owner:', owner);
```

## Thông tin liên hệ

### Địa chỉ ví của bạn
```
0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
```

### Địa chỉ contract hiện tại
```
ExamRegistration: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ExamCertificateNFT: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### Network
```
localhost:8545 (Ganache)
```

## Các bước tiếp theo

1. **Deploy contract mới** với địa chỉ ví của bạn làm owner
2. **Cập nhật địa chỉ** trong frontend
3. **Restart ứng dụng**
4. **Kiểm tra quyền** trong Admin Dashboard
5. **Thử sử dụng** các tính năng Admin

Nếu vẫn gặp vấn đề, hãy kiểm tra:
- Console log trong browser
- Ganache logs
- MetaMask connection
- Contract deployment status 

## Vấn đề hiện tại
Bạn đang gặp lỗi "Không có quyền truy cập" mặc dù địa chỉ ví hiển thị là Owner. Điều này xảy ra vì:

1. **Contract chưa được deploy với địa chỉ ví của bạn làm owner**
2. **Địa chỉ contract trong frontend không đúng**
3. **Vấn đề với việc kiểm tra quyền owner**

## Giải pháp

### Bước 1: Kiểm tra trạng thái hiện tại

1. **Truy cập Admin Dashboard**
   - Vào `/admin`
   - Kết nối ví MetaMask
   - Xem thông tin Owner hiện tại

2. **Sử dụng component OwnerSetup**
   - Click "Kiểm tra Owner hiện tại"
   - Xem địa chỉ owner thực tế của contract

### Bước 2: Deploy lại contract (Nếu cần)

#### Cách 1: Sử dụng Hardhat Console
```bash
cd contracts
npx hardhat console --network localhost
```

Trong console:
```javascript
// Deploy ExamRegistration
const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
const examRegistration = await ExamRegistration.deploy();
await examRegistration.waitForDeployment();
const examRegistrationAddress = await examRegistration.getAddress();
console.log("ExamRegistration:", examRegistrationAddress);

// Deploy ExamCertificateNFT
const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
const examCertificateNFT = await ExamCertificateNFT.deploy(examRegistrationAddress);
await examCertificateNFT.waitForDeployment();
const examCertificateNFTAddress = await examCertificateNFT.getAddress();
console.log("ExamCertificateNFT:", examCertificateNFTAddress);

// Transfer ownership
const tx = await examRegistration.transferOwnership("0xb873ad3db908b6689e53ef8da3f36d82c7bdef84");
await tx.wait();
console.log("Owner set to:", await examRegistration.owner());
```

#### Cách 2: Sử dụng script
```bash
cd contracts
npx hardhat run scripts/deploy-new.js --network localhost
```

### Bước 3: Cập nhật địa chỉ contract

Sau khi deploy, cập nhật file `frontend/src/contexts/Web3Context.js`:

```javascript
// Thay thế địa chỉ cũ bằng địa chỉ mới
const EXAM_REGISTRATION_ADDRESS = 'ĐỊA_CHỈ_MỚI_1';
const EXAM_CERTIFICATE_NFT_ADDRESS = 'ĐỊA_CHỈ_MỚI_2';
```

### Bước 4: Restart ứng dụng

```bash
cd frontend
npm start
```

### Bước 5: Kiểm tra lại

1. **Kết nối ví MetaMask**
2. **Truy cập Admin Dashboard**
3. **Kiểm tra quyền Owner**
4. **Thử sử dụng các tính năng Admin**

## Troubleshooting

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Bạn không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Contract not found"
- **Nguyên nhân**: Địa chỉ contract không đúng
- **Giải pháp**: Cập nhật địa chỉ contract trong frontend

### Lỗi "Network not found"
- **Nguyên nhân**: MetaMask chưa kết nối đúng network
- **Giải pháp**: Thêm network localhost:8545 vào MetaMask

### Lỗi "Insufficient funds"
- **Nguyên nhân**: Ví không đủ ETH để deploy
- **Giải pháp**: Import account có ETH vào Ganache

## Kiểm tra nhanh

### 1. Kiểm tra Ganache
- Đảm bảo Ganache đang chạy trên port 8545
- Kiểm tra có đủ ETH trong account

### 2. Kiểm tra MetaMask
- Kết nối network localhost:8545
- Đảm bảo đúng địa chỉ ví

### 3. Kiểm tra Contract
```javascript
// Trong browser console
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  ABI,
  provider
);
const owner = await contract.owner();
console.log('Owner:', owner);
```

## Thông tin liên hệ

### Địa chỉ ví của bạn
```
0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
```

### Địa chỉ contract hiện tại
```
ExamRegistration: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ExamCertificateNFT: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### Network
```
localhost:8545 (Ganache)
```

## Các bước tiếp theo

1. **Deploy contract mới** với địa chỉ ví của bạn làm owner
2. **Cập nhật địa chỉ** trong frontend
3. **Restart ứng dụng**
4. **Kiểm tra quyền** trong Admin Dashboard
5. **Thử sử dụng** các tính năng Admin

Nếu vẫn gặp vấn đề, hãy kiểm tra:
- Console log trong browser
- Ganache logs
- MetaMask connection
- Contract deployment status 