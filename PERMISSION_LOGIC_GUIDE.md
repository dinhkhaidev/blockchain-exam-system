# Hướng dẫn Logic Phân quyền

## Tổng quan

Hệ thống hiện tại có logic phân quyền rõ ràng và nhất quán:

### 🔐 **Hai lớp kiểm tra quyền:**

1. **Quyền Owner (Smart Contract Level)**
   - Kiểm tra xem địa chỉ ví có phải là owner của smart contract không
   - Được xác định bởi `isOwner` trong Web3Context
   - Chỉ owner thực sự mới có thể thực hiện các giao dịch admin

2. **Vai trò Owner (Application Level)**
   - Kiểm tra xem người dùng đã chọn vai trò Owner chưa
   - Được xác định bởi `userType === 'owner'`
   - Chỉ người dùng có vai trò Owner mới có thể truy cập Admin Dashboard

## Logic Phân quyền

### ✅ **Có thể truy cập Admin Dashboard:**
```
isOwner = true AND userType = 'owner'
```

### ❌ **Không thể truy cập Admin Dashboard:**

#### Trường hợp 1: Không phải Owner
```
isOwner = false
```
- **Hiển thị**: AccessDenied component
- **Thông báo**: "Bạn không phải Owner!"
- **Hướng dẫn**: Deploy lại contract với địa chỉ ví của bạn

#### Trường hợp 2: Là Owner nhưng chưa chọn vai trò
```
isOwner = true AND userType !== 'owner'
```
- **Hiển thị**: OwnerSetup component
- **Thông báo**: "Bạn có quyền Owner!"
- **Hướng dẫn**: Click "Chọn vai trò Owner"

#### Trường hợp 3: Chưa kết nối ví
```
isConnected = false
```
- **Hiển thị**: OwnerLogin component
- **Thông báo**: "Kết nối ví để truy cập Admin"
- **Hướng dẫn**: Kết nối MetaMask

## Luồng xử lý

### 1. Kết nối ví
```
User connects MetaMask
↓
checkOwnerStatus() - Kiểm tra quyền owner trong contract
↓
setIsOwner(true/false) - Lưu trạng thái quyền
```

### 2. Chọn vai trò
```
User selects role (Owner/Student)
↓
setUserTypeManually('owner'/'student') - Lưu vai trò
↓
localStorage.setItem('userType', role) - Lưu vào localStorage
```

### 3. Truy cập Admin Dashboard
```
User visits /admin
↓
Check isConnected
↓
Check isOwner
↓
Check userType === 'owner'
↓
Allow access to Admin Dashboard
```

## Các Component

### 1. OwnerLogin
- **Mục đích**: Kết nối ví MetaMask
- **Hiển thị khi**: `!isConnected`
- **Chức năng**: Kết nối ví, kiểm tra owner status

### 2. AccessDenied
- **Mục đích**: Thông báo từ chối truy cập
- **Hiển thị khi**: `!isOwner`
- **Chức năng**: Hiển thị lý do, hướng dẫn khắc phục

### 3. OwnerSetup
- **Mục đích**: Thiết lập vai trò Owner
- **Hiển thị khi**: `isOwner && userType !== 'owner'`
- **Chức năng**: Chọn vai trò Owner, thiết lập quyền

### 4. Admin Dashboard
- **Mục đích**: Giao diện quản lý admin
- **Hiển thị khi**: `isOwner && userType === 'owner'`
- **Chức năng**: Quản lý whitelist, theo dõi thi, quản lý NFT

## Best Practices

### 1. **Tách biệt quyền và vai trò**
- **Quyền Owner**: Được xác định bởi smart contract
- **Vai trò Owner**: Được chọn bởi người dùng

### 2. **Kiểm tra hai lớp**
- Luôn kiểm tra cả `isOwner` và `userType`
- Không cho phép truy cập nếu thiếu một trong hai

### 3. **Thông báo rõ ràng**
- Mỗi trường hợp có thông báo và hướng dẫn cụ thể
- Giúp người dùng hiểu và khắc phục vấn đề

### 4. **Lưu trữ nhất quán**
- Sử dụng localStorage để lưu vai trò
- Tự động khôi phục khi refresh trang

## Ví dụ thực tế

### Trường hợp 1: Owner thực sự
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'owner'
→ Có thể truy cập Admin Dashboard
```

### Trường hợp 2: Owner nhưng chưa chọn vai trò
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'student'
→ Hiển thị OwnerSetup, hướng dẫn chọn vai trò
```

### Trường hợp 3: Không phải Owner
```
Địa chỉ ví: 0x1234567890abcdef...
isOwner: false
userType: 'student'
→ Hiển thị AccessDenied, hướng dẫn deploy contract
```

## Cải tiến tương lai

### 1. **Multi-role support**
- Một ví có thể có nhiều vai trò
- Chuyển đổi vai trò dễ dàng

### 2. **Role hierarchy**
- Hệ thống phân quyền phức tạp hơn
- Admin, Moderator, Student roles

### 3. **Role expiration**
- Vai trò có thời hạn
- Tự động hết hạn quyền

### 4. **Role approval**
- Cần phê duyệt để thay đổi vai trò
- Audit trail cho thay đổi quyền

## Troubleshooting

### Lỗi "Không có quyền truy cập"
1. **Kiểm tra isOwner**: Xem có phải owner của contract không
2. **Kiểm tra userType**: Xem đã chọn vai trò Owner chưa
3. **Kiểm tra kết nối**: Xem MetaMask đã kết nối chưa

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: localStorage không hoạt động
- **Giải pháp**: Kiểm tra browser settings, thử browser khác

## Kết luận

Logic phân quyền mới đảm bảo:
- **Bảo mật**: Chỉ owner thực sự mới có quyền admin
- **Rõ ràng**: Thông báo và hướng dẫn cụ thể
- **Nhất quán**: Kiểm tra hai lớp quyền
- **Linh hoạt**: Cho phép chọn vai trò phù hợp 

## Tổng quan

Hệ thống hiện tại có logic phân quyền rõ ràng và nhất quán:

### 🔐 **Hai lớp kiểm tra quyền:**

1. **Quyền Owner (Smart Contract Level)**
   - Kiểm tra xem địa chỉ ví có phải là owner của smart contract không
   - Được xác định bởi `isOwner` trong Web3Context
   - Chỉ owner thực sự mới có thể thực hiện các giao dịch admin

2. **Vai trò Owner (Application Level)**
   - Kiểm tra xem người dùng đã chọn vai trò Owner chưa
   - Được xác định bởi `userType === 'owner'`
   - Chỉ người dùng có vai trò Owner mới có thể truy cập Admin Dashboard

## Logic Phân quyền

### ✅ **Có thể truy cập Admin Dashboard:**
```
isOwner = true AND userType = 'owner'
```

### ❌ **Không thể truy cập Admin Dashboard:**

#### Trường hợp 1: Không phải Owner
```
isOwner = false
```
- **Hiển thị**: AccessDenied component
- **Thông báo**: "Bạn không phải Owner!"
- **Hướng dẫn**: Deploy lại contract với địa chỉ ví của bạn

#### Trường hợp 2: Là Owner nhưng chưa chọn vai trò
```
isOwner = true AND userType !== 'owner'
```
- **Hiển thị**: OwnerSetup component
- **Thông báo**: "Bạn có quyền Owner!"
- **Hướng dẫn**: Click "Chọn vai trò Owner"

#### Trường hợp 3: Chưa kết nối ví
```
isConnected = false
```
- **Hiển thị**: OwnerLogin component
- **Thông báo**: "Kết nối ví để truy cập Admin"
- **Hướng dẫn**: Kết nối MetaMask

## Luồng xử lý

### 1. Kết nối ví
```
User connects MetaMask
↓
checkOwnerStatus() - Kiểm tra quyền owner trong contract
↓
setIsOwner(true/false) - Lưu trạng thái quyền
```

### 2. Chọn vai trò
```
User selects role (Owner/Student)
↓
setUserTypeManually('owner'/'student') - Lưu vai trò
↓
localStorage.setItem('userType', role) - Lưu vào localStorage
```

### 3. Truy cập Admin Dashboard
```
User visits /admin
↓
Check isConnected
↓
Check isOwner
↓
Check userType === 'owner'
↓
Allow access to Admin Dashboard
```

## Các Component

### 1. OwnerLogin
- **Mục đích**: Kết nối ví MetaMask
- **Hiển thị khi**: `!isConnected`
- **Chức năng**: Kết nối ví, kiểm tra owner status

### 2. AccessDenied
- **Mục đích**: Thông báo từ chối truy cập
- **Hiển thị khi**: `!isOwner`
- **Chức năng**: Hiển thị lý do, hướng dẫn khắc phục

### 3. OwnerSetup
- **Mục đích**: Thiết lập vai trò Owner
- **Hiển thị khi**: `isOwner && userType !== 'owner'`
- **Chức năng**: Chọn vai trò Owner, thiết lập quyền

### 4. Admin Dashboard
- **Mục đích**: Giao diện quản lý admin
- **Hiển thị khi**: `isOwner && userType === 'owner'`
- **Chức năng**: Quản lý whitelist, theo dõi thi, quản lý NFT

## Best Practices

### 1. **Tách biệt quyền và vai trò**
- **Quyền Owner**: Được xác định bởi smart contract
- **Vai trò Owner**: Được chọn bởi người dùng

### 2. **Kiểm tra hai lớp**
- Luôn kiểm tra cả `isOwner` và `userType`
- Không cho phép truy cập nếu thiếu một trong hai

### 3. **Thông báo rõ ràng**
- Mỗi trường hợp có thông báo và hướng dẫn cụ thể
- Giúp người dùng hiểu và khắc phục vấn đề

### 4. **Lưu trữ nhất quán**
- Sử dụng localStorage để lưu vai trò
- Tự động khôi phục khi refresh trang

## Ví dụ thực tế

### Trường hợp 1: Owner thực sự
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'owner'
→ Có thể truy cập Admin Dashboard
```

### Trường hợp 2: Owner nhưng chưa chọn vai trò
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'student'
→ Hiển thị OwnerSetup, hướng dẫn chọn vai trò
```

### Trường hợp 3: Không phải Owner
```
Địa chỉ ví: 0x1234567890abcdef...
isOwner: false
userType: 'student'
→ Hiển thị AccessDenied, hướng dẫn deploy contract
```

## Cải tiến tương lai

### 1. **Multi-role support**
- Một ví có thể có nhiều vai trò
- Chuyển đổi vai trò dễ dàng

### 2. **Role hierarchy**
- Hệ thống phân quyền phức tạp hơn
- Admin, Moderator, Student roles

### 3. **Role expiration**
- Vai trò có thời hạn
- Tự động hết hạn quyền

### 4. **Role approval**
- Cần phê duyệt để thay đổi vai trò
- Audit trail cho thay đổi quyền

## Troubleshooting

### Lỗi "Không có quyền truy cập"
1. **Kiểm tra isOwner**: Xem có phải owner của contract không
2. **Kiểm tra userType**: Xem đã chọn vai trò Owner chưa
3. **Kiểm tra kết nối**: Xem MetaMask đã kết nối chưa

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: localStorage không hoạt động
- **Giải pháp**: Kiểm tra browser settings, thử browser khác

## Kết luận

Logic phân quyền mới đảm bảo:
- **Bảo mật**: Chỉ owner thực sự mới có quyền admin
- **Rõ ràng**: Thông báo và hướng dẫn cụ thể
- **Nhất quán**: Kiểm tra hai lớp quyền
- **Linh hoạt**: Cho phép chọn vai trò phù hợp 

## Tổng quan

Hệ thống hiện tại có logic phân quyền rõ ràng và nhất quán:

### 🔐 **Hai lớp kiểm tra quyền:**

1. **Quyền Owner (Smart Contract Level)**
   - Kiểm tra xem địa chỉ ví có phải là owner của smart contract không
   - Được xác định bởi `isOwner` trong Web3Context
   - Chỉ owner thực sự mới có thể thực hiện các giao dịch admin

2. **Vai trò Owner (Application Level)**
   - Kiểm tra xem người dùng đã chọn vai trò Owner chưa
   - Được xác định bởi `userType === 'owner'`
   - Chỉ người dùng có vai trò Owner mới có thể truy cập Admin Dashboard

## Logic Phân quyền

### ✅ **Có thể truy cập Admin Dashboard:**
```
isOwner = true AND userType = 'owner'
```

### ❌ **Không thể truy cập Admin Dashboard:**

#### Trường hợp 1: Không phải Owner
```
isOwner = false
```
- **Hiển thị**: AccessDenied component
- **Thông báo**: "Bạn không phải Owner!"
- **Hướng dẫn**: Deploy lại contract với địa chỉ ví của bạn

#### Trường hợp 2: Là Owner nhưng chưa chọn vai trò
```
isOwner = true AND userType !== 'owner'
```
- **Hiển thị**: OwnerSetup component
- **Thông báo**: "Bạn có quyền Owner!"
- **Hướng dẫn**: Click "Chọn vai trò Owner"

#### Trường hợp 3: Chưa kết nối ví
```
isConnected = false
```
- **Hiển thị**: OwnerLogin component
- **Thông báo**: "Kết nối ví để truy cập Admin"
- **Hướng dẫn**: Kết nối MetaMask

## Luồng xử lý

### 1. Kết nối ví
```
User connects MetaMask
↓
checkOwnerStatus() - Kiểm tra quyền owner trong contract
↓
setIsOwner(true/false) - Lưu trạng thái quyền
```

### 2. Chọn vai trò
```
User selects role (Owner/Student)
↓
setUserTypeManually('owner'/'student') - Lưu vai trò
↓
localStorage.setItem('userType', role) - Lưu vào localStorage
```

### 3. Truy cập Admin Dashboard
```
User visits /admin
↓
Check isConnected
↓
Check isOwner
↓
Check userType === 'owner'
↓
Allow access to Admin Dashboard
```

## Các Component

### 1. OwnerLogin
- **Mục đích**: Kết nối ví MetaMask
- **Hiển thị khi**: `!isConnected`
- **Chức năng**: Kết nối ví, kiểm tra owner status

### 2. AccessDenied
- **Mục đích**: Thông báo từ chối truy cập
- **Hiển thị khi**: `!isOwner`
- **Chức năng**: Hiển thị lý do, hướng dẫn khắc phục

### 3. OwnerSetup
- **Mục đích**: Thiết lập vai trò Owner
- **Hiển thị khi**: `isOwner && userType !== 'owner'`
- **Chức năng**: Chọn vai trò Owner, thiết lập quyền

### 4. Admin Dashboard
- **Mục đích**: Giao diện quản lý admin
- **Hiển thị khi**: `isOwner && userType === 'owner'`
- **Chức năng**: Quản lý whitelist, theo dõi thi, quản lý NFT

## Best Practices

### 1. **Tách biệt quyền và vai trò**
- **Quyền Owner**: Được xác định bởi smart contract
- **Vai trò Owner**: Được chọn bởi người dùng

### 2. **Kiểm tra hai lớp**
- Luôn kiểm tra cả `isOwner` và `userType`
- Không cho phép truy cập nếu thiếu một trong hai

### 3. **Thông báo rõ ràng**
- Mỗi trường hợp có thông báo và hướng dẫn cụ thể
- Giúp người dùng hiểu và khắc phục vấn đề

### 4. **Lưu trữ nhất quán**
- Sử dụng localStorage để lưu vai trò
- Tự động khôi phục khi refresh trang

## Ví dụ thực tế

### Trường hợp 1: Owner thực sự
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'owner'
→ Có thể truy cập Admin Dashboard
```

### Trường hợp 2: Owner nhưng chưa chọn vai trò
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'student'
→ Hiển thị OwnerSetup, hướng dẫn chọn vai trò
```

### Trường hợp 3: Không phải Owner
```
Địa chỉ ví: 0x1234567890abcdef...
isOwner: false
userType: 'student'
→ Hiển thị AccessDenied, hướng dẫn deploy contract
```

## Cải tiến tương lai

### 1. **Multi-role support**
- Một ví có thể có nhiều vai trò
- Chuyển đổi vai trò dễ dàng

### 2. **Role hierarchy**
- Hệ thống phân quyền phức tạp hơn
- Admin, Moderator, Student roles

### 3. **Role expiration**
- Vai trò có thời hạn
- Tự động hết hạn quyền

### 4. **Role approval**
- Cần phê duyệt để thay đổi vai trò
- Audit trail cho thay đổi quyền

## Troubleshooting

### Lỗi "Không có quyền truy cập"
1. **Kiểm tra isOwner**: Xem có phải owner của contract không
2. **Kiểm tra userType**: Xem đã chọn vai trò Owner chưa
3. **Kiểm tra kết nối**: Xem MetaMask đã kết nối chưa

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: localStorage không hoạt động
- **Giải pháp**: Kiểm tra browser settings, thử browser khác

## Kết luận

Logic phân quyền mới đảm bảo:
- **Bảo mật**: Chỉ owner thực sự mới có quyền admin
- **Rõ ràng**: Thông báo và hướng dẫn cụ thể
- **Nhất quán**: Kiểm tra hai lớp quyền
- **Linh hoạt**: Cho phép chọn vai trò phù hợp 

## Tổng quan

Hệ thống hiện tại có logic phân quyền rõ ràng và nhất quán:

### 🔐 **Hai lớp kiểm tra quyền:**

1. **Quyền Owner (Smart Contract Level)**
   - Kiểm tra xem địa chỉ ví có phải là owner của smart contract không
   - Được xác định bởi `isOwner` trong Web3Context
   - Chỉ owner thực sự mới có thể thực hiện các giao dịch admin

2. **Vai trò Owner (Application Level)**
   - Kiểm tra xem người dùng đã chọn vai trò Owner chưa
   - Được xác định bởi `userType === 'owner'`
   - Chỉ người dùng có vai trò Owner mới có thể truy cập Admin Dashboard

## Logic Phân quyền

### ✅ **Có thể truy cập Admin Dashboard:**
```
isOwner = true AND userType = 'owner'
```

### ❌ **Không thể truy cập Admin Dashboard:**

#### Trường hợp 1: Không phải Owner
```
isOwner = false
```
- **Hiển thị**: AccessDenied component
- **Thông báo**: "Bạn không phải Owner!"
- **Hướng dẫn**: Deploy lại contract với địa chỉ ví của bạn

#### Trường hợp 2: Là Owner nhưng chưa chọn vai trò
```
isOwner = true AND userType !== 'owner'
```
- **Hiển thị**: OwnerSetup component
- **Thông báo**: "Bạn có quyền Owner!"
- **Hướng dẫn**: Click "Chọn vai trò Owner"

#### Trường hợp 3: Chưa kết nối ví
```
isConnected = false
```
- **Hiển thị**: OwnerLogin component
- **Thông báo**: "Kết nối ví để truy cập Admin"
- **Hướng dẫn**: Kết nối MetaMask

## Luồng xử lý

### 1. Kết nối ví
```
User connects MetaMask
↓
checkOwnerStatus() - Kiểm tra quyền owner trong contract
↓
setIsOwner(true/false) - Lưu trạng thái quyền
```

### 2. Chọn vai trò
```
User selects role (Owner/Student)
↓
setUserTypeManually('owner'/'student') - Lưu vai trò
↓
localStorage.setItem('userType', role) - Lưu vào localStorage
```

### 3. Truy cập Admin Dashboard
```
User visits /admin
↓
Check isConnected
↓
Check isOwner
↓
Check userType === 'owner'
↓
Allow access to Admin Dashboard
```

## Các Component

### 1. OwnerLogin
- **Mục đích**: Kết nối ví MetaMask
- **Hiển thị khi**: `!isConnected`
- **Chức năng**: Kết nối ví, kiểm tra owner status

### 2. AccessDenied
- **Mục đích**: Thông báo từ chối truy cập
- **Hiển thị khi**: `!isOwner`
- **Chức năng**: Hiển thị lý do, hướng dẫn khắc phục

### 3. OwnerSetup
- **Mục đích**: Thiết lập vai trò Owner
- **Hiển thị khi**: `isOwner && userType !== 'owner'`
- **Chức năng**: Chọn vai trò Owner, thiết lập quyền

### 4. Admin Dashboard
- **Mục đích**: Giao diện quản lý admin
- **Hiển thị khi**: `isOwner && userType === 'owner'`
- **Chức năng**: Quản lý whitelist, theo dõi thi, quản lý NFT

## Best Practices

### 1. **Tách biệt quyền và vai trò**
- **Quyền Owner**: Được xác định bởi smart contract
- **Vai trò Owner**: Được chọn bởi người dùng

### 2. **Kiểm tra hai lớp**
- Luôn kiểm tra cả `isOwner` và `userType`
- Không cho phép truy cập nếu thiếu một trong hai

### 3. **Thông báo rõ ràng**
- Mỗi trường hợp có thông báo và hướng dẫn cụ thể
- Giúp người dùng hiểu và khắc phục vấn đề

### 4. **Lưu trữ nhất quán**
- Sử dụng localStorage để lưu vai trò
- Tự động khôi phục khi refresh trang

## Ví dụ thực tế

### Trường hợp 1: Owner thực sự
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'owner'
→ Có thể truy cập Admin Dashboard
```

### Trường hợp 2: Owner nhưng chưa chọn vai trò
```
Địa chỉ ví: 0xb873ad3db908b6689e53ef8da3f36d82c7bdef84
isOwner: true
userType: 'student'
→ Hiển thị OwnerSetup, hướng dẫn chọn vai trò
```

### Trường hợp 3: Không phải Owner
```
Địa chỉ ví: 0x1234567890abcdef...
isOwner: false
userType: 'student'
→ Hiển thị AccessDenied, hướng dẫn deploy contract
```

## Cải tiến tương lai

### 1. **Multi-role support**
- Một ví có thể có nhiều vai trò
- Chuyển đổi vai trò dễ dàng

### 2. **Role hierarchy**
- Hệ thống phân quyền phức tạp hơn
- Admin, Moderator, Student roles

### 3. **Role expiration**
- Vai trò có thời hạn
- Tự động hết hạn quyền

### 4. **Role approval**
- Cần phê duyệt để thay đổi vai trò
- Audit trail cho thay đổi quyền

## Troubleshooting

### Lỗi "Không có quyền truy cập"
1. **Kiểm tra isOwner**: Xem có phải owner của contract không
2. **Kiểm tra userType**: Xem đã chọn vai trò Owner chưa
3. **Kiểm tra kết nối**: Xem MetaMask đã kết nối chưa

### Lỗi "caller is not the owner"
- **Nguyên nhân**: Không phải owner của contract
- **Giải pháp**: Deploy lại contract với địa chỉ ví của bạn

### Lỗi "Vai trò không được lưu"
- **Nguyên nhân**: localStorage không hoạt động
- **Giải pháp**: Kiểm tra browser settings, thử browser khác

## Kết luận

Logic phân quyền mới đảm bảo:
- **Bảo mật**: Chỉ owner thực sự mới có quyền admin
- **Rõ ràng**: Thông báo và hướng dẫn cụ thể
- **Nhất quán**: Kiểm tra hai lớp quyền
- **Linh hoạt**: Cho phép chọn vai trò phù hợp 