# Hướng dẫn thiết lập Owner cho hệ thống

## Vấn đề hiện tại
Bạn đang gặp lỗi "Vui lòng sử dụng tài khoản Owner để truy cập Admin Dashboard" vì địa chỉ ví của bạn chưa phải là owner của smart contract.

## Giải pháp

### Cách 1: Deploy lại contract (Khuyến nghị)

1. **Đảm bảo Ganache đang chạy**
   ```bash
   # Kiểm tra Ganache đang chạy trên port 8545
   ```

2. **Import địa chỉ ví vào Ganache**
   - Mở Ganache
   - Vào tab "Accounts"
   - Click "Import Account"
   - Nhập private key của ví `0x4ee204518233e2e71025c75e59ef204435479844`
   - Hoặc tạo account mới và copy địa chỉ

3. **Deploy lại contract**
   ```bash
   cd contracts
   npx hardhat run deploy-simple.js --network localhost
   ```

4. **Cập nhật địa chỉ contract trong frontend**
   - Mở file `frontend/src/contexts/Web3Context.js`
   - Cập nhật 2 địa chỉ contract mới:
     ```javascript
     const EXAM_REGISTRATION_ADDRESS = 'ĐỊA_CHỈ_MỚI_1';
     const EXAM_CERTIFICATE_NFT_ADDRESS = 'ĐỊA_CHỈ_MỚI_2';
     ```

5. **Restart frontend**
   ```bash
   cd frontend
   npm start
   ```

6. **Kết nối ví và truy cập Admin**
   - Kết nối MetaMask với địa chỉ ví của bạn
   - Truy cập `/admin`
   - Bây giờ bạn sẽ có quyền owner

### Cách 2: Sử dụng chức năng "Thiết lập Owner"

1. **Kết nối ví MetaMask**
   - Mở trang Admin Dashboard
   - Click "Kết nối MetaMask"

2. **Sử dụng chức năng thiết lập**
   - Click "Thiết lập Owner mới"
   - Nhập địa chỉ ví của bạn: `0x4ee204518233e2e71025c75e59ef204435479844`
   - Click "Thiết lập Owner"

3. **Lưu ý**: Cách này chỉ hoạt động nếu owner hiện tại cho phép

### Cách 3: Sử dụng Hardhat Console

1. **Mở Hardhat Console**
   ```bash
   cd contracts
   npx hardhat console --network localhost
   ```

2. **Kiểm tra owner hiện tại**
   ```javascript
   const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
   const contract = ExamRegistration.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
   const owner = await contract.owner();
   console.log("Owner:", owner);
   ```

3. **Chuyển ownership (nếu có quyền)**
   ```javascript
   const tx = await contract.transferOwnership("0x4ee204518233e2e71025c75e59ef204435479844");
   await tx.wait();
   ```

## Kiểm tra kết quả

Sau khi hoàn thành, bạn có thể kiểm tra:

1. **Truy cập Admin Dashboard**
   - Vào `/admin`
   - Kết nối ví MetaMask
   - Bạn sẽ thấy Admin Dashboard với đầy đủ quyền

2. **Kiểm tra quyền Owner**
   - Tab "Quản lý Owner" sẽ hiển thị
   - Bạn có thể thêm/xóa sinh viên khỏi whitelist
   - Có thể chuyển quyền ownership

## Troubleshooting

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Bạn không phải owner hiện tại
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "MetaMask is not installed"
- **Nguyên nhân**: Chưa cài MetaMask
- **Giải pháp**: Cài đặt MetaMask extension

### Lỗi "Network not found"
- **Nguyên nhân**: MetaMask chưa kết nối đúng network
- **Giải pháp**: Thêm network localhost:8545 vào MetaMask

### Lỗi "Insufficient funds"
- **Nguyên nhân**: Ví không đủ ETH
- **Giải pháp**: Import account có ETH vào Ganache

## Thông tin liên hệ

Nếu gặp vấn đề, hãy kiểm tra:
1. Ganache đang chạy
2. MetaMask kết nối đúng network
3. Địa chỉ ví chính xác
4. Contract đã được deploy thành công 
 
 
 