# Hướng dẫn khắc phục lỗi ESLint

## Lỗi đã gặp

```
[eslint] 
src\components\OwnerSetup.js
  Line 118:16:  'userType' is not defined  no-undef
  Line 125:54:  'userType' is not defined  no-undef
  Line 126:20:  'userType' is not defined  no-undef
  Line 173:23:  'userType' is not defined  no-undef
```

## Nguyên nhân

Lỗi này xảy ra vì `userType` chưa được import từ `useWeb3` hook trong component `OwnerSetup.js`.

## Giải pháp đã áp dụng

### 1. Cập nhật import trong OwnerSetup.js

**Trước:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, setUserTypeManually } = useWeb3();
```

**Sau:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, userType, setUserTypeManually } = useWeb3();
```

### 2. Kiểm tra các file khác

Đảm bảo tất cả các component sử dụng `userType` đều import đúng cách:

#### ✅ Các file đã import đúng:
- `frontend/src/pages/Admin.js`
- `frontend/src/pages/Register.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/Dashboard.js`
- `frontend/src/components/Navbar.js`
- `frontend/src/components/AccessDenied.js`
- `frontend/src/components/ProgressIndicator.js`

#### ✅ File đã sửa:
- `frontend/src/components/OwnerSetup.js`

## Cách kiểm tra lỗi ESLint

### 1. Chạy linter
```bash
cd frontend
npm run lint
```

### 2. Chạy linter với fix tự động
```bash
cd frontend
npm run lint -- --fix
```

### 3. Kiểm tra từng file
```bash
npx eslint src/components/OwnerSetup.js
```

## Best Practices để tránh lỗi ESLint

### 1. **Import đầy đủ**
```javascript
// ✅ Đúng
const { userType, isOwner, account } = useWeb3();

// ❌ Sai
const { isOwner, account } = useWeb3();
// userType không được import nhưng vẫn sử dụng
```

### 2. **Kiểm tra trước khi sử dụng**
```javascript
// ✅ Đúng
{userType && userType === 'owner' && (
  <div>Admin content</div>
)}

// ❌ Sai
{userType === 'owner' && (
  <div>Admin content</div>
)}
// userType có thể là null
```

### 3. **Sử dụng default values**
```javascript
// ✅ Đúng
const { userType = 'student' } = useWeb3();

// Hoặc
const userType = useWeb3().userType || 'student';
```

### 4. **Kiểm tra prop types**
```javascript
import PropTypes from 'prop-types';

const MyComponent = ({ userType }) => {
  return <div>{userType}</div>;
};

MyComponent.propTypes = {
  userType: PropTypes.string
};

MyComponent.defaultProps = {
  userType: 'student'
};
```

## Các lỗi ESLint thường gặp

### 1. **no-undef**
- **Nguyên nhân**: Biến chưa được khai báo hoặc import
- **Giải pháp**: Import hoặc khai báo biến

### 2. **no-unused-vars**
- **Nguyên nhân**: Import nhưng không sử dụng
- **Giải pháp**: Xóa import không cần thiết

### 3. **react-hooks/exhaustive-deps**
- **Nguyên nhân**: useEffect thiếu dependencies
- **Giải pháp**: Thêm dependencies vào array

### 4. **jsx-a11y/alt-text**
- **Nguyên nhân**: Image không có alt text
- **Giải pháp**: Thêm alt attribute

## Cấu hình ESLint

### 1. File .eslintrc.js
```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### 2. File .eslintignore
```
node_modules/
build/
dist/
```

## Scripts hữu ích

### 1. Kiểm tra tất cả files
```bash
npm run lint
```

### 2. Fix tự động
```bash
npm run lint -- --fix
```

### 3. Kiểm tra file cụ thể
```bash
npx eslint src/components/MyComponent.js
```

### 4. Kiểm tra với output chi tiết
```bash
npx eslint src/components/MyComponent.js --format=stylish
```

## Troubleshooting

### Lỗi "Cannot find module"
- **Nguyên nhân**: Import sai đường dẫn
- **Giải pháp**: Kiểm tra đường dẫn import

### Lỗi "Unexpected token"
- **Nguyên nhân**: Syntax error
- **Giải pháp**: Kiểm tra cú pháp JavaScript

### Lỗi "React is not defined"
- **Nguyên nhân**: Chưa import React
- **Giải pháp**: Thêm `import React from 'react';`

## Kết luận

Lỗi ESLint trong `OwnerSetup.js` đã được khắc phục bằng cách thêm `userType` vào destructuring của `useWeb3()`. Điều này đảm bảo:

- ✅ Tất cả biến được import đúng cách
- ✅ Không có lỗi "no-undef"
- ✅ Code tuân thủ best practices
- ✅ Dễ bảo trì và debug 

## Lỗi đã gặp

```
[eslint] 
src\components\OwnerSetup.js
  Line 118:16:  'userType' is not defined  no-undef
  Line 125:54:  'userType' is not defined  no-undef
  Line 126:20:  'userType' is not defined  no-undef
  Line 173:23:  'userType' is not defined  no-undef
```

## Nguyên nhân

Lỗi này xảy ra vì `userType` chưa được import từ `useWeb3` hook trong component `OwnerSetup.js`.

## Giải pháp đã áp dụng

### 1. Cập nhật import trong OwnerSetup.js

**Trước:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, setUserTypeManually } = useWeb3();
```

**Sau:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, userType, setUserTypeManually } = useWeb3();
```

### 2. Kiểm tra các file khác

Đảm bảo tất cả các component sử dụng `userType` đều import đúng cách:

#### ✅ Các file đã import đúng:
- `frontend/src/pages/Admin.js`
- `frontend/src/pages/Register.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/Dashboard.js`
- `frontend/src/components/Navbar.js`
- `frontend/src/components/AccessDenied.js`
- `frontend/src/components/ProgressIndicator.js`

#### ✅ File đã sửa:
- `frontend/src/components/OwnerSetup.js`

## Cách kiểm tra lỗi ESLint

### 1. Chạy linter
```bash
cd frontend
npm run lint
```

### 2. Chạy linter với fix tự động
```bash
cd frontend
npm run lint -- --fix
```

### 3. Kiểm tra từng file
```bash
npx eslint src/components/OwnerSetup.js
```

## Best Practices để tránh lỗi ESLint

### 1. **Import đầy đủ**
```javascript
// ✅ Đúng
const { userType, isOwner, account } = useWeb3();

// ❌ Sai
const { isOwner, account } = useWeb3();
// userType không được import nhưng vẫn sử dụng
```

### 2. **Kiểm tra trước khi sử dụng**
```javascript
// ✅ Đúng
{userType && userType === 'owner' && (
  <div>Admin content</div>
)}

// ❌ Sai
{userType === 'owner' && (
  <div>Admin content</div>
)}
// userType có thể là null
```

### 3. **Sử dụng default values**
```javascript
// ✅ Đúng
const { userType = 'student' } = useWeb3();

// Hoặc
const userType = useWeb3().userType || 'student';
```

### 4. **Kiểm tra prop types**
```javascript
import PropTypes from 'prop-types';

const MyComponent = ({ userType }) => {
  return <div>{userType}</div>;
};

MyComponent.propTypes = {
  userType: PropTypes.string
};

MyComponent.defaultProps = {
  userType: 'student'
};
```

## Các lỗi ESLint thường gặp

### 1. **no-undef**
- **Nguyên nhân**: Biến chưa được khai báo hoặc import
- **Giải pháp**: Import hoặc khai báo biến

### 2. **no-unused-vars**
- **Nguyên nhân**: Import nhưng không sử dụng
- **Giải pháp**: Xóa import không cần thiết

### 3. **react-hooks/exhaustive-deps**
- **Nguyên nhân**: useEffect thiếu dependencies
- **Giải pháp**: Thêm dependencies vào array

### 4. **jsx-a11y/alt-text**
- **Nguyên nhân**: Image không có alt text
- **Giải pháp**: Thêm alt attribute

## Cấu hình ESLint

### 1. File .eslintrc.js
```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### 2. File .eslintignore
```
node_modules/
build/
dist/
```

## Scripts hữu ích

### 1. Kiểm tra tất cả files
```bash
npm run lint
```

### 2. Fix tự động
```bash
npm run lint -- --fix
```

### 3. Kiểm tra file cụ thể
```bash
npx eslint src/components/MyComponent.js
```

### 4. Kiểm tra với output chi tiết
```bash
npx eslint src/components/MyComponent.js --format=stylish
```

## Troubleshooting

### Lỗi "Cannot find module"
- **Nguyên nhân**: Import sai đường dẫn
- **Giải pháp**: Kiểm tra đường dẫn import

### Lỗi "Unexpected token"
- **Nguyên nhân**: Syntax error
- **Giải pháp**: Kiểm tra cú pháp JavaScript

### Lỗi "React is not defined"
- **Nguyên nhân**: Chưa import React
- **Giải pháp**: Thêm `import React from 'react';`

## Kết luận

Lỗi ESLint trong `OwnerSetup.js` đã được khắc phục bằng cách thêm `userType` vào destructuring của `useWeb3()`. Điều này đảm bảo:

- ✅ Tất cả biến được import đúng cách
- ✅ Không có lỗi "no-undef"
- ✅ Code tuân thủ best practices
- ✅ Dễ bảo trì và debug 
 

## Lỗi đã gặp

```
[eslint] 
src\components\OwnerSetup.js
  Line 118:16:  'userType' is not defined  no-undef
  Line 125:54:  'userType' is not defined  no-undef
  Line 126:20:  'userType' is not defined  no-undef
  Line 173:23:  'userType' is not defined  no-undef
```

## Nguyên nhân

Lỗi này xảy ra vì `userType` chưa được import từ `useWeb3` hook trong component `OwnerSetup.js`.

## Giải pháp đã áp dụng

### 1. Cập nhật import trong OwnerSetup.js

**Trước:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, setUserTypeManually } = useWeb3();
```

**Sau:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, userType, setUserTypeManually } = useWeb3();
```

### 2. Kiểm tra các file khác

Đảm bảo tất cả các component sử dụng `userType` đều import đúng cách:

#### ✅ Các file đã import đúng:
- `frontend/src/pages/Admin.js`
- `frontend/src/pages/Register.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/Dashboard.js`
- `frontend/src/components/Navbar.js`
- `frontend/src/components/AccessDenied.js`
- `frontend/src/components/ProgressIndicator.js`

#### ✅ File đã sửa:
- `frontend/src/components/OwnerSetup.js`

## Cách kiểm tra lỗi ESLint

### 1. Chạy linter
```bash
cd frontend
npm run lint
```

### 2. Chạy linter với fix tự động
```bash
cd frontend
npm run lint -- --fix
```

### 3. Kiểm tra từng file
```bash
npx eslint src/components/OwnerSetup.js
```

## Best Practices để tránh lỗi ESLint

### 1. **Import đầy đủ**
```javascript
// ✅ Đúng
const { userType, isOwner, account } = useWeb3();

// ❌ Sai
const { isOwner, account } = useWeb3();
// userType không được import nhưng vẫn sử dụng
```

### 2. **Kiểm tra trước khi sử dụng**
```javascript
// ✅ Đúng
{userType && userType === 'owner' && (
  <div>Admin content</div>
)}

// ❌ Sai
{userType === 'owner' && (
  <div>Admin content</div>
)}
// userType có thể là null
```

### 3. **Sử dụng default values**
```javascript
// ✅ Đúng
const { userType = 'student' } = useWeb3();

// Hoặc
const userType = useWeb3().userType || 'student';
```

### 4. **Kiểm tra prop types**
```javascript
import PropTypes from 'prop-types';

const MyComponent = ({ userType }) => {
  return <div>{userType}</div>;
};

MyComponent.propTypes = {
  userType: PropTypes.string
};

MyComponent.defaultProps = {
  userType: 'student'
};
```

## Các lỗi ESLint thường gặp

### 1. **no-undef**
- **Nguyên nhân**: Biến chưa được khai báo hoặc import
- **Giải pháp**: Import hoặc khai báo biến

### 2. **no-unused-vars**
- **Nguyên nhân**: Import nhưng không sử dụng
- **Giải pháp**: Xóa import không cần thiết

### 3. **react-hooks/exhaustive-deps**
- **Nguyên nhân**: useEffect thiếu dependencies
- **Giải pháp**: Thêm dependencies vào array

### 4. **jsx-a11y/alt-text**
- **Nguyên nhân**: Image không có alt text
- **Giải pháp**: Thêm alt attribute

## Cấu hình ESLint

### 1. File .eslintrc.js
```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### 2. File .eslintignore
```
node_modules/
build/
dist/
```

## Scripts hữu ích

### 1. Kiểm tra tất cả files
```bash
npm run lint
```

### 2. Fix tự động
```bash
npm run lint -- --fix
```

### 3. Kiểm tra file cụ thể
```bash
npx eslint src/components/MyComponent.js
```

### 4. Kiểm tra với output chi tiết
```bash
npx eslint src/components/MyComponent.js --format=stylish
```

## Troubleshooting

### Lỗi "Cannot find module"
- **Nguyên nhân**: Import sai đường dẫn
- **Giải pháp**: Kiểm tra đường dẫn import

### Lỗi "Unexpected token"
- **Nguyên nhân**: Syntax error
- **Giải pháp**: Kiểm tra cú pháp JavaScript

### Lỗi "React is not defined"
- **Nguyên nhân**: Chưa import React
- **Giải pháp**: Thêm `import React from 'react';`

## Kết luận

Lỗi ESLint trong `OwnerSetup.js` đã được khắc phục bằng cách thêm `userType` vào destructuring của `useWeb3()`. Điều này đảm bảo:

- ✅ Tất cả biến được import đúng cách
- ✅ Không có lỗi "no-undef"
- ✅ Code tuân thủ best practices
- ✅ Dễ bảo trì và debug 

## Lỗi đã gặp

```
[eslint] 
src\components\OwnerSetup.js
  Line 118:16:  'userType' is not defined  no-undef
  Line 125:54:  'userType' is not defined  no-undef
  Line 126:20:  'userType' is not defined  no-undef
  Line 173:23:  'userType' is not defined  no-undef
```

## Nguyên nhân

Lỗi này xảy ra vì `userType` chưa được import từ `useWeb3` hook trong component `OwnerSetup.js`.

## Giải pháp đã áp dụng

### 1. Cập nhật import trong OwnerSetup.js

**Trước:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, setUserTypeManually } = useWeb3();
```

**Sau:**
```javascript
const { isConnected, account, contracts, isOwner, ownerAddress, userType, setUserTypeManually } = useWeb3();
```

### 2. Kiểm tra các file khác

Đảm bảo tất cả các component sử dụng `userType` đều import đúng cách:

#### ✅ Các file đã import đúng:
- `frontend/src/pages/Admin.js`
- `frontend/src/pages/Register.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/Dashboard.js`
- `frontend/src/components/Navbar.js`
- `frontend/src/components/AccessDenied.js`
- `frontend/src/components/ProgressIndicator.js`

#### ✅ File đã sửa:
- `frontend/src/components/OwnerSetup.js`

## Cách kiểm tra lỗi ESLint

### 1. Chạy linter
```bash
cd frontend
npm run lint
```

### 2. Chạy linter với fix tự động
```bash
cd frontend
npm run lint -- --fix
```

### 3. Kiểm tra từng file
```bash
npx eslint src/components/OwnerSetup.js
```

## Best Practices để tránh lỗi ESLint

### 1. **Import đầy đủ**
```javascript
// ✅ Đúng
const { userType, isOwner, account } = useWeb3();

// ❌ Sai
const { isOwner, account } = useWeb3();
// userType không được import nhưng vẫn sử dụng
```

### 2. **Kiểm tra trước khi sử dụng**
```javascript
// ✅ Đúng
{userType && userType === 'owner' && (
  <div>Admin content</div>
)}

// ❌ Sai
{userType === 'owner' && (
  <div>Admin content</div>
)}
// userType có thể là null
```

### 3. **Sử dụng default values**
```javascript
// ✅ Đúng
const { userType = 'student' } = useWeb3();

// Hoặc
const userType = useWeb3().userType || 'student';
```

### 4. **Kiểm tra prop types**
```javascript
import PropTypes from 'prop-types';

const MyComponent = ({ userType }) => {
  return <div>{userType}</div>;
};

MyComponent.propTypes = {
  userType: PropTypes.string
};

MyComponent.defaultProps = {
  userType: 'student'
};
```

## Các lỗi ESLint thường gặp

### 1. **no-undef**
- **Nguyên nhân**: Biến chưa được khai báo hoặc import
- **Giải pháp**: Import hoặc khai báo biến

### 2. **no-unused-vars**
- **Nguyên nhân**: Import nhưng không sử dụng
- **Giải pháp**: Xóa import không cần thiết

### 3. **react-hooks/exhaustive-deps**
- **Nguyên nhân**: useEffect thiếu dependencies
- **Giải pháp**: Thêm dependencies vào array

### 4. **jsx-a11y/alt-text**
- **Nguyên nhân**: Image không có alt text
- **Giải pháp**: Thêm alt attribute

## Cấu hình ESLint

### 1. File .eslintrc.js
```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### 2. File .eslintignore
```
node_modules/
build/
dist/
```

## Scripts hữu ích

### 1. Kiểm tra tất cả files
```bash
npm run lint
```

### 2. Fix tự động
```bash
npm run lint -- --fix
```

### 3. Kiểm tra file cụ thể
```bash
npx eslint src/components/MyComponent.js
```

### 4. Kiểm tra với output chi tiết
```bash
npx eslint src/components/MyComponent.js --format=stylish
```

## Troubleshooting

### Lỗi "Cannot find module"
- **Nguyên nhân**: Import sai đường dẫn
- **Giải pháp**: Kiểm tra đường dẫn import

### Lỗi "Unexpected token"
- **Nguyên nhân**: Syntax error
- **Giải pháp**: Kiểm tra cú pháp JavaScript

### Lỗi "React is not defined"
- **Nguyên nhân**: Chưa import React
- **Giải pháp**: Thêm `import React from 'react';`

## Kết luận

Lỗi ESLint trong `OwnerSetup.js` đã được khắc phục bằng cách thêm `userType` vào destructuring của `useWeb3()`. Điều này đảm bảo:

- ✅ Tất cả biến được import đúng cách
- ✅ Không có lỗi "no-undef"
- ✅ Code tuân thủ best practices
- ✅ Dễ bảo trì và debug 
 