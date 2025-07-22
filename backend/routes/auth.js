const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Mock user database (in real app, use proper database)
const users = new Map();

// Generate nonce for wallet signature verification
router.post('/nonce', (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        error: 'Missing wallet address'
      });
    }

    // Generate a random nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    
    // Store nonce for verification (in real app, store in database)
    users.set(walletAddress, {
      nonce,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      data: {
        nonce,
        message: `Please sign this message to verify your wallet: ${nonce}`
      }
    });

  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({
      error: 'Failed to generate nonce',
      message: error.message
    });
  }
});

// Verify wallet signature
router.post('/verify-signature', (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress, signature, and message are required'
      });
    }

    // In a real application, you would verify the signature using ethers.js
    // For demo purposes, we'll simulate verification
    const user = users.get(walletAddress);
    
    if (!user || user.nonce !== message) {
      return res.status(400).json({
        error: 'Invalid nonce or wallet address'
      });
    }

    // Check if nonce is expired (5 minutes)
    if (Date.now() - user.timestamp > 5 * 60 * 1000) {
      return res.status(400).json({
        error: 'Nonce expired'
      });
    }

    // Generate JWT token (in real app)
    const token = crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      message: 'Wallet verified successfully',
      data: {
        token,
        walletAddress
      }
    });

  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({
      error: 'Failed to verify signature',
      message: error.message
    });
  }
});

// Get wallet info
router.get('/wallet/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        error: 'Missing wallet address'
      });
    }

    // In a real application, you would fetch from database
    const user = users.get(address);
    
    res.json({
      success: true,
      data: {
        walletAddress: address,
        isVerified: !!user,
        lastLogin: user ? new Date(user.timestamp).toISOString() : null
      }
    });

  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({
      error: 'Failed to get wallet info',
      message: error.message
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (walletAddress) {
      users.delete(walletAddress);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      error: 'Failed to logout',
      message: error.message
    });
  }
});

module.exports = router; 
