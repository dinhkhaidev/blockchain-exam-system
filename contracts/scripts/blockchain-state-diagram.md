# Blockchain State Machine

## 📊 State Transitions

```
Initial State
    ↓
[No Students]
    ↓
addToPendingMint()
    ↓
[Student in Pending]
    ↓
moveToCompleted()
    ↓
[Student Completed]
    ↓
NFT Minted
```

## 🔄 State Changes

### 1. Initial State
```
pendingMints: {}
completedMints: {}
pendingAddresses: []
completedAddresses: []
```

### 2. After addToPendingMint(0x123..., "SV001", "Math")
```
pendingMints: {
  "0x123...": {
    studentId: "SV001",
    subject: "Math",
    examSession: "Ca 1",
    score: 3,
    examDate: 1640995200,
    ipAddress: "192.168.1.100",
    addedAt: 1640995200,
    exists: true
  }
}
pendingAddresses: ["0x123..."]
```

### 3. After moveToCompleted(0x123..., "token123")
```
pendingMints: {}
completedMints: {
  "0x123...": {
    studentId: "SV001",
    subject: "Math",
    examSession: "Ca 1",
    score: 3,
    examDate: 1640995200,
    ipAddress: "192.168.1.100",
    mintDate: 1640995300,
    tokenId: "token123",
    exists: true
  }
}
pendingAddresses: []
completedAddresses: ["0x123..."]
```

## 🗂️ Storage Layout

### Mapping Storage
```
pendingMints[address] → PendingMint struct
├── studentId (string)
├── subject (string)
├── examSession (string)
├── score (uint256)
├── examDate (uint256)
├── ipAddress (string)
├── addedAt (uint256)
└── exists (bool)
```

### Array Storage
```
pendingAddresses[0] → address
pendingAddresses[1] → address
...
pendingAddresses[n] → address
```

## 🔍 Reading Data

### View Functions (Free)
```solidity
// Get specific student pending info
function getPendingMint(address studentWallet) 
  external view returns (PendingMint memory)

// Get all pending addresses
function getAllPendingAddresses() 
  external view returns (address[] memory)

// Get count
function getPendingCount() 
  external view returns (uint256)
```

### Events (Logs)
```solidity
event StudentAddedToPending(
  address indexed studentWallet, 
  string studentId, 
  string subject
);
```

## ⛽ Gas Costs

### Storage Operations
- **SSTORE** (first time): 20,000 gas
- **SSTORE** (update): 5,000 gas
- **SLOAD**: 100 gas

### Memory Operations
- **PUSH**: 3 gas
- **POP**: 2 gas
- **ADD/SUB**: 3 gas

### Example Gas Usage
```
addToPendingMint() ≈ 50,000 gas
moveToCompleted() ≈ 30,000 gas
getPendingMint() ≈ 100 gas (free)
``` 