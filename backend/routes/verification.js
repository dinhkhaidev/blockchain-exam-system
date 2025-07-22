const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const axios = require('axios');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Generate hash from image buffer
const generateImageHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Verify identity endpoint
router.post('/verify', upload.single('image'), async (req, res) => {
  try {
    const { studentWallet, studentId, subject, examSession } = req.body;
    const imageFile = req.file;
    const clientIP = getClientIP(req);

    // Validate required fields
    if (!studentWallet || !studentId || !subject || !examSession) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'studentWallet, studentId, subject, and examSession are required'
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload a verification image'
      });
    }

    // Generate image hash
    const imageHash = generateImageHash(imageFile.buffer);

    // In a real application, you would:
    // 1. Call smart contract to verify identity
    // 2. Store verification log on blockchain
    // 3. Mint NFT certificate

    // For demo purposes, we'll simulate the verification process
    const verificationResult = {
      success: true,
      studentWallet,
      studentId,
      subject,
      examSession,
      ipAddress: clientIP,
      imageHash,
      timestamp: new Date().toISOString(),
      verificationId: crypto.randomBytes(16).toString('hex')
    };

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: 'Identity verification successful',
      data: verificationResult
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

// Get verification logs
router.get('/logs/:studentWallet', async (req, res) => {
  try {
    const { studentWallet } = req.params;

    if (!studentWallet) {
      return res.status(400).json({
        error: 'Missing student wallet address'
      });
    }

    // In a real application, you would fetch logs from smart contract
    // For demo purposes, we'll return mock data
    const mockLogs = [
      {
        studentWallet,
        studentId: 'SV001',
        ipAddress: '192.168.1.100',
        imageHash: 'abc123...',
        timestamp: new Date().toISOString(),
        success: true
      }
    ];

    res.json({
      success: true,
      data: mockLogs
    });

  } catch (error) {
    console.error('Error fetching verification logs:', error);
    res.status(500).json({
      error: 'Failed to fetch verification logs',
      message: error.message
    });
  }
});

// Get IP information
router.get('/ip-info', async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    
    // Get IP geolocation info (optional)
    let ipInfo = { ip: clientIP };
    
    try {
      const response = await axios.get(`http://ip-api.com/json/${clientIP}`);
      ipInfo = {
        ...ipInfo,
        country: response.data.country,
        city: response.data.city,
        isp: response.data.isp
      };
    } catch (geoError) {
      console.log('Could not fetch IP geolocation info');
    }

    res.json({
      success: true,
      data: ipInfo
    });

  } catch (error) {
    console.error('Error getting IP info:', error);
    res.status(500).json({
      error: 'Failed to get IP information',
      message: error.message
    });
  }
});

// Upload image to IPFS (optional)
router.post('/upload-ipfs', upload.single('image'), async (req, res) => {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        error: 'No image provided'
      });
    }

    // In a real application, you would upload to IPFS
    // For demo purposes, we'll return a mock IPFS hash
    const mockIpfsHash = 'Qm' + crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      data: {
        ipfsHash: mockIpfsHash,
        imageHash: generateImageHash(imageFile.buffer),
        size: imageFile.size
      }
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      error: 'Failed to upload to IPFS',
      message: error.message
    });
  }
});

module.exports = router; 
