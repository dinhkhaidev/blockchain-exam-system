# Hướng dẫn Flow Hệ thống Xác thực Thi cử Blockchain

## Tổng quan Flow

Hệ thống được thiết kế theo flow best practice với phân quyền rõ ràng giữa **Owner/Admin** và **Student**.

## 1. Flow dành cho Owner/Admin

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản Owner
- Hệ thống tự động nhận diện vai trò Owner

### Bước 2: Quản lý Whitelist
- Thêm địa chỉ ví của sinh viên vào whitelist
- Xóa địa chỉ ví khỏi whitelist nếu cần
- Thêm nhiều địa chỉ cùng lúc

### Bước 3: Theo dõi đăng ký
- Xem danh sách sinh viên đã đăng ký thi
- Kiểm tra trạng thái xác minh của từng sinh viên

### Bước 4: Giám sát thi
- Theo dõi kỳ thi đang diễn ra
- Xem log xác minh danh tính

### Bước 5: Quản lý NFT
- Xem danh sách NFT chứng nhận đã mint
- Quản lý trạng thái NFT

## 2. Flow dành cho Student

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản sinh viên
- Hệ thống kiểm tra whitelist status

### Bước 2: Đăng ký thi
- Chỉ sinh viên trong whitelist mới có thể đăng ký
- Nhập MSSV, chọn môn học và ca thi
- Thông tin được lưu trên blockchain

### Bước 3: Xác minh danh tính
- Chụp ảnh xác minh qua camera
- Hệ thống lưu IP address và hash ảnh
- Chỉ có thể thi sau khi xác minh thành công

### Bước 4: Tham gia thi
- Vào thi sau khi xác minh thành công
- Hệ thống theo dõi thời gian thi
- Tự động kết thúc khi hết thời gian

### Bước 5: Nhận NFT
- Tự động mint NFT chứng nhận sau khi hoàn thành thi
- NFT chứa metadata: MSSV, môn học, thời gian thi, IP address

## 3. Các Component Chính

### ProgressIndicator
- Hiển thị tiến trình của user trong flow
- Khác nhau cho Owner và Student
- Visual feedback cho từng bước

### UserTypeSelector
- Cho phép user chọn vai trò khi kết nối ví
- Hiển thị tính năng của từng vai trò
- Chỉ hiển thị khi chưa xác định user type

### Web3Context
- Quản lý kết nối blockchain
- Kiểm tra owner status
- Quản lý whitelist functions
- Theo dõi user type

## 4. Bảo mật và Kiểm soát

### Owner Controls
- Chỉ Owner mới có thể thêm/xóa whitelist
- Chỉ Owner mới có thể truy cập Admin Dashboard
- Kiểm tra owner status qua smart contract

### Student Restrictions
- Chỉ sinh viên trong whitelist mới đăng ký được
- Chỉ sinh viên đã xác minh mới thi được
- Mỗi MSSV chỉ đăng ký được một lần

### Smart Contract Security
- Modifier kiểm tra owner
- Modifier kiểm tra whitelist
- Events để track changes
- Immutable data sau khi đăng ký

## 5. Giao diện UX/UI

### Responsive Design
- Tối ưu cho mobile và desktop
- Progress indicator trực quan
- Status badges rõ ràng

### Error Handling
- Thông báo lỗi chi tiết
- Recovery suggestions
- Loading states

### Navigation
- Navbar hiển thị user type
- Breadcrumb navigation
- Quick actions

## 6. Deployment và Testing

### Smart Contracts
```bash
# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Update addresses in frontend
# Update ABI files
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Backend
```bash
# Install dependencies
npm install

# Start server
npm start
```

## 7. Testing Flow

### Test Owner Flow
1. Deploy contracts với owner account
2. Kết nối ví owner
3. Thêm test addresses vào whitelist
4. Kiểm tra Admin Dashboard

### Test Student Flow
1. Kết nối ví student (không phải owner)
2. Kiểm tra whitelist status
3. Đăng ký thi (nếu trong whitelist)
4. Xác minh danh tính
5. Tham gia thi
6. Kiểm tra NFT mint

## 8. Troubleshooting

### Common Issues
- **Contract not found**: Kiểm tra contract addresses
- **Whitelist error**: Đảm bảo address được thêm vào whitelist
- **Verification failed**: Kiểm tra camera permissions
- **NFT not minted**: Kiểm tra backend API

### Debug Steps
1. Kiểm tra console logs
2. Verify contract deployment
3. Check network connection
4. Validate wallet connection
5. Test smart contract functions

## 9. Best Practices

### Security
- Validate input data
- Check permissions before actions
- Use events for tracking
- Implement proper error handling

### UX
- Clear progress indicators
- Helpful error messages
- Responsive design
- Loading states

### Code Quality
- Modular components
- Reusable functions
- Proper state management
- Clean code structure

## 10. Future Enhancements

### Planned Features
- Multi-language support
- Advanced analytics
- Batch operations
- Mobile app
- Integration with other blockchains

### Scalability
- Database indexing
- Caching strategies
- Load balancing
- Microservices architecture 

## Tổng quan Flow

Hệ thống được thiết kế theo flow best practice với phân quyền rõ ràng giữa **Owner/Admin** và **Student**.

## 1. Flow dành cho Owner/Admin

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản Owner
- Hệ thống tự động nhận diện vai trò Owner

### Bước 2: Quản lý Whitelist
- Thêm địa chỉ ví của sinh viên vào whitelist
- Xóa địa chỉ ví khỏi whitelist nếu cần
- Thêm nhiều địa chỉ cùng lúc

### Bước 3: Theo dõi đăng ký
- Xem danh sách sinh viên đã đăng ký thi
- Kiểm tra trạng thái xác minh của từng sinh viên

### Bước 4: Giám sát thi
- Theo dõi kỳ thi đang diễn ra
- Xem log xác minh danh tính

### Bước 5: Quản lý NFT
- Xem danh sách NFT chứng nhận đã mint
- Quản lý trạng thái NFT

## 2. Flow dành cho Student

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản sinh viên
- Hệ thống kiểm tra whitelist status

### Bước 2: Đăng ký thi
- Chỉ sinh viên trong whitelist mới có thể đăng ký
- Nhập MSSV, chọn môn học và ca thi
- Thông tin được lưu trên blockchain

### Bước 3: Xác minh danh tính
- Chụp ảnh xác minh qua camera
- Hệ thống lưu IP address và hash ảnh
- Chỉ có thể thi sau khi xác minh thành công

### Bước 4: Tham gia thi
- Vào thi sau khi xác minh thành công
- Hệ thống theo dõi thời gian thi
- Tự động kết thúc khi hết thời gian

### Bước 5: Nhận NFT
- Tự động mint NFT chứng nhận sau khi hoàn thành thi
- NFT chứa metadata: MSSV, môn học, thời gian thi, IP address

## 3. Các Component Chính

### ProgressIndicator
- Hiển thị tiến trình của user trong flow
- Khác nhau cho Owner và Student
- Visual feedback cho từng bước

### UserTypeSelector
- Cho phép user chọn vai trò khi kết nối ví
- Hiển thị tính năng của từng vai trò
- Chỉ hiển thị khi chưa xác định user type

### Web3Context
- Quản lý kết nối blockchain
- Kiểm tra owner status
- Quản lý whitelist functions
- Theo dõi user type

## 4. Bảo mật và Kiểm soát

### Owner Controls
- Chỉ Owner mới có thể thêm/xóa whitelist
- Chỉ Owner mới có thể truy cập Admin Dashboard
- Kiểm tra owner status qua smart contract

### Student Restrictions
- Chỉ sinh viên trong whitelist mới đăng ký được
- Chỉ sinh viên đã xác minh mới thi được
- Mỗi MSSV chỉ đăng ký được một lần

### Smart Contract Security
- Modifier kiểm tra owner
- Modifier kiểm tra whitelist
- Events để track changes
- Immutable data sau khi đăng ký

## 5. Giao diện UX/UI

### Responsive Design
- Tối ưu cho mobile và desktop
- Progress indicator trực quan
- Status badges rõ ràng

### Error Handling
- Thông báo lỗi chi tiết
- Recovery suggestions
- Loading states

### Navigation
- Navbar hiển thị user type
- Breadcrumb navigation
- Quick actions

## 6. Deployment và Testing

### Smart Contracts
```bash
# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Update addresses in frontend
# Update ABI files
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Backend
```bash
# Install dependencies
npm install

# Start server
npm start
```

## 7. Testing Flow

### Test Owner Flow
1. Deploy contracts với owner account
2. Kết nối ví owner
3. Thêm test addresses vào whitelist
4. Kiểm tra Admin Dashboard

### Test Student Flow
1. Kết nối ví student (không phải owner)
2. Kiểm tra whitelist status
3. Đăng ký thi (nếu trong whitelist)
4. Xác minh danh tính
5. Tham gia thi
6. Kiểm tra NFT mint

## 8. Troubleshooting

### Common Issues
- **Contract not found**: Kiểm tra contract addresses
- **Whitelist error**: Đảm bảo address được thêm vào whitelist
- **Verification failed**: Kiểm tra camera permissions
- **NFT not minted**: Kiểm tra backend API

### Debug Steps
1. Kiểm tra console logs
2. Verify contract deployment
3. Check network connection
4. Validate wallet connection
5. Test smart contract functions

## 9. Best Practices

### Security
- Validate input data
- Check permissions before actions
- Use events for tracking
- Implement proper error handling

### UX
- Clear progress indicators
- Helpful error messages
- Responsive design
- Loading states

### Code Quality
- Modular components
- Reusable functions
- Proper state management
- Clean code structure

## 10. Future Enhancements

### Planned Features
- Multi-language support
- Advanced analytics
- Batch operations
- Mobile app
- Integration with other blockchains

### Scalability
- Database indexing
- Caching strategies
- Load balancing
- Microservices architecture 

## Tổng quan Flow

Hệ thống được thiết kế theo flow best practice với phân quyền rõ ràng giữa **Owner/Admin** và **Student**.

## 1. Flow dành cho Owner/Admin

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản Owner
- Hệ thống tự động nhận diện vai trò Owner

### Bước 2: Quản lý Whitelist
- Thêm địa chỉ ví của sinh viên vào whitelist
- Xóa địa chỉ ví khỏi whitelist nếu cần
- Thêm nhiều địa chỉ cùng lúc

### Bước 3: Theo dõi đăng ký
- Xem danh sách sinh viên đã đăng ký thi
- Kiểm tra trạng thái xác minh của từng sinh viên

### Bước 4: Giám sát thi
- Theo dõi kỳ thi đang diễn ra
- Xem log xác minh danh tính

### Bước 5: Quản lý NFT
- Xem danh sách NFT chứng nhận đã mint
- Quản lý trạng thái NFT

## 2. Flow dành cho Student

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản sinh viên
- Hệ thống kiểm tra whitelist status

### Bước 2: Đăng ký thi
- Chỉ sinh viên trong whitelist mới có thể đăng ký
- Nhập MSSV, chọn môn học và ca thi
- Thông tin được lưu trên blockchain

### Bước 3: Xác minh danh tính
- Chụp ảnh xác minh qua camera
- Hệ thống lưu IP address và hash ảnh
- Chỉ có thể thi sau khi xác minh thành công

### Bước 4: Tham gia thi
- Vào thi sau khi xác minh thành công
- Hệ thống theo dõi thời gian thi
- Tự động kết thúc khi hết thời gian

### Bước 5: Nhận NFT
- Tự động mint NFT chứng nhận sau khi hoàn thành thi
- NFT chứa metadata: MSSV, môn học, thời gian thi, IP address

## 3. Các Component Chính

### ProgressIndicator
- Hiển thị tiến trình của user trong flow
- Khác nhau cho Owner và Student
- Visual feedback cho từng bước

### UserTypeSelector
- Cho phép user chọn vai trò khi kết nối ví
- Hiển thị tính năng của từng vai trò
- Chỉ hiển thị khi chưa xác định user type

### Web3Context
- Quản lý kết nối blockchain
- Kiểm tra owner status
- Quản lý whitelist functions
- Theo dõi user type

## 4. Bảo mật và Kiểm soát

### Owner Controls
- Chỉ Owner mới có thể thêm/xóa whitelist
- Chỉ Owner mới có thể truy cập Admin Dashboard
- Kiểm tra owner status qua smart contract

### Student Restrictions
- Chỉ sinh viên trong whitelist mới đăng ký được
- Chỉ sinh viên đã xác minh mới thi được
- Mỗi MSSV chỉ đăng ký được một lần

### Smart Contract Security
- Modifier kiểm tra owner
- Modifier kiểm tra whitelist
- Events để track changes
- Immutable data sau khi đăng ký

## 5. Giao diện UX/UI

### Responsive Design
- Tối ưu cho mobile và desktop
- Progress indicator trực quan
- Status badges rõ ràng

### Error Handling
- Thông báo lỗi chi tiết
- Recovery suggestions
- Loading states

### Navigation
- Navbar hiển thị user type
- Breadcrumb navigation
- Quick actions

## 6. Deployment và Testing

### Smart Contracts
```bash
# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Update addresses in frontend
# Update ABI files
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Backend
```bash
# Install dependencies
npm install

# Start server
npm start
```

## 7. Testing Flow

### Test Owner Flow
1. Deploy contracts với owner account
2. Kết nối ví owner
3. Thêm test addresses vào whitelist
4. Kiểm tra Admin Dashboard

### Test Student Flow
1. Kết nối ví student (không phải owner)
2. Kiểm tra whitelist status
3. Đăng ký thi (nếu trong whitelist)
4. Xác minh danh tính
5. Tham gia thi
6. Kiểm tra NFT mint

## 8. Troubleshooting

### Common Issues
- **Contract not found**: Kiểm tra contract addresses
- **Whitelist error**: Đảm bảo address được thêm vào whitelist
- **Verification failed**: Kiểm tra camera permissions
- **NFT not minted**: Kiểm tra backend API

### Debug Steps
1. Kiểm tra console logs
2. Verify contract deployment
3. Check network connection
4. Validate wallet connection
5. Test smart contract functions

## 9. Best Practices

### Security
- Validate input data
- Check permissions before actions
- Use events for tracking
- Implement proper error handling

### UX
- Clear progress indicators
- Helpful error messages
- Responsive design
- Loading states

### Code Quality
- Modular components
- Reusable functions
- Proper state management
- Clean code structure

## 10. Future Enhancements

### Planned Features
- Multi-language support
- Advanced analytics
- Batch operations
- Mobile app
- Integration with other blockchains

### Scalability
- Database indexing
- Caching strategies
- Load balancing
- Microservices architecture 

## Tổng quan Flow

Hệ thống được thiết kế theo flow best practice với phân quyền rõ ràng giữa **Owner/Admin** và **Student**.

## 1. Flow dành cho Owner/Admin

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản Owner
- Hệ thống tự động nhận diện vai trò Owner

### Bước 2: Quản lý Whitelist
- Thêm địa chỉ ví của sinh viên vào whitelist
- Xóa địa chỉ ví khỏi whitelist nếu cần
- Thêm nhiều địa chỉ cùng lúc

### Bước 3: Theo dõi đăng ký
- Xem danh sách sinh viên đã đăng ký thi
- Kiểm tra trạng thái xác minh của từng sinh viên

### Bước 4: Giám sát thi
- Theo dõi kỳ thi đang diễn ra
- Xem log xác minh danh tính

### Bước 5: Quản lý NFT
- Xem danh sách NFT chứng nhận đã mint
- Quản lý trạng thái NFT

## 2. Flow dành cho Student

### Bước 1: Kết nối ví
- Kết nối MetaMask với tài khoản sinh viên
- Hệ thống kiểm tra whitelist status

### Bước 2: Đăng ký thi
- Chỉ sinh viên trong whitelist mới có thể đăng ký
- Nhập MSSV, chọn môn học và ca thi
- Thông tin được lưu trên blockchain

### Bước 3: Xác minh danh tính
- Chụp ảnh xác minh qua camera
- Hệ thống lưu IP address và hash ảnh
- Chỉ có thể thi sau khi xác minh thành công

### Bước 4: Tham gia thi
- Vào thi sau khi xác minh thành công
- Hệ thống theo dõi thời gian thi
- Tự động kết thúc khi hết thời gian

### Bước 5: Nhận NFT
- Tự động mint NFT chứng nhận sau khi hoàn thành thi
- NFT chứa metadata: MSSV, môn học, thời gian thi, IP address

## 3. Các Component Chính

### ProgressIndicator
- Hiển thị tiến trình của user trong flow
- Khác nhau cho Owner và Student
- Visual feedback cho từng bước

### UserTypeSelector
- Cho phép user chọn vai trò khi kết nối ví
- Hiển thị tính năng của từng vai trò
- Chỉ hiển thị khi chưa xác định user type

### Web3Context
- Quản lý kết nối blockchain
- Kiểm tra owner status
- Quản lý whitelist functions
- Theo dõi user type

## 4. Bảo mật và Kiểm soát

### Owner Controls
- Chỉ Owner mới có thể thêm/xóa whitelist
- Chỉ Owner mới có thể truy cập Admin Dashboard
- Kiểm tra owner status qua smart contract

### Student Restrictions
- Chỉ sinh viên trong whitelist mới đăng ký được
- Chỉ sinh viên đã xác minh mới thi được
- Mỗi MSSV chỉ đăng ký được một lần

### Smart Contract Security
- Modifier kiểm tra owner
- Modifier kiểm tra whitelist
- Events để track changes
- Immutable data sau khi đăng ký

## 5. Giao diện UX/UI

### Responsive Design
- Tối ưu cho mobile và desktop
- Progress indicator trực quan
- Status badges rõ ràng

### Error Handling
- Thông báo lỗi chi tiết
- Recovery suggestions
- Loading states

### Navigation
- Navbar hiển thị user type
- Breadcrumb navigation
- Quick actions

## 6. Deployment và Testing

### Smart Contracts
```bash
# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Update addresses in frontend
# Update ABI files
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Backend
```bash
# Install dependencies
npm install

# Start server
npm start
```

## 7. Testing Flow

### Test Owner Flow
1. Deploy contracts với owner account
2. Kết nối ví owner
3. Thêm test addresses vào whitelist
4. Kiểm tra Admin Dashboard

### Test Student Flow
1. Kết nối ví student (không phải owner)
2. Kiểm tra whitelist status
3. Đăng ký thi (nếu trong whitelist)
4. Xác minh danh tính
5. Tham gia thi
6. Kiểm tra NFT mint

## 8. Troubleshooting

### Common Issues
- **Contract not found**: Kiểm tra contract addresses
- **Whitelist error**: Đảm bảo address được thêm vào whitelist
- **Verification failed**: Kiểm tra camera permissions
- **NFT not minted**: Kiểm tra backend API

### Debug Steps
1. Kiểm tra console logs
2. Verify contract deployment
3. Check network connection
4. Validate wallet connection
5. Test smart contract functions

## 9. Best Practices

### Security
- Validate input data
- Check permissions before actions
- Use events for tracking
- Implement proper error handling

### UX
- Clear progress indicators
- Helpful error messages
- Responsive design
- Loading states

### Code Quality
- Modular components
- Reusable functions
- Proper state management
- Clean code structure

## 10. Future Enhancements

### Planned Features
- Multi-language support
- Advanced analytics
- Batch operations
- Mobile app
- Integration with other blockchains

### Scalability
- Database indexing
- Caching strategies
- Load balancing
- Microservices architecture 