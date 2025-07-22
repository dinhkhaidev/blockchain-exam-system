# Hướng dẫn Setup Dự Án Blockchain DNTU

## 1. Yêu cầu hệ thống
- Node.js >= 16
- npm >= 8
- Ganache (CLI hoặc GUI)
- MetaMask (trên trình duyệt)

## 2. Cài đặt dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3. Khởi động Ganache
- **Khuyến nghị:** Sử dụng Ganache GUI (mặc định cổng 7545) với file dữ liệu để không mất dữ liệu khi restart.

```bash
ganache --db ./ganache-data --chain.chainId 1337 --port 7545
```
- Hoặc dùng Ganache GUI, chọn workspace và lưu file dữ liệu.

## 4. Deploy lại smart contract
- Lấy private key account đầu tiên của Ganache GUI (copy từ giao diện Ganache)
- Deploy bằng lệnh:
```bash
PRIVATE_KEY=0xyourganachekey node scripts/deploy-new.js
```
(Thay `0xyourganachekey` bằng private key account đầu tiên của Ganache GUI)
- Đảm bảo Ganache đang chạy ở cổng 7545 (`http://127.0.0.1:7545`)

## 5. Cấu hình contract address cho FE/BE
- Đảm bảo file `contracts/contract-address.json` được cập nhật đúng địa chỉ contract mới.
- FE/BE sẽ tự động đọc file này để kết nối blockchain.

## 6. Chạy backend và frontend
```bash
cd backend && npm start
cd ../frontend && npm start
```

## 7. Tạo dữ liệu mẫu (nếu cần)
```bash
cd scripts
node create-test-data.js
```

## 8. Kiểm tra whitelist và NFT trực tiếp từ blockchain
- **Whitelist:** FE sẽ lấy danh sách whitelist qua hàm `getWhitelistedAddresses()` trên contract.
- **NFT đã mint:** FE sẽ lấy danh sách NFT đã mint qua hàm `getTotalCertificates()` và duyệt từng tokenId để lấy thông tin chi tiết.
- **Không phụ thuộc backend tạm thời.**

## 9. Best Practice giữ dữ liệu blockchain
- Luôn chạy Ganache với tham số `--db` để không mất dữ liệu khi restart.
- Không xóa thư mục `ganache-data` nếu muốn giữ lại toàn bộ whitelist, NFT, trạng thái contract.
- Nếu deploy lại contract, cần cập nhật lại contract address cho FE/BE.

## 10. Lưu ý khi phát triển
- Khi thay đổi contract, luôn deploy lại và cập nhật địa chỉ contract.
- Khi test whitelist/NFT, luôn kiểm tra dữ liệu thực tế trên blockchain (không dựa vào backend tạm thời).
- Nếu cần reset toàn bộ dữ liệu, chỉ cần xóa thư mục `ganache-data` và khởi động lại Ganache.

## 11. Một số script hữu ích
- `deploy-new.js`, `deploy-with-owner.js`: Deploy contract mới
- `create-test-data.js`: Tạo dữ liệu mẫu
- `check-setup.js`: Kiểm tra kết nối, trạng thái contract, whitelist
- `start-system.*`, `start-simple.*`: Chạy toàn bộ hệ thống tự động

---
**Nếu gặp lỗi hoặc cần hỗ trợ, hãy kiểm tra lại kết nối Ganache, contract address, và log của backend/frontend.** 