# Hướng dẫn sử dụng tính năng Chọn vai trò

## Tổng quan

Tính năng "Chọn vai trò" cho phép người dùng chọn giữa hai vai trò chính trong hệ thống:
- **Admin/Owner**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Sinh viên**: Đăng ký thi, xác minh danh tính và tham gia thi

## Cách sử dụng

### 1. Kết nối ví MetaMask
- Mở trang chủ của hệ thống
- Click "Kết nối MetaMask"
- Xác nhận kết nối trong MetaMask

### 2. Chọn vai trò
Sau khi kết nối ví, hệ thống sẽ hiển thị trang chọn vai trò với:

#### Admin/Owner
- **Mô tả**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Tính năng chính**:
  - Quản lý whitelist sinh viên
  - Theo dõi đăng ký thi
  - Giám sát kỳ thi
  - Quản lý NFT chứng nhận
  - Xác minh danh tính
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến Admin Dashboard

#### Sinh viên
- **Mô tả**: Đăng ký thi, xác minh danh tính và tham gia thi
- **Tính năng chính**:
  - Đăng ký thi trực tuyến
  - Xác minh danh tính
  - Tham gia thi
  - Nhận NFT chứng nhận
  - Theo dõi tiến trình
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến trang Đăng ký thi

### 3. Thay đổi vai trò
- Click vào avatar/địa chỉ ví trên Navbar
- Chọn "Chọn vai trò khác"
- Chọn vai trò mới từ danh sách

## Giao diện

### Trang chọn vai trò
```
┌─────────────────────────────────────────────────────────────┐
│                    Chọn vai trò của bạn                    │
│                                                             │
│  Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84  │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │    Admin/Owner      │    │     Sinh viên       │        │
│  │                     │    │                     │        │
│  │ • Quản lý whitelist │    │ • Đăng ký thi       │        │
│  │ • Theo dõi đăng ký  │    │ • Xác minh danh tính│        │
│  │ • Giám sát thi      │    │ • Tham gia thi      │        │
│  │ • Quản lý NFT       │    │ • Nhận NFT          │        │
│  │                     │    │                     │        │
│  │ [Chọn vai trò này]  │    │ [Chọn vai trò này]  │        │
│  └─────────────────────┘    └─────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Navbar với vai trò
```
┌─────────────────────────────────────────────────────────────┐
│ Exam Blockchain                    [Admin] 0xb873...bdef84 │
│                                                             │
│ Trang chủ | Đăng ký thi | Xác minh | Thi | NFT Gallery    │
└─────────────────────────────────────────────────────────────┘
```

## Tính năng bảo mật

### Lưu trữ vai trò
- Vai trò được lưu trong localStorage của trình duyệt
- Tự động khôi phục khi refresh trang
- Có thể thay đổi bất cứ lúc nào

### Kiểm tra quyền
- **Admin/Owner**: Kiểm tra xem địa chỉ ví có phải là owner của contract không
- **Sinh viên**: Kiểm tra xem địa chỉ ví có trong whitelist không

## Troubleshooting

### Lỗi "Không thể chọn vai trò"
- **Nguyên nhân**: Chưa kết nối MetaMask
- **Giải pháp**: Kết nối MetaMask trước khi chọn vai trò

### Lỗi "Admin không thể đăng ký thi"
- **Nguyên nhân**: Đang sử dụng vai trò Admin để đăng ký thi
- **Giải pháp**: Chuyển sang vai trò Sinh viên

### Lỗi "Sinh viên không thể truy cập Admin"
- **Nguyên nhân**: Đang sử dụng vai trò Sinh viên để truy cập Admin
- **Giải pháp**: Chuyển sang vai trò Admin/Owner

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: Trình duyệt không hỗ trợ localStorage
- **Giải pháp**: Sử dụng trình duyệt khác hoặc bật JavaScript

## Cấu trúc file

### Components
- `frontend/src/components/RoleSelection.js` - Component chọn vai trò chính
- `frontend/src/components/RoleNotification.js` - Component thông báo vai trò
- `frontend/src/components/UserTypeSelector.js` - Component cũ (đã thay thế)

### Pages
- `frontend/src/pages/Home.js` - Trang chủ với logic chọn vai trò
- `frontend/src/pages/Register.js` - Trang đăng ký với kiểm tra vai trò
- `frontend/src/pages/Admin.js` - Trang admin với kiểm tra quyền

### Context
- `frontend/src/contexts/Web3Context.js` - Quản lý trạng thái vai trò

## API và Functions

### Web3Context Functions
```javascript
// Chọn vai trò thủ công
setUserTypeManually(role) // 'owner' hoặc 'student'

// Kiểm tra vai trò hiện tại
userType // 'owner', 'student', hoặc null

// Kiểm tra quyền owner
isOwner // boolean
```

### Navigation
```javascript
// Chuyển đến Admin Dashboard
navigate('/admin')

// Chuyển đến trang Đăng ký
navigate('/register')

// Về trang chủ để chọn vai trò
navigate('/')
```

## Best Practices

### Cho Admin/Owner
1. **Kiểm tra quyền**: Luôn kiểm tra `isOwner` trước khi thực hiện các thao tác admin
2. **Bảo mật**: Không chia sẻ private key của ví owner
3. **Backup**: Lưu trữ thông tin owner an toàn

### Cho Sinh viên
1. **Whitelist**: Đảm bảo địa chỉ ví đã được thêm vào whitelist
2. **Thông tin**: Nhập chính xác MSSV và thông tin cá nhân
3. **Bảo mật**: Bảo vệ private key của ví

### Cho Developer
1. **Validation**: Luôn kiểm tra vai trò trước khi cho phép truy cập
2. **UX**: Cung cấp thông báo rõ ràng khi người dùng không có quyền
3. **Testing**: Test các trường hợp chuyển đổi vai trò

## Tương lai

### Tính năng có thể thêm
- **Multi-role**: Một ví có thể có nhiều vai trò
- **Role hierarchy**: Hệ thống phân quyền phức tạp hơn
- **Role expiration**: Vai trò có thời hạn
- **Role approval**: Cần phê duyệt để thay đổi vai trò

### Cải tiến UI/UX
- **Role badges**: Hiển thị badge vai trò trên các trang
- **Role switcher**: Component chuyển đổi vai trò nhanh
- **Role history**: Lịch sử thay đổi vai trò
- **Role analytics**: Thống kê sử dụng vai trò 

## Tổng quan

Tính năng "Chọn vai trò" cho phép người dùng chọn giữa hai vai trò chính trong hệ thống:
- **Admin/Owner**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Sinh viên**: Đăng ký thi, xác minh danh tính và tham gia thi

## Cách sử dụng

### 1. Kết nối ví MetaMask
- Mở trang chủ của hệ thống
- Click "Kết nối MetaMask"
- Xác nhận kết nối trong MetaMask

### 2. Chọn vai trò
Sau khi kết nối ví, hệ thống sẽ hiển thị trang chọn vai trò với:

#### Admin/Owner
- **Mô tả**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Tính năng chính**:
  - Quản lý whitelist sinh viên
  - Theo dõi đăng ký thi
  - Giám sát kỳ thi
  - Quản lý NFT chứng nhận
  - Xác minh danh tính
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến Admin Dashboard

#### Sinh viên
- **Mô tả**: Đăng ký thi, xác minh danh tính và tham gia thi
- **Tính năng chính**:
  - Đăng ký thi trực tuyến
  - Xác minh danh tính
  - Tham gia thi
  - Nhận NFT chứng nhận
  - Theo dõi tiến trình
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến trang Đăng ký thi

### 3. Thay đổi vai trò
- Click vào avatar/địa chỉ ví trên Navbar
- Chọn "Chọn vai trò khác"
- Chọn vai trò mới từ danh sách

## Giao diện

### Trang chọn vai trò
```
┌─────────────────────────────────────────────────────────────┐
│                    Chọn vai trò của bạn                    │
│                                                             │
│  Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84  │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │    Admin/Owner      │    │     Sinh viên       │        │
│  │                     │    │                     │        │
│  │ • Quản lý whitelist │    │ • Đăng ký thi       │        │
│  │ • Theo dõi đăng ký  │    │ • Xác minh danh tính│        │
│  │ • Giám sát thi      │    │ • Tham gia thi      │        │
│  │ • Quản lý NFT       │    │ • Nhận NFT          │        │
│  │                     │    │                     │        │
│  │ [Chọn vai trò này]  │    │ [Chọn vai trò này]  │        │
│  └─────────────────────┘    └─────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Navbar với vai trò
```
┌─────────────────────────────────────────────────────────────┐
│ Exam Blockchain                    [Admin] 0xb873...bdef84 │
│                                                             │
│ Trang chủ | Đăng ký thi | Xác minh | Thi | NFT Gallery    │
└─────────────────────────────────────────────────────────────┘
```

## Tính năng bảo mật

### Lưu trữ vai trò
- Vai trò được lưu trong localStorage của trình duyệt
- Tự động khôi phục khi refresh trang
- Có thể thay đổi bất cứ lúc nào

### Kiểm tra quyền
- **Admin/Owner**: Kiểm tra xem địa chỉ ví có phải là owner của contract không
- **Sinh viên**: Kiểm tra xem địa chỉ ví có trong whitelist không

## Troubleshooting

### Lỗi "Không thể chọn vai trò"
- **Nguyên nhân**: Chưa kết nối MetaMask
- **Giải pháp**: Kết nối MetaMask trước khi chọn vai trò

### Lỗi "Admin không thể đăng ký thi"
- **Nguyên nhân**: Đang sử dụng vai trò Admin để đăng ký thi
- **Giải pháp**: Chuyển sang vai trò Sinh viên

### Lỗi "Sinh viên không thể truy cập Admin"
- **Nguyên nhân**: Đang sử dụng vai trò Sinh viên để truy cập Admin
- **Giải pháp**: Chuyển sang vai trò Admin/Owner

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: Trình duyệt không hỗ trợ localStorage
- **Giải pháp**: Sử dụng trình duyệt khác hoặc bật JavaScript

## Cấu trúc file

### Components
- `frontend/src/components/RoleSelection.js` - Component chọn vai trò chính
- `frontend/src/components/RoleNotification.js` - Component thông báo vai trò
- `frontend/src/components/UserTypeSelector.js` - Component cũ (đã thay thế)

### Pages
- `frontend/src/pages/Home.js` - Trang chủ với logic chọn vai trò
- `frontend/src/pages/Register.js` - Trang đăng ký với kiểm tra vai trò
- `frontend/src/pages/Admin.js` - Trang admin với kiểm tra quyền

### Context
- `frontend/src/contexts/Web3Context.js` - Quản lý trạng thái vai trò

## API và Functions

### Web3Context Functions
```javascript
// Chọn vai trò thủ công
setUserTypeManually(role) // 'owner' hoặc 'student'

// Kiểm tra vai trò hiện tại
userType // 'owner', 'student', hoặc null

// Kiểm tra quyền owner
isOwner // boolean
```

### Navigation
```javascript
// Chuyển đến Admin Dashboard
navigate('/admin')

// Chuyển đến trang Đăng ký
navigate('/register')

// Về trang chủ để chọn vai trò
navigate('/')
```

## Best Practices

### Cho Admin/Owner
1. **Kiểm tra quyền**: Luôn kiểm tra `isOwner` trước khi thực hiện các thao tác admin
2. **Bảo mật**: Không chia sẻ private key của ví owner
3. **Backup**: Lưu trữ thông tin owner an toàn

### Cho Sinh viên
1. **Whitelist**: Đảm bảo địa chỉ ví đã được thêm vào whitelist
2. **Thông tin**: Nhập chính xác MSSV và thông tin cá nhân
3. **Bảo mật**: Bảo vệ private key của ví

### Cho Developer
1. **Validation**: Luôn kiểm tra vai trò trước khi cho phép truy cập
2. **UX**: Cung cấp thông báo rõ ràng khi người dùng không có quyền
3. **Testing**: Test các trường hợp chuyển đổi vai trò

## Tương lai

### Tính năng có thể thêm
- **Multi-role**: Một ví có thể có nhiều vai trò
- **Role hierarchy**: Hệ thống phân quyền phức tạp hơn
- **Role expiration**: Vai trò có thời hạn
- **Role approval**: Cần phê duyệt để thay đổi vai trò

### Cải tiến UI/UX
- **Role badges**: Hiển thị badge vai trò trên các trang
- **Role switcher**: Component chuyển đổi vai trò nhanh
- **Role history**: Lịch sử thay đổi vai trò
- **Role analytics**: Thống kê sử dụng vai trò 

## Tổng quan

Tính năng "Chọn vai trò" cho phép người dùng chọn giữa hai vai trò chính trong hệ thống:
- **Admin/Owner**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Sinh viên**: Đăng ký thi, xác minh danh tính và tham gia thi

## Cách sử dụng

### 1. Kết nối ví MetaMask
- Mở trang chủ của hệ thống
- Click "Kết nối MetaMask"
- Xác nhận kết nối trong MetaMask

### 2. Chọn vai trò
Sau khi kết nối ví, hệ thống sẽ hiển thị trang chọn vai trò với:

#### Admin/Owner
- **Mô tả**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Tính năng chính**:
  - Quản lý whitelist sinh viên
  - Theo dõi đăng ký thi
  - Giám sát kỳ thi
  - Quản lý NFT chứng nhận
  - Xác minh danh tính
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến Admin Dashboard

#### Sinh viên
- **Mô tả**: Đăng ký thi, xác minh danh tính và tham gia thi
- **Tính năng chính**:
  - Đăng ký thi trực tuyến
  - Xác minh danh tính
  - Tham gia thi
  - Nhận NFT chứng nhận
  - Theo dõi tiến trình
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến trang Đăng ký thi

### 3. Thay đổi vai trò
- Click vào avatar/địa chỉ ví trên Navbar
- Chọn "Chọn vai trò khác"
- Chọn vai trò mới từ danh sách

## Giao diện

### Trang chọn vai trò
```
┌─────────────────────────────────────────────────────────────┐
│                    Chọn vai trò của bạn                    │
│                                                             │
│  Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84  │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │    Admin/Owner      │    │     Sinh viên       │        │
│  │                     │    │                     │        │
│  │ • Quản lý whitelist │    │ • Đăng ký thi       │        │
│  │ • Theo dõi đăng ký  │    │ • Xác minh danh tính│        │
│  │ • Giám sát thi      │    │ • Tham gia thi      │        │
│  │ • Quản lý NFT       │    │ • Nhận NFT          │        │
│  │                     │    │                     │        │
│  │ [Chọn vai trò này]  │    │ [Chọn vai trò này]  │        │
│  └─────────────────────┘    └─────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Navbar với vai trò
```
┌─────────────────────────────────────────────────────────────┐
│ Exam Blockchain                    [Admin] 0xb873...bdef84 │
│                                                             │
│ Trang chủ | Đăng ký thi | Xác minh | Thi | NFT Gallery    │
└─────────────────────────────────────────────────────────────┘
```

## Tính năng bảo mật

### Lưu trữ vai trò
- Vai trò được lưu trong localStorage của trình duyệt
- Tự động khôi phục khi refresh trang
- Có thể thay đổi bất cứ lúc nào

### Kiểm tra quyền
- **Admin/Owner**: Kiểm tra xem địa chỉ ví có phải là owner của contract không
- **Sinh viên**: Kiểm tra xem địa chỉ ví có trong whitelist không

## Troubleshooting

### Lỗi "Không thể chọn vai trò"
- **Nguyên nhân**: Chưa kết nối MetaMask
- **Giải pháp**: Kết nối MetaMask trước khi chọn vai trò

### Lỗi "Admin không thể đăng ký thi"
- **Nguyên nhân**: Đang sử dụng vai trò Admin để đăng ký thi
- **Giải pháp**: Chuyển sang vai trò Sinh viên

### Lỗi "Sinh viên không thể truy cập Admin"
- **Nguyên nhân**: Đang sử dụng vai trò Sinh viên để truy cập Admin
- **Giải pháp**: Chuyển sang vai trò Admin/Owner

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: Trình duyệt không hỗ trợ localStorage
- **Giải pháp**: Sử dụng trình duyệt khác hoặc bật JavaScript

## Cấu trúc file

### Components
- `frontend/src/components/RoleSelection.js` - Component chọn vai trò chính
- `frontend/src/components/RoleNotification.js` - Component thông báo vai trò
- `frontend/src/components/UserTypeSelector.js` - Component cũ (đã thay thế)

### Pages
- `frontend/src/pages/Home.js` - Trang chủ với logic chọn vai trò
- `frontend/src/pages/Register.js` - Trang đăng ký với kiểm tra vai trò
- `frontend/src/pages/Admin.js` - Trang admin với kiểm tra quyền

### Context
- `frontend/src/contexts/Web3Context.js` - Quản lý trạng thái vai trò

## API và Functions

### Web3Context Functions
```javascript
// Chọn vai trò thủ công
setUserTypeManually(role) // 'owner' hoặc 'student'

// Kiểm tra vai trò hiện tại
userType // 'owner', 'student', hoặc null

// Kiểm tra quyền owner
isOwner // boolean
```

### Navigation
```javascript
// Chuyển đến Admin Dashboard
navigate('/admin')

// Chuyển đến trang Đăng ký
navigate('/register')

// Về trang chủ để chọn vai trò
navigate('/')
```

## Best Practices

### Cho Admin/Owner
1. **Kiểm tra quyền**: Luôn kiểm tra `isOwner` trước khi thực hiện các thao tác admin
2. **Bảo mật**: Không chia sẻ private key của ví owner
3. **Backup**: Lưu trữ thông tin owner an toàn

### Cho Sinh viên
1. **Whitelist**: Đảm bảo địa chỉ ví đã được thêm vào whitelist
2. **Thông tin**: Nhập chính xác MSSV và thông tin cá nhân
3. **Bảo mật**: Bảo vệ private key của ví

### Cho Developer
1. **Validation**: Luôn kiểm tra vai trò trước khi cho phép truy cập
2. **UX**: Cung cấp thông báo rõ ràng khi người dùng không có quyền
3. **Testing**: Test các trường hợp chuyển đổi vai trò

## Tương lai

### Tính năng có thể thêm
- **Multi-role**: Một ví có thể có nhiều vai trò
- **Role hierarchy**: Hệ thống phân quyền phức tạp hơn
- **Role expiration**: Vai trò có thời hạn
- **Role approval**: Cần phê duyệt để thay đổi vai trò

### Cải tiến UI/UX
- **Role badges**: Hiển thị badge vai trò trên các trang
- **Role switcher**: Component chuyển đổi vai trò nhanh
- **Role history**: Lịch sử thay đổi vai trò
- **Role analytics**: Thống kê sử dụng vai trò 

## Tổng quan

Tính năng "Chọn vai trò" cho phép người dùng chọn giữa hai vai trò chính trong hệ thống:
- **Admin/Owner**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Sinh viên**: Đăng ký thi, xác minh danh tính và tham gia thi

## Cách sử dụng

### 1. Kết nối ví MetaMask
- Mở trang chủ của hệ thống
- Click "Kết nối MetaMask"
- Xác nhận kết nối trong MetaMask

### 2. Chọn vai trò
Sau khi kết nối ví, hệ thống sẽ hiển thị trang chọn vai trò với:

#### Admin/Owner
- **Mô tả**: Quản lý hệ thống, thêm sinh viên vào whitelist
- **Tính năng chính**:
  - Quản lý whitelist sinh viên
  - Theo dõi đăng ký thi
  - Giám sát kỳ thi
  - Quản lý NFT chứng nhận
  - Xác minh danh tính
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến Admin Dashboard

#### Sinh viên
- **Mô tả**: Đăng ký thi, xác minh danh tính và tham gia thi
- **Tính năng chính**:
  - Đăng ký thi trực tuyến
  - Xác minh danh tính
  - Tham gia thi
  - Nhận NFT chứng nhận
  - Theo dõi tiến trình
- **Cách chọn**: Click "Chọn vai trò này" → Chuyển đến trang Đăng ký thi

### 3. Thay đổi vai trò
- Click vào avatar/địa chỉ ví trên Navbar
- Chọn "Chọn vai trò khác"
- Chọn vai trò mới từ danh sách

## Giao diện

### Trang chọn vai trò
```
┌─────────────────────────────────────────────────────────────┐
│                    Chọn vai trò của bạn                    │
│                                                             │
│  Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84  │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │    Admin/Owner      │    │     Sinh viên       │        │
│  │                     │    │                     │        │
│  │ • Quản lý whitelist │    │ • Đăng ký thi       │        │
│  │ • Theo dõi đăng ký  │    │ • Xác minh danh tính│        │
│  │ • Giám sát thi      │    │ • Tham gia thi      │        │
│  │ • Quản lý NFT       │    │ • Nhận NFT          │        │
│  │                     │    │                     │        │
│  │ [Chọn vai trò này]  │    │ [Chọn vai trò này]  │        │
│  └─────────────────────┘    └─────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Navbar với vai trò
```
┌─────────────────────────────────────────────────────────────┐
│ Exam Blockchain                    [Admin] 0xb873...bdef84 │
│                                                             │
│ Trang chủ | Đăng ký thi | Xác minh | Thi | NFT Gallery    │
└─────────────────────────────────────────────────────────────┘
```

## Tính năng bảo mật

### Lưu trữ vai trò
- Vai trò được lưu trong localStorage của trình duyệt
- Tự động khôi phục khi refresh trang
- Có thể thay đổi bất cứ lúc nào

### Kiểm tra quyền
- **Admin/Owner**: Kiểm tra xem địa chỉ ví có phải là owner của contract không
- **Sinh viên**: Kiểm tra xem địa chỉ ví có trong whitelist không

## Troubleshooting

### Lỗi "Không thể chọn vai trò"
- **Nguyên nhân**: Chưa kết nối MetaMask
- **Giải pháp**: Kết nối MetaMask trước khi chọn vai trò

### Lỗi "Admin không thể đăng ký thi"
- **Nguyên nhân**: Đang sử dụng vai trò Admin để đăng ký thi
- **Giải pháp**: Chuyển sang vai trò Sinh viên

### Lỗi "Sinh viên không thể truy cập Admin"
- **Nguyên nhân**: Đang sử dụng vai trò Sinh viên để truy cập Admin
- **Giải pháp**: Chuyển sang vai trò Admin/Owner

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: Trình duyệt không hỗ trợ localStorage
- **Giải pháp**: Sử dụng trình duyệt khác hoặc bật JavaScript

## Cấu trúc file

### Components
- `frontend/src/components/RoleSelection.js` - Component chọn vai trò chính
- `frontend/src/components/RoleNotification.js` - Component thông báo vai trò
- `frontend/src/components/UserTypeSelector.js` - Component cũ (đã thay thế)

### Pages
- `frontend/src/pages/Home.js` - Trang chủ với logic chọn vai trò
- `frontend/src/pages/Register.js` - Trang đăng ký với kiểm tra vai trò
- `frontend/src/pages/Admin.js` - Trang admin với kiểm tra quyền

### Context
- `frontend/src/contexts/Web3Context.js` - Quản lý trạng thái vai trò

## API và Functions

### Web3Context Functions
```javascript
// Chọn vai trò thủ công
setUserTypeManually(role) // 'owner' hoặc 'student'

// Kiểm tra vai trò hiện tại
userType // 'owner', 'student', hoặc null

// Kiểm tra quyền owner
isOwner // boolean
```

### Navigation
```javascript
// Chuyển đến Admin Dashboard
navigate('/admin')

// Chuyển đến trang Đăng ký
navigate('/register')

// Về trang chủ để chọn vai trò
navigate('/')
```

## Best Practices

### Cho Admin/Owner
1. **Kiểm tra quyền**: Luôn kiểm tra `isOwner` trước khi thực hiện các thao tác admin
2. **Bảo mật**: Không chia sẻ private key của ví owner
3. **Backup**: Lưu trữ thông tin owner an toàn

### Cho Sinh viên
1. **Whitelist**: Đảm bảo địa chỉ ví đã được thêm vào whitelist
2. **Thông tin**: Nhập chính xác MSSV và thông tin cá nhân
3. **Bảo mật**: Bảo vệ private key của ví

### Cho Developer
1. **Validation**: Luôn kiểm tra vai trò trước khi cho phép truy cập
2. **UX**: Cung cấp thông báo rõ ràng khi người dùng không có quyền
3. **Testing**: Test các trường hợp chuyển đổi vai trò

## Tương lai

### Tính năng có thể thêm
- **Multi-role**: Một ví có thể có nhiều vai trò
- **Role hierarchy**: Hệ thống phân quyền phức tạp hơn
- **Role expiration**: Vai trò có thời hạn
- **Role approval**: Cần phê duyệt để thay đổi vai trò

### Cải tiến UI/UX
- **Role badges**: Hiển thị badge vai trò trên các trang
- **Role switcher**: Component chuyển đổi vai trò nhanh
- **Role history**: Lịch sử thay đổi vai trò
- **Role analytics**: Thống kê sử dụng vai trò 