import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';

const subjects = [
  'Lập trình Web',
  'Cơ sở dữ liệu',
  'Lập trình hướng đối tượng',
  'Mạng máy tính',
  'Hệ điều hành',
  'Cấu trúc dữ liệu',
  'Toán rời rạc',
  'Xác suất thống kê'
];

// Custom hook: lấy danh sách các môn đã có NFT
function useOwnedSubjects(account, contracts, isConnected) {
  const [ownedSubjects, setOwnedSubjects] = useState([]);
  useEffect(() => {
    let ignore = false;
    const fetchOwnedSubjects = async () => {
      if (isConnected && contracts.examCertificateNFT && account) {
        try {
          const total = await contracts.examCertificateNFT.getTotalCertificates();
          const subjectsSet = new Set();
          for (let i = 1; i <= Number(total); i++) {
            try {
              const info = await contracts.examCertificateNFT.getExamInfo(i);
              const owner = await contracts.examCertificateNFT.ownerOf(i);
              if (owner.toLowerCase() === account.toLowerCase()) {
                subjectsSet.add(info.subject);
              }
            } catch (err) {}
          }
          if (!ignore) setOwnedSubjects(Array.from(subjectsSet));
        } catch (err) {
          if (!ignore) setOwnedSubjects([]);
        }
      } else if (!ignore) setOwnedSubjects([]);
    };
    fetchOwnedSubjects();
    return () => { ignore = true; };
  }, [isConnected, contracts.examCertificateNFT, account]);
  return ownedSubjects;
}

const Exam = () => {
  const { isConnected, account, contracts, examRegistrationWrite, examCertificateNFT } = useWeb3();
  const [examSession, setExamSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examTime, setExamTime] = useState(0);
  const [showExam, setShowExam] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [subjectToExam, setSubjectToExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [cheatCount, setCheatCount] = useState(0);
  const [fullscreenWarned, setFullscreenWarned] = useState(false);
  const [isCheater, setIsCheater] = useState(false);
  const CHEAT_LIMIT = 3; // Số lần tối đa trước khi đánh dấu gian lận
  const cheatEventLock = useRef(false); // Dùng useRef để lock giữa các event
  const cheatReportSent = useRef(false);
  const ownedSubjects = useOwnedSubjects(account, contracts, isConnected);
  const navigate = useNavigate();
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isCheating, setIsCheating] = useState(false);
  const examContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [cheatCountGeneral, setCheatCountGeneral] = useState(0); // F12, copy, paste, ...
  const [cheatCountFullscreen, setCheatCountFullscreen] = useState(0); // Thoát fullscreen
  const cheatLockGeneralRef = useRef(false);
  const cheatLockFullscreenRef = useRef(false);
  const lastCheatReasonRef = useRef('');
  const cheatReasonsRef = useRef([]); // Mảng lưu các lý do vi phạm

  // Mock exam questions
  const examQuestions = [
    {
      id: 1,
      question: "Blockchain là gì?",
      type: "multiple_choice",
      options: [
        "A. Một loại tiền điện tử",
        "B. Một cơ sở dữ liệu phân tán",
        "C. Một loại ví điện tử",
        "D. Một loại hợp đồng thông minh"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Smart Contract được viết bằng ngôn ngữ nào?",
      type: "multiple_choice",
      options: [
        "A. JavaScript",
        "B. Python",
        "C. Solidity",
        "D. Java"
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "NFT là viết tắt của gì?",
      type: "text",
      correctAnswer: "Non-Fungible Token"
    }
  ];

  // Check which subject needs exam
  useEffect(() => {
    const checkSubjectToExam = async () => {
      if (!isConnected || !contracts.examRegistration || !account) {
        setSubjectToExam(null);
        setStudentInfo(null);
        return;
      }
      // Ưu tiên lấy subject đang thao tác từ localStorage
      const currentSubject = localStorage.getItem('currentExamSubject');
      if (currentSubject) {
        try {
          const info = await contracts.examRegistration.getStudentInfo(account, currentSubject);
          if (info && info.isRegistered && info.isVerified && !ownedSubjects.includes(currentSubject)) {
            setSubjectToExam(currentSubject);
            setStudentInfo(info);
            return;
          }
          if (info && info.isRegistered && info.isVerified && ownedSubjects.includes(currentSubject)) {
            // Nếu đã có NFT, xóa subject khỏi localStorage và về register
            localStorage.removeItem('currentExamSubject');
            navigate('/register');
            return;
          }
        } catch (err) {}
      }
      for (const subject of subjects) {
        try {
          const info = await contracts.examRegistration.getStudentInfo(account, subject);
          if (info && info.isRegistered && info.isVerified && !ownedSubjects.includes(subject)) {
            setSubjectToExam(subject);
            setStudentInfo(info);
            return;
          }
        } catch (err) {}
      }
      setSubjectToExam(null);
      setStudentInfo(null);
      navigate('/register');
    };
    checkSubjectToExam();
  }, [isConnected, contracts.examRegistration, account, ownedSubjects, navigate]);

  // Kiểm tra trạng thái gian lận on-chain khi mount và khi cheatCount thay đổi
  useEffect(() => {
    const checkCheater = async () => {
      if (contracts && contracts.examRegistration && account) {
        try {
          const cheater = await contracts.examRegistration.isStudentCheater(account);
          setIsCheater(cheater);
        } catch (err) {
          setIsCheater(false);
        }
      }
    };
    checkCheater();
  }, [account, contracts, cheatCount]);

  // Phát hiện hành vi bất thường (chỉ đếm và gọi markCheating 1 lần, không spam, không double count)
  useEffect(() => {
    if (isCheater || !examStarted) return; // chỉ theo dõi khi đang thi

    let cheatTriggered = false;

    // Đã loại bỏ handleCheat gửi log trực tiếp, chỉ tăng biến đếm và toast cảnh báo nếu cần

    // --- Các phương thức phát hiện gian lận bổ sung ---
    // 1. Copy/Paste/Cut
    const handleCopy = (e) => { e.preventDefault(); };
    const handlePaste = (e) => { e.preventDefault(); };
    const handleCut = (e) => { e.preventDefault(); };
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    // 2. Kéo thả/dán file
    const handleDrop = (e) => { e.preventDefault(); };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handlePasteFile = (e) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        // handleCheat('Dán file vào trang'); // Loại bỏ gọi handleCheat trực tiếp
      }
    };
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('paste', handlePasteFile);

    // 3. Phát hiện mở DevTools (dựa trên thay đổi chiều cao cửa sổ)
    let lastHeight = window.innerHeight;
    const checkDevTools = setInterval(() => {
      if (window.outerHeight - window.innerHeight > 120) {
        // handleCheat('Có thể đã mở DevTools'); // Loại bỏ gọi handleCheat trực tiếp
      }
      lastHeight = window.innerHeight;
    }, 1500);

    // 4. Resize cửa sổ nhỏ bất thường
    const handleResize = () => {
      if (window.innerWidth < 400 || window.innerHeight < 300) {
        // handleCheat('Resize cửa sổ nhỏ bất thường'); // Loại bỏ gọi handleCheat trực tiếp
      }
    };
    window.addEventListener('resize', handleResize);

    const onVisibility = () => { if (document.hidden) { /* handleCheat('Chuyển tab/rời cửa sổ'); */ } };
    const onBlur = () => { /* handleCheat('Rời cửa sổ'); */ };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('paste', handlePasteFile);
      clearInterval(checkDevTools);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [account, isCheater, examStarted]);

  // Check student info and verification status
  useEffect(() => {
    const checkStudentInfo = async () => {
      if (isConnected && contracts.examRegistration && account && studentInfo?.subject) {
        try {
          const isReg = await contracts.examRegistration.isStudentRegistered(account, studentInfo.subject);
          if (isReg) {
            const info = await contracts.examRegistration.getStudentInfo(account, studentInfo.subject);
            setStudentInfo(info);
            
            if (!info.isVerified) {
              toast.error('Bạn cần xác minh danh tính trước khi thi!');
            }
          }
        } catch (error) {
          console.error('Error checking student info:', error);
        }
      }
    };

    checkStudentInfo();
  }, [isConnected, contracts.examRegistration, account, studentInfo?.subject]);

  useEffect(() => {
    // Nếu đã đăng ký nhưng chưa xác minh thì tự động chuyển hướng sang /verify
    if (studentInfo && !studentInfo.isVerified) {
      toast.error('Bạn cần xác minh danh tính trước khi vào thi!');
      navigate('/verify');
    }
  }, [studentInfo, navigate]);

  // Start exam session
  const startExam = async () => {
    if (!isConnected) {
      toast.error('Vui lòng kết nối MetaMask trước!');
      return;
    }

    if (!studentInfo) {
      toast.error('Bạn chưa đăng ký thi!');
      return;
    }

    if (!studentInfo.isVerified) {
      toast.error('Bạn cần xác minh danh tính trước khi thi!');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Starting exam session...');
      console.log('📋 Student info:', studentInfo);
      
      // Tạo exam session local thay vì gọi API
      const sessionId = `exam_${Date.now()}_${account.slice(-6)}`;
      const examData = {
        sessionId,
        studentWallet: account,
        studentId: studentInfo.studentId,
        subject: studentInfo.subject,
        examSession: studentInfo.examSession,
        startTime: new Date().toISOString(),
        status: 'active'
      };

      setExamSession(examData);
      setExamStarted(true);
      setExamTime(120 * 60); // 2 hours in seconds
      
      console.log('✅ Exam session started locally');
      toast.success('Bắt đầu thi thành công!');
      
    } catch (error) {
      console.error('❌ Error starting exam:', error);
      toast.error('Lỗi bắt đầu thi: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // End exam session
  const endExam = async () => {
    if (!examSession) return;

    setIsLoading(true);

    try {
      console.log('🔄 Ending exam session...');
      console.log('�� Session ID:', examSession.sessionId);
      
      // Tính điểm dựa trên câu trả lời
      const score = calculateScore();
      console.log('📊 Exam score:', score);
      
      // Debug contracts
      console.log('contracts:', contracts);
      console.log('contracts.examRegistrationWrite:', contracts.examRegistrationWrite);
      
      // Gọi contract để hoàn thành thi
      if (contracts.examRegistrationWrite) {
        console.log('🔄 Calling completeExam contract function...');
        console.log('📋 Contract address:', contracts.examRegistrationWrite.target);
        console.log('📋 Student address:', account);
        
        // Kiểm tra xem function có tồn tại không
        if (
          contracts.examRegistrationWrite.interface &&
          contracts.examRegistrationWrite.interface.functions
        ) {
          console.log('📋 Available functions:', Object.keys(contracts.examRegistrationWrite.interface.functions));
          
          // Kiểm tra xem có function completeExam không
          const hasCompleteExam = contracts.examRegistrationWrite.interface.hasFunction('completeExam');
          console.log('📋 Has completeExam function:', hasCompleteExam);
          
          if (hasCompleteExam) {
            try {
              const tx = await contracts.examRegistrationWrite.completeExam(account, studentInfo.subject);
              console.log('📋 Transaction hash:', tx.hash);
              
              const receipt = await tx.wait();
              console.log('✅ Exam completed on blockchain! Block:', receipt.blockNumber);
              
              toast.success(`Hoàn thành thi thành công! Điểm: ${score}/${examQuestions.length}`);
            } catch (contractError) {
              console.error('❌ Contract error:', contractError);
              console.error('❌ Error code:', contractError.code);
              console.error('❌ Error message:', contractError.message);
              
              // Fallback: chỉ hoàn thành local
              console.log('⚠️ Contract call failed, completing locally only');
              toast.success(`Hoàn thành thi thành công! Điểm: ${score}/${examQuestions.length} (Local only)`);
            }
          } else {
            console.log('⚠️ completeExam function not found in contract, completing locally only');
            toast.success(`Hoàn thành thi thành công! Điểm: ${score}/${examQuestions.length} (Local only)`);
          }
        } else {
          console.log('❌ Contract interface or functions is undefined', contracts.examRegistrationWrite);
          toast.success(`Hoàn thành thi thành công! Điểm: ${score}/${examQuestions.length} (Local only)`);
        }
      } else {
        console.log('⚠️ Contract write not available, completing locally only');
        toast.success(`Hoàn thành thi thành công! Điểm: ${score}/${examQuestions.length}`);
      }
      
      // Cập nhật trạng thái local
      setExamStarted(false);
      setExamSession(null);
      setExamTime(0);
      
      // Mint NFT certificate nếu đạt điểm cao
      if (score >= examQuestions.length * 0.7) { // 70% trở lên
        await mintNFTCertificate(score);
      }
      // Thêm vào danh sách chờ mint NFT
      await addToPendingMint(score);
      // Sau khi hoàn thành thi và mint NFT, xóa subject khỏi localStorage
      localStorage.removeItem('currentExamSubject');
      
    } catch (error) {
      console.error('❌ Error ending exam:', error);
      toast.error('Lỗi kết thúc thi: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate exam score
  const calculateScore = () => {
    let correctAnswers = 0;
    
    console.log('📊 Calculating exam score...');
    console.log('📋 All answers:', answers);
    
    examQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      console.log(`📋 Question ${question.id}:`);
      console.log(`   User answer: ${userAnswer}`);
      console.log(`   Correct answer: ${question.correctAnswer}`);
      console.log(`   Question type: ${question.type}`);
      
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        if (question.type === 'multiple_choice') {
          const userAnswerInt = parseInt(userAnswer);
          const correctAnswerInt = parseInt(question.correctAnswer);
          console.log(`   Comparing: ${userAnswerInt} === ${correctAnswerInt}`);
          
          if (userAnswerInt === correctAnswerInt) {
            correctAnswers++;
            console.log(`   ✅ Correct!`);
          } else {
            console.log(`   ❌ Wrong!`);
          }
        } else if (question.type === 'text') {
          const userAnswerLower = userAnswer.toLowerCase();
          const correctAnswerLower = question.correctAnswer.toLowerCase();
          console.log(`   Comparing: "${userAnswerLower}" includes "${correctAnswerLower}"`);
          
          if (userAnswerLower.includes(correctAnswerLower)) {
            correctAnswers++;
            console.log(`   ✅ Correct!`);
          } else {
            console.log(`   ❌ Wrong!`);
          }
        }
      } else {
        console.log(`   ❌ No answer provided`);
      }
    });
    
    console.log(`📊 Final score: ${correctAnswers}/${examQuestions.length}`);
    return correctAnswers;
  };

  // Mint NFT certificate
  const mintNFTCertificate = async (score) => {
    try {
      console.log('🔄 Minting NFT certificate...');
      console.log('📊 Score:', score);
      console.log('📋 Student info:', {
        studentId: studentInfo.studentId,
        subject: studentInfo.subject,
        examSession: studentInfo.examSession,
        walletAddress: studentInfo.walletAddress
      });
      
      // Sử dụng contract write để mint NFT
      const contractToUse = examRegistrationWrite || contracts.examRegistration;
      
      if (!contractToUse) {
        throw new Error('Contract chưa được khởi tạo');
      }
      
      // Kiểm tra xem có phải owner không (vì chỉ owner mới có thể mint)
      const isOwner = await contracts.examRegistration.owner();
      const currentAccount = account.toLowerCase();
      const ownerAccount = isOwner.toLowerCase();
      
      console.log('📋 Current account:', currentAccount);
      console.log('📋 Owner account:', ownerAccount);
      console.log('📋 Is owner:', currentAccount === ownerAccount);
      
      if (currentAccount !== ownerAccount) {
        console.log('ℹ️  Not owner, showing success message without minting');
        toast.success('Hoàn thành thi thành công! NFT sẽ được mint bởi admin.');
        return;
      }
      
      // Nếu là owner, thử mint NFT
      if (examCertificateNFT && examCertificateNFT.mintCertificate) {
        console.log('📋 Contract has mintCertificate function');
        
        // Tạo token URI metadata
        const tokenURI = JSON.stringify({
          name: `Exam Certificate - ${studentInfo.studentId}`,
          description: `Certificate for ${studentInfo.subject} exam`,
          attributes: [
            {
              trait_type: "Student ID",
              value: studentInfo.studentId
            },
            {
              trait_type: "Subject",
              value: studentInfo.subject
            },
            {
              trait_type: "Exam Session",
              value: studentInfo.examSession
            },
            {
              trait_type: "Score",
              value: score.toString()
            },
            {
              trait_type: "Exam Date",
              value: new Date().toISOString()
            }
          ]
        });
        
        const tx = await examCertificateNFT.mintCertificate(
          account, // student wallet
          studentInfo.studentId,
          studentInfo.subject,
          studentInfo.examSession,
          '192.168.1.100', // Mock IP address
          tokenURI
        );
        
        console.log('📋 Transaction hash:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ NFT minted successfully! Block:', receipt.blockNumber);
        
        toast.success('NFT chứng nhận đã được mint thành công!');
      } else {
        console.log('ℹ️  Contract does not have mintCertificate function, showing success message');
        toast.success('Hoàn thành thi thành công!');
      }
      
    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      if (error.code === 'UNSUPPORTED_OPERATION') {
        toast.error('Lỗi kết nối MetaMask. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        toast.error('Lỗi mint NFT: ' + error.message);
      }
    }
  };

  // Thêm vào danh sách chờ mint NFT
  const addToPendingMint = async (score) => {
    try {
      console.log('🔄 Adding to pending mint list...');
      
      const response = await fetch('http://localhost:3001/api/nft/pending-mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentWallet: account,
          studentId: studentInfo.studentId,
          subject: studentInfo.subject,
          examSession: studentInfo.examSession,
          score: score,
          examDate: new Date().toISOString(),
          ipAddress: '192.168.1.100' // Mock IP
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Added to pending mint list');
        toast.success('Đã thêm vào danh sách chờ mint NFT!');
      } else {
        console.log('⚠️ Could not add to pending mint:', data.message);
      }
    } catch (error) {
      console.error('❌ Error adding to pending mint:', error);
      // Không hiển thị lỗi cho user vì đây không phải lỗi nghiêm trọng
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (examStarted && examTime > 0) {
      interval = setInterval(() => {
        setExamTime(prev => {
          if (prev <= 1) {
            // Auto submit when time runs out
            endExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStarted, examTime]);

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Hàm chuyển sang fullscreen khi bắt đầu thi
  const handleStartExam = () => {
    setIsExamStarted(true);
    // Zoom toàn màn hình
    if (examContainerRef.current && examContainerRef.current.requestFullscreen) {
      examContainerRef.current.requestFullscreen();
    } else if (examContainerRef.current && examContainerRef.current.webkitRequestFullscreen) {
      examContainerRef.current.webkitRequestFullscreen();
    } else if (examContainerRef.current && examContainerRef.current.mozRequestFullScreen) {
      examContainerRef.current.mozRequestFullScreen();
    } else if (examContainerRef.current && examContainerRef.current.msRequestFullscreen) {
      examContainerRef.current.msRequestFullscreen();
    }
  };

  // Chặn phím F11, ESC, F12, Ctrl+Shift+I, Ctrl+U khi đang fullscreen
  useEffect(() => {
    if (!isExamStarted) return;
    const handleKeyDown = (e) => {
      // F11, ESC, F12, Ctrl+Shift+I, Ctrl+U
      if (
        e.key === 'F11' ||
        e.key === 'Escape' ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleCheatGeneral('F11, ESC, F12, Ctrl+Shift+I, Ctrl+U là thao tác bị cấm');
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isExamStarted]);

  // Chặn copy, paste, cut, chuột phải, kéo thả file
  useEffect(() => {
    if (!isExamStarted) return;
    const blockEvent = (e) => {
      e.preventDefault();
      handleCheatGeneral('Copy (Ctrl+C), Paste (Ctrl+V), Cut (Ctrl+X), Chuột phải là thao tác bị cấm');
    };
    document.addEventListener('copy', blockEvent, true);
    document.addEventListener('paste', blockEvent, true);
    document.addEventListener('cut', blockEvent, true);
    document.addEventListener('contextmenu', blockEvent, true);
    document.addEventListener('drop', blockEvent, true);
    return () => {
      document.removeEventListener('copy', blockEvent, true);
      document.removeEventListener('paste', blockEvent, true);
      document.removeEventListener('cut', blockEvent, true);
      document.removeEventListener('contextmenu', blockEvent, true);
      document.removeEventListener('drop', blockEvent, true);
    };
  }, [isExamStarted]);

  // Chặn chuyển tab (blur/focus)
  useEffect(() => {
    if (!isExamStarted) return;
    const handleBlur = () => {
      handleCheatGeneral('Chuyển tab/rời cửa sổ là thao tác bị cấm');
    };
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [isExamStarted]);

  // Theo dõi sự kiện thoát fullscreen (chỉ cảnh báo 1 lần, hiển thị nút quay lại, không tăng cheatCount lần đầu)
  useEffect(() => {
    if (!isExamStarted) return;
    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!isFull);
      if (!isFull && !fullscreenWarned) {
        alert('Bạn vừa thoát khỏi chế độ toàn màn hình. Vui lòng không thực hiện thao tác này!');
        setFullscreenWarned(true);
      } else if (!isFull && fullscreenWarned) {
        // Nếu đã cảnh báo rồi mà vẫn tiếp tục, coi là gian lận
        handleCheatGeneral('Thoát fullscreen là thao tác bị cấm');
      } else if (isFull && fullscreenWarned) {
        // Khi user quay lại fullscreen, reset cảnh báo
        setFullscreenWarned(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isExamStarted, fullscreenWarned]);

  // Debounce tăng biến đếm cho các thao tác cấm
  const handleCheatGeneral = (reason) => {
    if (cheatLockGeneralRef.current) return;
    cheatLockGeneralRef.current = true;
    setTimeout(() => { cheatLockGeneralRef.current = false; }, 1000);
    cheatReasonsRef.current.push(reason);
    console.log('[DEBUG] Vi phạm:', reason);
    setCheatCountGeneral(c => c + 1);
  };
  // Debounce tăng biến đếm cho fullscreen
  const handleCheatFullscreen = () => {
    if (cheatLockFullscreenRef.current) return;
    cheatLockFullscreenRef.current = true;
    setTimeout(() => { cheatLockFullscreenRef.current = false; }, 1000);
    cheatReasonsRef.current.push('Thoát fullscreen');
    setCheatCountFullscreen(c => c + 1);
  };

  // Chặn phím, copy, paste, chuột phải, chuyển tab, kéo thả file (tăng cheatCountGeneral)
  useEffect(() => {
    if (!isExamStarted) return;
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault(); e.stopPropagation(); handleCheatGeneral('F12 (mở DevTools) là thao tác bị cấm');
      } else if (e.key === 'F11') {
        e.preventDefault(); e.stopPropagation(); handleCheatGeneral('F11 (fullscreen) là thao tác bị cấm');
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault(); e.stopPropagation(); handleCheatGeneral('Ctrl+Shift+I (mở DevTools) là thao tác bị cấm');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault(); e.stopPropagation(); handleCheatGeneral('Ctrl+U (xem mã nguồn) là thao tác bị cấm');
      } else if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
      }
    };
    const blockEvent = (e) => {
      e.preventDefault();
      handleCheatGeneral('Copy (Ctrl+C), Paste (Ctrl+V), Cut (Ctrl+X), Chuột phải, Kéo thả file là thao tác bị cấm');
    };
    const handleBlur = () => {
      handleCheatGeneral('Chuyển tab/rời cửa sổ là thao tác bị cấm');
    };
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('copy', blockEvent, true);
    document.addEventListener('paste', blockEvent, true);
    document.addEventListener('cut', blockEvent, true);
    document.addEventListener('contextmenu', blockEvent, true);
    document.addEventListener('drop', blockEvent, true);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', blockEvent, true);
      document.removeEventListener('paste', blockEvent, true);
      document.removeEventListener('cut', blockEvent, true);
      document.removeEventListener('contextmenu', blockEvent, true);
      document.removeEventListener('drop', blockEvent, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isExamStarted]);

  // Theo dõi sự kiện thoát fullscreen (tăng cheatCountFullscreen, toast cảnh báo tối đa 2 lần)
  useEffect(() => {
    if (!isExamStarted) return;
    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!isFull);
      if (!isFull) {
        handleCheatFullscreen();
      } else if (isFull && fullscreenWarned) {
        setFullscreenWarned(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isExamStarted, fullscreenWarned]);

  // Cảnh báo toast và gửi log cho cheatCountGeneral (3 lần, chỉ gửi log ở lần 3)
  useEffect(() => {
    console.log('[DEBUG] cheatCountGeneral:', cheatCountGeneral);
    if (cheatCountGeneral === 1 || cheatCountGeneral === 2) {
      const reason = cheatReasonsRef.current[cheatCountGeneral - 1] || '';
      toast.warn(
        `Cảnh báo: ${reason} (lần ${cheatCountGeneral}/3). Nếu tiếp tục, bài thi sẽ bị kết thúc!`,
        { autoClose: 4000 }
      );
    }
    if (cheatCountGeneral === 3) {
      const reason = cheatReasonsRef.current[cheatCountGeneral - 1] || '';
      axios.post('/api/exam/cheat-report', {
        studentWallet: account,
        reason: `Kết thúc bài thi do vi phạm nhiều lần: ${reason}`,
        timestamp: Date.now()
      });
      setIsCheating(true);
    }
  }, [cheatCountGeneral, account]);

  // Cảnh báo toast và gửi log cho cheatCountFullscreen (2 lần, chỉ gửi log ở lần 2)
  useEffect(() => {
    console.log('[DEBUG] cheatCountFullscreen:', cheatCountFullscreen);
    if (cheatCountFullscreen === 1) {
      toast.warn('Bạn vừa thoát khỏi chế độ toàn màn hình. Vui lòng quay lại fullscreen để tiếp tục làm bài. Nếu tiếp tục vi phạm, bài thi sẽ bị kết thúc!', { autoClose: 4000 });
    }
    if (cheatCountFullscreen === 2) {
      toast.warn('Bạn đã thoát fullscreen 2 lần. Bài thi sẽ bị kết thúc!', { autoClose: 4000 });
      axios.post('/api/exam/cheat-report', {
        studentWallet: account,
        reason: 'Kết thúc bài thi do thoát fullscreen nhiều lần',
        timestamp: Date.now()
      });
      setIsCheating(true);
    }
  }, [cheatCountFullscreen, account]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaGraduationCap className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kết nối ví để tham gia thi
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng kết nối MetaMask để có thể tham gia thi trực tuyến.
          </p>
        </div>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaGraduationCap className="text-yellow-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Chưa đăng ký thi
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng ký thi trước khi có thể tham gia.
          </p>
          <a
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Đăng ký thi ngay
          </a>
        </div>
      </div>
    );
  }

  if (!studentInfo.isVerified) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Chưa xác minh danh tính
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần xác minh danh tính trước khi có thể tham gia thi.
          </p>
          <a
            href="/verify"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
          >
            Xác minh danh tính
          </a>
        </div>
      </div>
    );
  }

  if (studentInfo && ownedSubjects.includes(studentInfo.subject)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bạn đã hoàn thành và nhận NFT cho môn học này!
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng ký môn học mới để tiếp tục thi. Nếu bạn muốn thi môn khác, hãy đăng ký môn mới trước.
          </p>
          <a
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Đăng ký môn mới
          </a>
        </div>
      </div>
    );
  }

  if (isCheater) {
    return (
      <div className="bg-red-100 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Tài khoản của bạn đã bị đánh dấu gian lận!</h2>
        <p className="text-red-600">Bạn đã có hành vi bất thường trong quá trình thi. Vui lòng liên hệ admin để được hỗ trợ.</p>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaGraduationCap className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sẵn sàng thi
            </h2>
            <p className="text-gray-600">
              Bạn đã được xác minh và sẵn sàng tham gia thi.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thi:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MSSV:</label>
                <p className="text-gray-900 font-medium">{studentInfo.studentId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Môn học:</label>
                <p className="text-gray-900 font-medium">{studentInfo.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ca thi:</label>
                <p className="text-gray-900 font-medium">{studentInfo.examSession}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thi:</label>
                <p className="text-gray-900 font-medium">120 phút</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startExam}
              disabled={isLoading}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Đang chuẩn bị...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaGraduationCap className="mr-2" />
                  Bắt đầu thi
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCheating) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-red-100 text-red-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Bài thi đã bị kết thúc!</h2>
          <p>Bạn đã thực hiện thao tác không hợp lệ hoặc có dấu hiệu gian lận. Bài thi của bạn đã bị đánh dấu gian lận và không thể tiếp tục.</p>
          <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">Về trang chủ</a>
        </div>
      </div>
    );
  }

  if (isExamStarted && !isFullscreen && !isCheating) {
    return (
      <div ref={examContainerRef} className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-yellow-100 text-yellow-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Bạn vừa thoát khỏi chế độ toàn màn hình</h2>
          <p>Vui lòng quay lại fullscreen để tiếp tục làm bài. Nếu tiếp tục vi phạm, bài thi sẽ bị kết thúc.</p>
          <button
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            onClick={() => {
              console.log('[DEBUG] examContainerRef.current:', examContainerRef.current);
              if (examContainerRef.current && examContainerRef.current.requestFullscreen) {
                examContainerRef.current.requestFullscreen();
              } else if (examContainerRef.current && examContainerRef.current.webkitRequestFullscreen) {
                examContainerRef.current.webkitRequestFullscreen();
              } else if (examContainerRef.current && examContainerRef.current.mozRequestFullScreen) {
                examContainerRef.current.mozRequestFullScreen();
              } else if (examContainerRef.current && examContainerRef.current.msRequestFullscreen) {
                examContainerRef.current.msRequestFullscreen();
              } else {
                toast.error('Không thể vào lại fullscreen. Vui lòng F5 hoặc thử lại trên trình duyệt khác!');
              }
            }}
          >
            Quay lại fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={examContainerRef} className="relative">
      <ToastContainer />
      {/* Ẩn navbar/options khi đang thi */}
      {!isExamStarted && (
        <div className="mb-6">
          {/* Render các options select như trang chủ, đăng ký,... ở đây nếu có */}
          {/* Ví dụ: <Navbar /> hoặc các nút chuyển trang */}
        </div>
      )}
      {/* Nút bắt đầu thi */}
      {!isExamStarted && (
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 mb-6"
          onClick={handleStartExam}
        >
          Bắt đầu thi
        </button>
      )}
      {/* Nội dung bài thi */}
      {isExamStarted && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Exam Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Thi: {studentInfo.subject}
                </h2>
                <p className="text-gray-600">
                  {studentInfo.examSession} - {studentInfo.studentId}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  <FaClock className="inline mr-2" />
                  {formatTime(examTime)}
                </div>
                <p className="text-sm text-gray-500">Thời gian còn lại</p>
              </div>
            </div>

            {/* Exam Content */}
            {!showExam ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEye className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Xem đề thi
                </h3>
                <p className="text-gray-600 mb-6">
                  Nhấn nút bên dưới để xem đề thi và bắt đầu làm bài.
                </p>
                <button
                  onClick={() => setShowExam(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaEye className="mr-2" />
                  Xem đề thi
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {examQuestions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Câu {index + 1}: {question.question}
                    </h3>
                    {question.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={optionIndex}
                              onChange={() => handleAnswerChange(question.id, optionIndex)}
                              checked={answers[question.id] === optionIndex}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        value={answers[question.id] || ''}
                        placeholder="Nhập câu trả lời của bạn..."
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-between pt-6 border-t">
                  <button
                    onClick={() => setShowExam(false)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                  >
                    <FaEyeSlash className="mr-2" />
                    Ẩn đề thi
                  </button>
                  <button
                    onClick={endExam}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      isLoading
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Đang nộp bài...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FaCheckCircle className="mr-2" />
                        Nộp bài
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam; 