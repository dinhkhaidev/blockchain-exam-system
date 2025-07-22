const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Mock admin data (in real app, use database)
const adminStats = {
  totalStudents: 0,
  totalVerified: 0,
  totalExams: 0,
  totalNFTs: 0,
  activeSessions: 0
};

// Get system statistics
router.get('/stats', (req, res) => {
  try {
    // In a real application, you would fetch from database
    // For demo purposes, we'll return mock data
    const stats = {
      ...adminStats,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({
      error: 'Failed to get admin statistics',
      message: error.message
    });
  }
});

// Get all students
router.get('/students', (req, res) => {
  try {
    // In a real application, you would fetch from smart contract
    // For demo purposes, we'll return mock data
    const students = [
      {
        walletAddress: '0x1234567890abcdef',
        studentId: 'SV001',
        subject: 'Lập trình Web',
        examSession: 'Ca 1 (8:00 - 10:00)',
        registrationTime: new Date('2024-01-15T08:00:00Z').toISOString(),
        verificationTime: new Date('2024-01-15T08:30:00Z').toISOString(),
        isVerified: true,
        ipAddress: '192.168.1.100'
      },
      {
        walletAddress: '0xabcdef1234567890',
        studentId: 'SV002',
        subject: 'Cơ sở dữ liệu',
        examSession: 'Ca 2 (10:30 - 12:30)',
        registrationTime: new Date('2024-01-15T09:00:00Z').toISOString(),
        verificationTime: null,
        isVerified: false,
        ipAddress: '192.168.1.101'
      }
    ];

    res.json({
      success: true,
      data: {
        students,
        totalStudents: students.length,
        verifiedStudents: students.filter(s => s.isVerified).length,
        unverifiedStudents: students.filter(s => !s.isVerified).length
      }
    });

  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({
      error: 'Failed to get students',
      message: error.message
    });
  }
});

// Get verification logs
router.get('/verification-logs', (req, res) => {
  try {
    const { studentWallet } = req.query;
    
    // In a real application, you would fetch from smart contract
    // For demo purposes, we'll return mock data
    const logs = [
      {
        studentWallet: '0x1234567890abcdef',
        studentId: 'SV001',
        ipAddress: '192.168.1.100',
        imageHash: 'abc123def456...',
        timestamp: new Date('2024-01-15T08:30:00Z').toISOString(),
        success: true
      },
      {
        studentWallet: '0xabcdef1234567890',
        studentId: 'SV002',
        ipAddress: '192.168.1.101',
        imageHash: 'def456ghi789...',
        timestamp: new Date('2024-01-15T09:30:00Z').toISOString(),
        success: false
      }
    ];

    const filteredLogs = studentWallet 
      ? logs.filter(log => log.studentWallet === studentWallet)
      : logs;

    res.json({
      success: true,
      data: {
        logs: filteredLogs,
        totalLogs: filteredLogs.length,
        successfulVerifications: filteredLogs.filter(log => log.success).length,
        failedVerifications: filteredLogs.filter(log => !log.success).length
      }
    });

  } catch (error) {
    console.error('Error getting verification logs:', error);
    res.status(500).json({
      error: 'Failed to get verification logs',
      message: error.message
    });
  }
});

// Get exam sessions
router.get('/exam-sessions', (req, res) => {
  try {
    // In a real application, you would fetch from database
    // For demo purposes, we'll return mock data
    const sessions = [
      {
        sessionId: 'session_001',
        studentWallet: '0x1234567890abcdef',
        studentId: 'SV001',
        subject: 'Lập trình Web',
        examSession: 'Ca 1 (8:00 - 10:00)',
        startTime: new Date('2024-01-15T08:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
        status: 'completed',
        duration: 7200000, // 2 hours in milliseconds
        ipAddress: '192.168.1.100'
      },
      {
        sessionId: 'session_002',
        studentWallet: '0xabcdef1234567890',
        studentId: 'SV002',
        subject: 'Cơ sở dữ liệu',
        examSession: 'Ca 2 (10:30 - 12:30)',
        startTime: new Date('2024-01-15T10:30:00Z').toISOString(),
        endTime: null,
        status: 'active',
        duration: null,
        ipAddress: '192.168.1.101'
      }
    ];

    res.json({
      success: true,
      data: {
        sessions,
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'active').length,
        completedSessions: sessions.filter(s => s.status === 'completed').length
      }
    });

  } catch (error) {
    console.error('Error getting exam sessions:', error);
    res.status(500).json({
      error: 'Failed to get exam sessions',
      message: error.message
    });
  }
});

// Get NFT certificates
router.get('/nft-certificates', (req, res) => {
  try {
    // In a real application, you would fetch from smart contract
    // For demo purposes, we'll return mock data
    const certificates = [
      {
        tokenId: 'token_001',
        studentWallet: '0x1234567890abcdef',
        studentId: 'SV001',
        subject: 'Lập trình Web',
        examSession: 'Ca 1 (8:00 - 10:00)',
        mintDate: new Date('2024-01-15T10:30:00Z').toISOString(),
        isValid: true,
        metadata: {
          name: 'Exam Certificate - Lập trình Web',
          description: 'Certificate of completion for Lập trình Web exam',
          image: 'https://ipfs.io/ipfs/Qm...',
          attributes: [
            { trait_type: 'Student ID', value: 'SV001' },
            { trait_type: 'Subject', value: 'Lập trình Web' },
            { trait_type: 'Exam Session', value: 'Ca 1 (8:00 - 10:00)' }
          ]
        }
      }
    ];

    res.json({
      success: true,
      data: {
        certificates,
        totalCertificates: certificates.length,
        validCertificates: certificates.filter(c => c.isValid).length,
        revokedCertificates: certificates.filter(c => !c.isValid).length
      }
    });

  } catch (error) {
    console.error('Error getting NFT certificates:', error);
    res.status(500).json({
      error: 'Failed to get NFT certificates',
      message: error.message
    });
  }
});

// Search students
router.get('/search', (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Missing search query'
      });
    }

    // In a real application, you would search in database
    // For demo purposes, we'll return mock data
    const mockStudents = [
      {
        walletAddress: '0x1234567890abcdef',
        studentId: 'SV001',
        subject: 'Lập trình Web',
        examSession: 'Ca 1 (8:00 - 10:00)',
        isVerified: true
      },
      {
        walletAddress: '0xabcdef1234567890',
        studentId: 'SV002',
        subject: 'Cơ sở dữ liệu',
        examSession: 'Ca 2 (10:30 - 12:30)',
        isVerified: false
      }
    ];

    let results = mockStudents;

    // Filter by search type
    if (type === 'studentId') {
      results = mockStudents.filter(s => s.studentId.toLowerCase().includes(query.toLowerCase()));
    } else if (type === 'wallet') {
      results = mockStudents.filter(s => s.walletAddress.toLowerCase().includes(query.toLowerCase()));
    } else {
      // Search in all fields
      results = mockStudents.filter(s => 
        s.studentId.toLowerCase().includes(query.toLowerCase()) ||
        s.walletAddress.toLowerCase().includes(query.toLowerCase()) ||
        s.subject.toLowerCase().includes(query.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: {
        results,
        totalResults: results.length,
        query,
        type: type || 'all'
      }
    });

  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({
      error: 'Failed to search students',
      message: error.message
    });
  }
});

// Export data
router.get('/export/:type', (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['students', 'verifications', 'exams', 'nfts'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid export type',
        message: 'Valid types: students, verifications, exams, nfts'
      });
    }

    // In a real application, you would export from database
    // For demo purposes, we'll return mock data
    const exportData = {
      students: [
        { studentId: 'SV001', walletAddress: '0x1234567890abcdef', subject: 'Lập trình Web', isVerified: true },
        { studentId: 'SV002', walletAddress: '0xabcdef1234567890', subject: 'Cơ sở dữ liệu', isVerified: false }
      ],
      verifications: [
        { studentId: 'SV001', timestamp: '2024-01-15T08:30:00Z', success: true },
        { studentId: 'SV002', timestamp: '2024-01-15T09:30:00Z', success: false }
      ],
      exams: [
        { studentId: 'SV001', subject: 'Lập trình Web', duration: '2:00:00', status: 'completed' },
        { studentId: 'SV002', subject: 'Cơ sở dữ liệu', duration: '1:30:00', status: 'active' }
      ],
      nfts: [
        { tokenId: 'token_001', studentId: 'SV001', subject: 'Lập trình Web', isValid: true },
        { tokenId: 'token_002', studentId: 'SV002', subject: 'Cơ sở dữ liệu', isValid: true }
      ]
    };

    res.json({
      success: true,
      data: {
        type,
        data: exportData[type],
        exportDate: new Date().toISOString(),
        totalRecords: exportData[type].length
      }
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      error: 'Failed to export data',
      message: error.message
    });
  }
});

// Get student addresses
router.get('/student-addresses', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../frontend/src/data/student-addresses.json');
    const data = await fs.readFile(filePath, 'utf8');
    const addresses = JSON.parse(data);
    
    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Error reading student addresses:', error);
    res.status(500).json({
      error: 'Failed to read student addresses',
      message: error.message
    });
  }
});

// Update student addresses
router.post('/student-addresses', async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({
        error: 'Invalid addresses data',
        message: 'Addresses must be an array'
      });
    }

    // Validate addresses
    const validAddresses = addresses.filter(addr => 
      /^0x[a-fA-F0-9]{40}$/.test(addr)
    );

    const updatedData = {
      studentAddresses: validAddresses,
      lastUpdated: new Date().toISOString(),
      description: "Danh sách địa chỉ sinh viên để kiểm tra NFT eligibility"
    };

    const filePath = path.join(__dirname, '../../frontend/src/data/student-addresses.json');
    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    
    res.json({
      success: true,
      message: 'Student addresses updated successfully',
      data: {
        addresses: validAddresses,
        totalAddresses: validAddresses.length,
        lastUpdated: updatedData.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error updating student addresses:', error);
    res.status(500).json({
      error: 'Failed to update student addresses',
      message: error.message
    });
  }
});

// Add single student address
router.post('/student-addresses/add', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid address format',
        message: 'Address must be a valid Ethereum address'
      });
    }

    const filePath = path.join(__dirname, '../../frontend/src/data/student-addresses.json');
    const data = await fs.readFile(filePath, 'utf8');
    const currentData = JSON.parse(data);
    
    if (currentData.studentAddresses.includes(address)) {
      return res.status(400).json({
        error: 'Address already exists',
        message: 'This address is already in the list'
      });
    }

    currentData.studentAddresses.push(address);
    currentData.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(filePath, JSON.stringify(currentData, null, 2));
    
    res.json({
      success: true,
      message: 'Address added successfully',
      data: {
        address,
        totalAddresses: currentData.studentAddresses.length,
        lastUpdated: currentData.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error adding student address:', error);
    res.status(500).json({
      error: 'Failed to add student address',
      message: error.message
    });
  }
});

// Remove single student address
router.delete('/student-addresses/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const filePath = path.join(__dirname, '../../frontend/src/data/student-addresses.json');
    const data = await fs.readFile(filePath, 'utf8');
    const currentData = JSON.parse(data);
    
    const initialLength = currentData.studentAddresses.length;
    currentData.studentAddresses = currentData.studentAddresses.filter(addr => addr !== address);
    
    if (currentData.studentAddresses.length === initialLength) {
      return res.status(404).json({
        error: 'Address not found',
        message: 'This address is not in the list'
      });
    }
    
    currentData.lastUpdated = new Date().toISOString();
    await fs.writeFile(filePath, JSON.stringify(currentData, null, 2));
    
    res.json({
      success: true,
      message: 'Address removed successfully',
      data: {
        removedAddress: address,
        totalAddresses: currentData.studentAddresses.length,
        lastUpdated: currentData.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error removing student address:', error);
    res.status(500).json({
      error: 'Failed to remove student address',
      message: error.message
    });
  }
});

// Reset to default addresses
router.post('/student-addresses/reset', async (req, res) => {
  try {
    const defaultAddresses = [
      '0x4EE204518233e2e71025C75E59eF204435479844',
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      '0x8e4cf11a8f982c0cfd54f3f1f6a0db91f0c1b30a'
    ];

    const resetData = {
      studentAddresses: defaultAddresses,
      lastUpdated: new Date().toISOString(),
      description: "Danh sách địa chỉ sinh viên để kiểm tra NFT eligibility"
    };

    const filePath = path.join(__dirname, '../../frontend/src/data/student-addresses.json');
    await fs.writeFile(filePath, JSON.stringify(resetData, null, 2));
    
    res.json({
      success: true,
      message: 'Student addresses reset to default',
      data: {
        addresses: defaultAddresses,
        totalAddresses: defaultAddresses.length,
        lastUpdated: resetData.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error resetting student addresses:', error);
    res.status(500).json({
      error: 'Failed to reset student addresses',
      message: error.message
    });
  }
});

module.exports = router; 
 
 
 