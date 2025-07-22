import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

const Exam = () => {
  const { isConnected, account, contracts, examRegistrationWrite, examCertificateNFT } = useWeb3();
  const [examSession, setExamSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examTime, setExamTime] = useState(0);
  const [showExam, setShowExam] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [answers, setAnswers] = useState({});
  const [cheatCount, setCheatCount] = useState(0);
  const [isCheater, setIsCheater] = useState(false);
  const CHEAT_LIMIT = 3; // Số lần tối đa trước khi đánh dấu gian lận
  const cheatEventLock = useRef(false); // Dùng useRef để lock giữa các event
  const cheatReportSent = useRef(false);

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

    const handleCheat = (reason) => {
      if (cheatEventLock.current) return; // Nếu đang lock, bỏ qua
      cheatEventLock.current = true;
      setTimeout(() => { cheatEventLock.current = false; }, 1000); // Mở khóa sau 1 giây

      setCheatCount(prev => {
        const next = prev + 1;
        if (next <= CHEAT_LIMIT) {
          toast.warn(`Cảnh báo: Hành vi bất thường (${reason}). Lần ${next}/${CHEAT_LIMIT}`);
        }
        // Chỉ gửi request đúng 1 lần khi vừa đủ ngưỡng
        if (next === CHEAT_LIMIT && !cheatReportSent.current) {
          cheatReportSent.current = true;
          fetch('/api/exam/cheat-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentWallet: account,
              reason,
              timestamp: new Date().toISOString(),
            })
          });
        }
        return next > CHEAT_LIMIT ? CHEAT_LIMIT : next;
      });
    };

    const onVisibility = () => { if (document.hidden) handleCheat('Chuyển tab/rời cửa sổ'); };
    const onBlur = () => handleCheat('Rời cửa sổ');
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [account, isCheater, examStarted]);

  // Check student info and verification status
  useEffect(() => {
    const checkStudentInfo = async () => {
      if (isConnected && contracts.examRegistration && account) {
        try {
          const isReg = await contracts.examRegistration.isStudentRegistered(account);
          if (isReg) {
            const info = await contracts.examRegistration.getStudentInfo(account);
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
  }, [isConnected, contracts.examRegistration, account]);

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
      console.log('📋 Session ID:', examSession.sessionId);
      
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
              const tx = await contracts.examRegistrationWrite.completeExam(account);
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

  return (
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
  );
};

export default Exam; 