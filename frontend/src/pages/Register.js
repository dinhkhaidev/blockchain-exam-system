import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaUser, FaBook, FaClock, FaWallet, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatBlockchainTimestamp } from '../utils/bigIntUtils';
import ProgressIndicator from '../components/ProgressIndicator';
import RoleNotification from '../components/RoleNotification';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { isConnected, account, contracts, connectWallet, isStudentWhitelisted, userType, examRegistrationWrite } = useWeb3();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    examSession: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState(null);
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(true);
  const [ownedSubjects, setOwnedSubjects] = useState([]);
  const [pendingSubject, setPendingSubject] = useState(null);

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

  const examSessions = [
    'Ca 1 (8:00 - 10:00)',
    'Ca 2 (10:30 - 12:30)',
    'Ca 3 (14:00 - 16:00)',
    'Ca 4 (16:30 - 18:30)'
  ];

  // Check whitelist status
  useEffect(() => {
    setWhitelistStatus(null);
    setIsCheckingWhitelist(true);
    if (!isConnected || !account) return;
    const checkWhitelistStatus = async () => {
      setIsCheckingWhitelist(true);
        try {
          const whitelisted = await isStudentWhitelisted(account);
          setWhitelistStatus(whitelisted);
        console.log('[DEBUG] Whitelist status:', whitelisted, 'Account:', account);
        } catch (error) {
          setWhitelistStatus(false);
        console.log('[DEBUG] Whitelist error:', error);
      }
      setIsCheckingWhitelist(false);
    };
    checkWhitelistStatus();
  }, [isConnected, account, userType, isStudentWhitelisted]);

  // Lấy danh sách các môn đã có NFT
  useEffect(() => {
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
          setOwnedSubjects(Array.from(subjectsSet));
        } catch (err) {
          setOwnedSubjects([]);
        }
      }
    };
    fetchOwnedSubjects();
  }, [isConnected, contracts.examCertificateNFT, account]);

  // Tự động lấy MSSV từ backend hoặc contract khi user đăng nhập ví hoặc chọn môn mới
  useEffect(() => {
    async function fetchStudentId() {
      if (isConnected && account) {
        // Ưu tiên lấy từ backend
        try {
          const res = await axios.get(`/api/student/id-nft?walletAddress=${account}`);
          if (res.data && res.data.studentId) {
            setFormData(prev => ({ ...prev, studentId: res.data.studentId }));
            localStorage.setItem('studentId', res.data.studentId);
            return;
          }
        } catch (err) {}
        // Nếu không lấy được từ backend, thử lấy từ contract (nếu có hàm)
        if (contracts && contracts.examRegistration && contracts.examRegistration.getStudentIdByWallet) {
          try {
            const studentId = await contracts.examRegistration.getStudentIdByWallet(account);
            if (studentId && studentId !== '') {
              setFormData(prev => ({ ...prev, studentId }));
              localStorage.setItem('studentId', studentId);
              return;
            }
          } catch (e) {}
        }
        // Nếu không lấy được, thử lấy từ localStorage
        const studentId = localStorage.getItem('studentId');
        if (studentId && studentId !== '') {
          setFormData(prev => ({ ...prev, studentId }));
        }
      }
    }
    fetchStudentId();
  }, [isConnected, account, contracts.examRegistration, formData.subject]);

  // Kiểm tra trạng thái đăng ký/xác minh/thi dựa trên blockchain
  useEffect(() => {
    const checkPendingSubject = async () => {
      if (!isConnected || !contracts.examRegistration || !account) {
        setPendingSubject(null);
        setIsRegistered(false);
        setStudentInfo(null);
        return;
      }
      for (const subject of subjects) {
        try {
          const info = await contracts.examRegistration.getStudentInfo(account, subject);
          if (info && info.isRegistered && !ownedSubjects.includes(subject)) {
            setPendingSubject(subject);
            setStudentInfo(info);
            setIsRegistered(true);
            return;
          }
        } catch (err) {}
      }
      // Nếu không có môn nào đang chờ, cho phép đăng ký mới
      setPendingSubject(null);
      setIsRegistered(false);
      setStudentInfo(null);
    };
    checkPendingSubject();
  }, [isConnected, contracts.examRegistration, account, ownedSubjects]);

  // Nếu user đổi subject khi đang có pendingSubject, reset pendingSubject
  useEffect(() => {
    if (pendingSubject && formData.subject && formData.subject !== pendingSubject) {
      setPendingSubject(null);
      setIsRegistered(false);
      setStudentInfo(null);
    }
  }, [formData.subject, pendingSubject]);

  // Khi user nhập MSSV thủ công, luôn lưu vào localStorage
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'studentId') {
      localStorage.setItem('studentId', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Vui lòng kết nối MetaMask trước!');
      return;
    }
    if (userType === 'owner') {
      toast.error('Admin không thể đăng ký thi! Vui lòng sử dụng tài khoản sinh viên.');
      return;
    }
    if (whitelistStatus === false) {
      toast.error('Địa chỉ ví của bạn chưa được thêm vào whitelist. Vui lòng liên hệ admin!');
      return;
    }
    if (!formData.studentId || !formData.subject || !formData.examSession) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    // Debug: kiểm tra các subject đã đăng ký và studentId tương ứng
    console.log('[DEBUG] Kiểm tra các môn đã đăng ký của account:', account);
    for (const subject of subjects) {
      try {
        const info = await contracts.examRegistration.getStudentInfo(account, subject);
        if (info && info.isRegistered) {
          console.log(`[DEBUG] Đã đăng ký: ${subject} | studentId: ${info.studentId}`);
        }
      } catch (err) {}
    }
    // Nếu contract có hàm getStudentIdByAddress hoặc getAllStudentIds, có thể kiểm tra toàn bộ studentId ở đây
    // Nếu có API backend kiểm tra trùng studentId, nên gọi trước
    // Kiểm tra trạng thái đăng ký cho subject này
    try {
      const info = await contracts.examRegistration.getStudentInfo(account, formData.subject);
      if (info && info.isRegistered) {
        toast.error('Bạn đã đăng ký môn này, không thể đăng ký lại!');
        return;
      }
    } catch (err) {}
    if (ownedSubjects.includes(formData.subject)) {
      toast.error('Bạn đã nhận NFT cho môn này, không thể đăng ký lại!');
      return;
    }
    // Log debug
    console.log('[DEBUG] Đăng ký thi:', {
      account,
      studentId: formData.studentId,
      subject: formData.subject,
      examSession: formData.examSession
    });
    setIsLoading(true);
    try {
      const contractToUse = examRegistrationWrite || contracts.examRegistration;
      if (!contractToUse) throw new Error('Contract chưa được khởi tạo');
      const tx = await contractToUse.registerForExam(
        formData.studentId,
        formData.subject,
        formData.examSession
      );
      toast.info('Đang xử lý giao dịch...');
      await tx.wait();
      toast.success('Đăng ký thi thành công!');
      // Lưu subject đang thao tác vào localStorage để đồng bộ flow
      localStorage.setItem('currentExamSubject', formData.subject);
      navigate('/verify');
    } catch (error) {
      if (error.code === 4001) {
        toast.error('Giao dịch bị hủy bởi người dùng');
      } else if (error.code === 'UNSUPPORTED_OPERATION') {
        toast.error('Lỗi kết nối MetaMask. Vui lòng kiểm tra kết nối và thử lại.');
      } else if (error.message.includes('Already registered')) {
        toast.error('Bạn đã đăng ký thi rồi!');
      } else if (error.message.includes('Student ID already registered')) {
        toast.error('MSSV này đã được đăng ký bởi ví khác!');
        console.warn('[DEBUG] MSSV đã bị trùng với ví khác!');
      } else {
        toast.error('Lỗi đăng ký thi: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine current step
  const getCurrentStep = () => {
    if (!isConnected) return 1;
    if (pendingSubject) return 3; // Đang chờ xác minh/thi
    return 2; // Đăng ký mới
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator currentStep={1} userType="student" />
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaWallet className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kết nối ví để đăng ký thi
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng kết nối MetaMask để có thể đăng ký thi trực tuyến.
          </p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Kết nối MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (userType === 'owner') {
    return (
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator currentStep={1} userType="owner" />
        <RoleNotification account={account} />
      </div>
    );
  }

  // Nếu đang có môn chờ xác minh/thi (pendingSubject)
  if (pendingSubject && studentInfo) {
    return (
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator currentStep={3} userType="student" />
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đã đăng ký thi thành công cho môn: {pendingSubject}
            </h2>
            <p className="text-gray-600">
              Thông tin đăng ký của bạn đã được lưu trên blockchain.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đăng ký:</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ ví:</label>
                <p className="text-gray-900 font-medium text-sm">{studentInfo.walletAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đăng ký:</label>
                <p className="text-gray-900 font-medium">
                  {formatBlockchainTimestamp(studentInfo.registrationTime)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái xác minh:</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  studentInfo.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {studentInfo.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/verify"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center"
            >
              <FaUser className="mr-2" />
              Tiến hành xác minh danh tính
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đã có NFT cho tất cả các môn đã đăng ký, cho phép đăng ký môn mới
  return (
    <div className="max-w-4xl mx-auto">
      <ProgressIndicator currentStep={getCurrentStep()} userType="student" />
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaGraduationCap className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng ký thi trực tuyến
          </h2>
          <p className="text-gray-600">
            Nhập thông tin để đăng ký tham gia kỳ thi trực tuyến.
          </p>
        </div>
        {/* Whitelist Status */}
        {whitelistStatus !== null && (
          <div className={`rounded-lg p-4 mb-6 ${
            whitelistStatus 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {whitelistStatus ? (
                <FaCheckCircle className="text-green-600 mr-2" />
              ) : (
                <FaTimesCircle className="text-red-600 mr-2" />
              )}
              <span className={`font-medium ${
                whitelistStatus ? 'text-green-800' : 'text-red-800'
              }`}>
                {whitelistStatus 
                  ? 'Địa chỉ ví của bạn đã được thêm vào whitelist' 
                  : 'Địa chỉ ví của bạn chưa được thêm vào whitelist. Vui lòng liên hệ admin!'
                }
              </span>
              {isCheckingWhitelist && (
                <span className="ml-4 text-blue-600 text-sm">Đang kiểm tra whitelist...</span>
              )}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Debug log */}
          <div className="text-xs text-gray-400 mb-2">
            [DEBUG] isConnected: {String(isConnected)} | account: {account} | userType: {userType} | whitelistStatus: {String(whitelistStatus)} | isCheckingWhitelist: {String(isCheckingWhitelist)}
          </div>
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              MSSV <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập MSSV của bạn"
              required
              readOnly={!!formData.studentId}
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Môn học <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Chọn môn học</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject} disabled={ownedSubjects.includes(subject)}>
                  {subject} {ownedSubjects.includes(subject) ? '(Đã nhận NFT)' : ''}
                </option>
              ))}
            </select>
            {formData.subject && ownedSubjects.includes(formData.subject) && (
              <div className="text-red-600 text-sm mt-1">Bạn đã nhận NFT cho môn này, không thể đăng ký lại.</div>
            )}
          </div>
          <div>
            <label htmlFor="examSession" className="block text-sm font-medium text-gray-700 mb-2">
              Ca thi <span className="text-red-500">*</span>
            </label>
            <select
              id="examSession"
              name="examSession"
              value={formData.examSession}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Chọn ca thi</option>
              {examSessions.map((session, index) => (
                <option key={index} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Thông tin ví:</h3>
            <p className="text-sm text-blue-700">
              Địa chỉ ví: <span className="font-mono">{account}</span>
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || whitelistStatus === false || isCheckingWhitelist}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-200 ${
              isLoading || whitelistStatus === false || isCheckingWhitelist
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaGraduationCap className="mr-2" />
                Đăng ký thi
              </span>
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            * Thông tin sẽ được lưu trữ trên blockchain và không thể thay đổi sau khi đăng ký.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 