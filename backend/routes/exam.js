const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ethers = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Mock exam sessions (in real app, use database)
const examSessions = new Map();
const examAttempts = new Map();

// Load ABI
const examRegistrationAbi = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, '../../contracts/artifacts/contracts/ExamRegistration.sol/ExamRegistration.json'))).abi;
const contractAddress = process.env.EXAM_REGISTRATION_ADDRESS;
const rpcUrl = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

// Start exam session
router.post('/start', (req, res) => {
  try {
    const { studentWallet, studentId, subject, examSession } = req.body;
    
    if (!studentWallet || !studentId || !subject || !examSession) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'studentWallet, studentId, subject, and examSession are required'
      });
    }

    // Check if student is already in an exam session
    if (examSessions.has(studentWallet)) {
      return res.status(400).json({
        error: 'Student already in exam session',
        message: 'You are already participating in an exam'
      });
    }

    // Create exam session
    const sessionId = crypto.randomBytes(16).toString('hex');
    const examData = {
      sessionId,
      studentWallet,
      studentId,
      subject,
      examSession,
      startTime: new Date().toISOString(),
      status: 'active',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    examSessions.set(studentWallet, examData);

    res.json({
      success: true,
      message: 'Exam session started successfully',
      data: {
        sessionId,
        startTime: examData.startTime
      }
    });

  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({
      error: 'Failed to start exam',
      message: error.message
    });
  }
});

// End exam session
router.post('/end', (req, res) => {
  try {
    const { studentWallet, sessionId } = req.body;
    
    if (!studentWallet || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'studentWallet and sessionId are required'
      });
    }

    const examData = examSessions.get(studentWallet);
    
    if (!examData || examData.sessionId !== sessionId) {
      return res.status(400).json({
        error: 'Invalid exam session',
        message: 'No active exam session found'
      });
    }

    // Update exam session
    examData.endTime = new Date().toISOString();
    examData.status = 'completed';
    examData.duration = new Date(examData.endTime) - new Date(examData.startTime);

    // Store exam attempt
    examAttempts.set(sessionId, examData);

    // Remove from active sessions
    examSessions.delete(studentWallet);

    res.json({
      success: true,
      message: 'Exam session ended successfully',
      data: {
        sessionId,
        duration: examData.duration,
        endTime: examData.endTime
      }
    });

  } catch (error) {
    console.error('Error ending exam:', error);
    res.status(500).json({
      error: 'Failed to end exam',
      message: error.message
    });
  }
});

// Get exam session status
router.get('/status/:studentWallet', (req, res) => {
  try {
    const { studentWallet } = req.params;
    
    if (!studentWallet) {
      return res.status(400).json({
        error: 'Missing student wallet address'
      });
    }

    const examData = examSessions.get(studentWallet);
    
    if (!examData) {
      return res.json({
        success: true,
        data: {
          hasActiveSession: false,
          message: 'No active exam session'
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasActiveSession: true,
        sessionId: examData.sessionId,
        subject: examData.subject,
        examSession: examData.examSession,
        startTime: examData.startTime,
        duration: Date.now() - new Date(examData.startTime).getTime()
      }
    });

  } catch (error) {
    console.error('Error getting exam status:', error);
    res.status(500).json({
      error: 'Failed to get exam status',
      message: error.message
    });
  }
});

// Get exam history
router.get('/history/:studentWallet', (req, res) => {
  try {
    const { studentWallet } = req.params;
    
    if (!studentWallet) {
      return res.status(400).json({
        error: 'Missing student wallet address'
      });
    }

    // Get completed exams for this student
    const studentExams = Array.from(examAttempts.values())
      .filter(exam => exam.studentWallet === studentWallet)
      .map(exam => ({
        sessionId: exam.sessionId,
        subject: exam.subject,
        examSession: exam.examSession,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        status: exam.status
      }));

    res.json({
      success: true,
      data: {
        studentWallet,
        examHistory: studentExams,
        totalExams: studentExams.length
      }
    });

  } catch (error) {
    console.error('Error getting exam history:', error);
    res.status(500).json({
      error: 'Failed to get exam history',
      message: error.message
    });
  }
});

// Get active exam sessions (admin only)
router.get('/active-sessions', (req, res) => {
  try {
    const activeSessions = Array.from(examSessions.values()).map(session => ({
      sessionId: session.sessionId,
      studentWallet: session.studentWallet,
      studentId: session.studentId,
      subject: session.subject,
      examSession: session.examSession,
      startTime: session.startTime,
      ipAddress: session.ipAddress
    }));

    res.json({
      success: true,
      data: {
        activeSessions,
        totalActive: activeSessions.length
      }
    });

  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      error: 'Failed to get active sessions',
      message: error.message
    });
  }
});

// Monitor exam activity
router.post('/activity', (req, res) => {
  try {
    const { studentWallet, sessionId, activity } = req.body;
    
    if (!studentWallet || !sessionId || !activity) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'studentWallet, sessionId, and activity are required'
      });
    }

    const examData = examSessions.get(studentWallet);
    
    if (!examData || examData.sessionId !== sessionId) {
      return res.status(400).json({
        error: 'Invalid exam session',
        message: 'No active exam session found'
      });
    }

    // Log activity (in real app, store in database)
    console.log(`Exam activity - Student: ${studentWallet}, Session: ${sessionId}, Activity: ${activity}`);

    res.json({
      success: true,
      message: 'Activity logged successfully'
    });

  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      error: 'Failed to log activity',
      message: error.message
    });
  }
});

// Route nhận report gian lận từ FE và gọi markCheating
router.post('/cheat-report', async (req, res) => {
  try {
    console.log('--- [CheatReport] Incoming request ---');
    console.log('Body:', req.body);
    const { studentWallet, reason, timestamp } = req.body;
    if (!studentWallet || !reason) {
      console.log('[CheatReport] Missing studentWallet or reason');
      return res.status(400).json({ success: false, message: 'Missing studentWallet or reason' });
    }
    // Kết nối blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, examRegistrationAbi, wallet);
    // Kiểm tra đã bị đánh dấu gian lận chưa
    const isCheater = await contract.isStudentCheater(studentWallet);
    if (isCheater) {
      console.log(`[CheatReport] Student ${studentWallet} đã bị đánh dấu gian lận trước đó.`);
      return res.json({ success: true, alreadyCheater: true, message: 'Student already marked as cheater' });
    }
    // Gọi markCheating
    console.log(`[CheatReport] Calling markCheating for ${studentWallet}, reason: ${reason}`);
    const tx = await contract.markCheating(studentWallet, reason);
    await tx.wait();
    console.log(`[CheatReport] Marked cheater: ${studentWallet}, reason: ${reason}, tx: ${tx.hash}`);
    res.json({ success: true, marked: true, txHash: tx.hash });
  } catch (err) {
    console.error('[CheatReport] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark cheater', error: err.message });
  }
});
router.post('/123', async (req, res) => {
  try {
    const { studentWallet, reason, timestamp } = req.body;
    if (!studentWallet || !reason) {
      return res.status(400).json({ success: false, message: 'Missing studentWallet or reason' });
    }
    // Kết nối blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, examRegistrationAbi, wallet);
    // Gọi markCheating
    const tx = await contract.markCheating(studentWallet, reason);
    await tx.wait();
    console.log(`[CheatReport] Marked cheater: ${studentWallet}, reason: ${reason}, tx: ${tx.hash}`);
    res.json({ success: true, message: 'Cheater marked on-chain', txHash: tx.hash });
  } catch (err) {
    console.error('[CheatReport] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark cheater', error: err.message });
  }
});

module.exports = router; 
