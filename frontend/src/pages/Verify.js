import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaCamera, FaShieldAlt, FaUser, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { formatBlockchainTimestamp } from '../utils/bigIntUtils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const Verify = () => {
  const { isConnected, account, contracts, examRegistrationWrite } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [subjectToVerify, setSubjectToVerify] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [ipAddress, setIpAddress] = useState('');
  const [imageHash, setImageHash] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const ownedSubjects = useOwnedSubjects(account, contracts, isConnected);

  // Get IP address
  useEffect(() => {
    const getIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        setIpAddress('Unknown');
      }
    };
    getIpAddress();
  }, []);

  // Check which subject needs verify
  useEffect(() => {
    const checkSubjectToVerify = async () => {
      if (!isConnected || !contracts.examRegistration || !account) {
        setSubjectToVerify(null);
        setStudentInfo(null);
        setIsVerified(false);
        return;
      }
      // Ưu tiên lấy subject đang thao tác từ localStorage
      const currentSubject = localStorage.getItem('currentExamSubject');
      if (currentSubject) {
        try {
          const info = await contracts.examRegistration.getStudentInfo(account, currentSubject);
          if (info && info.isRegistered && !info.isVerified && !ownedSubjects.includes(currentSubject)) {
            setSubjectToVerify(currentSubject);
            setStudentInfo(info);
            setIsVerified(false);
            return;
          }
          if (info && info.isRegistered && info.isVerified && !ownedSubjects.includes(currentSubject)) {
            // Nếu đã xác minh rồi, chuyển sang exam luôn
            navigate('/exam');
            return;
          }
        } catch (err) {}
      }
      for (const subject of subjects) {
        try {
          const info = await contracts.examRegistration.getStudentInfo(account, subject);
          if (info && info.isRegistered && !info.isVerified && !ownedSubjects.includes(subject)) {
            setSubjectToVerify(subject);
            setStudentInfo(info);
            setIsVerified(false);
            return;
        }
        } catch (err) {}
      }
      setSubjectToVerify(null);
      setStudentInfo(null);
      setIsVerified(false);
      navigate('/register');
    };
    checkSubjectToVerify();
  }, [isConnected, contracts.examRegistration, account, ownedSubjects, navigate]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);

      // Generate simple hash for demo (in real app, use proper hashing)
      const hash = btoa(imageDataUrl).slice(0, 32);
      setImageHash(hash);

      stopCamera();
    }
  };

  // Handle verification
  const handleVerification = async () => {
    if (!isConnected) {
      toast.error('Vui lòng kết nối MetaMask trước!');
      return;
    }

    console.log('[DEBUG] account:', account);
    console.log('[DEBUG] studentInfo:', studentInfo);
    console.log('[DEBUG] isRegistered:', studentInfo?.isRegistered);

    if (!studentInfo) {
      toast.error('Bạn chưa đăng ký thi! Vui lòng đăng ký trước.');
      return;
    }

    if (!studentInfo.isRegistered) {
      toast.error('Bạn chưa đăng ký thi trên blockchain!');
      return;
    }

    if (isVerified) {
      toast.info('Bạn đã được xác minh rồi!');
      return;
    }

    if (!capturedImage) {
      toast.error('Vui lòng chụp ảnh xác minh trước!');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Gửi ảnh và ví lên backend để xác minh AI
      const formData = new FormData();
      formData.append('walletAddress', account);
      const blob = await (await fetch(capturedImage)).blob();
      formData.append('face', blob, 'face.jpg');
      console.log('[DEBUG] Gửi ảnh xác minh lên backend:', account, blob);
      const res = await axios.post('/api/student/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('[DEBUG] Kết quả backend:', res.data);

      if (res.data.verified) {
        // 2. Nếu match, gọi contract verifyIdentity bằng MetaMask (ví sinh viên)
      const contractToUse = examRegistrationWrite || contracts.examRegistration;
        if (!contractToUse) throw new Error('Contract chưa được khởi tạo');
        const ip = ipAddress || 'Unknown';
        const imageData = await blob.arrayBuffer();
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', imageData);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        console.log('[DEBUG] Gọi contract verifyIdentity với:', ip, hashHex);
        const tx = await contractToUse.verifyIdentity(subjectToVerify, ip, hashHex);
        console.log('[DEBUG] Transaction:', tx);
        await tx.wait();
        setIsVerified(true);
        toast.success('Xác minh danh tính thành công! Đang chuyển sang trang thi...');
        // Giữ lại currentExamSubject cho Exam.js
        setTimeout(() => navigate('/exam'), 2000);
      } else {
        console.log('[DEBUG] Xác minh thất bại:', res.data.reason);
        toast.error('Xác minh thất bại: ' + (res.data.reason || 'Không đúng khuôn mặt hoặc không đủ quyền!'));
      }
    } catch (error) {
      console.error('[DEBUG] Lỗi xác minh:', error);
      toast.error('Lỗi xác minh danh tính: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kết nối ví để xác minh danh tính
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng kết nối MetaMask để có thể xác minh danh tính.
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
            <FaUser className="text-yellow-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Chưa đăng ký thi
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng ký thi trước khi có thể xác minh danh tính.
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
            Vui lòng đăng ký môn học mới để xác minh tiếp. Nếu bạn muốn xác minh cho môn khác, hãy đăng ký môn mới trước.
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

  if (isVerified) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đã xác minh danh tính thành công!
            </h2>
            <p className="text-gray-600">
              Bạn có thể tham gia thi trực tuyến.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xác minh:</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian xác minh:</label>
                <p className="text-gray-900 font-medium">
                  {formatBlockchainTimestamp(studentInfo.verificationTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/exam"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 inline-flex items-center"
            >
              <FaShieldAlt className="mr-2" />
              Vào thi ngay
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Xác minh danh tính
          </h2>
          <p className="text-gray-600">
            Chụp ảnh để xác minh danh tính trước khi tham gia thi.
          </p>
        </div>

        {/* Student Info */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sinh viên:</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address:</label>
              <p className="text-gray-900 font-medium">{ipAddress}</p>
            </div>
          </div>
        </div>

        {/* Camera Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chụp ảnh xác minh:</h3>
          
          {!capturedImage ? (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto border-2 border-gray-300 rounded-lg"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaCamera className="mr-2" />
                  Bật camera
                </button>
                <button
                  onClick={captureImage}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <FaCamera className="mr-2" />
                  Chụp ảnh
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={capturedImage}
                  alt="Captured verification"
                  className="w-full max-w-md mx-auto border-2 border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setImageHash('');
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <FaTimesCircle className="mr-2" />
                  Chụp lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verification Button */}
        <div className="text-center">
          <button
            onClick={handleVerification}
            disabled={isLoading || !capturedImage}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors duration-200 ${
              isLoading || !capturedImage
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Đang xác minh...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaShieldAlt className="mr-2" />
                Xác minh danh tính
              </span>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            * Ảnh xác minh sẽ được mã hóa và lưu trữ trên blockchain để đảm bảo tính minh bạch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify; 