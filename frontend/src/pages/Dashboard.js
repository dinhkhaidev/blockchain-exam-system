import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { FaGraduationCap, FaShieldAlt, FaImages, FaClock, FaUser, FaCrown, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatBlockchainTimestamp } from '../utils/bigIntUtils';
import ProgressIndicator from '../components/ProgressIndicator';

const Dashboard = () => {
  const { isConnected, account, userType, isOwner, contracts } = useWeb3();
  const [studentInfo, setStudentInfo] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check student info and status
  useEffect(() => {
    const checkStudentInfo = async () => {
      if (isConnected && contracts.examRegistration && account && studentInfo?.subject) {
        try {
          const isReg = await contracts.examRegistration.isStudentRegistered(account, studentInfo.subject);
          setIsRegistered(isReg);
          
          if (isReg) {
            const info = await contracts.examRegistration.getStudentInfo(account, studentInfo.subject);
            setStudentInfo(info);
          }
        } catch (error) {
          console.error('Error checking student info:', error);
        }
      }
      setIsLoading(false);
    };

    checkStudentInfo();
  }, [isConnected, contracts.examRegistration, account, studentInfo?.subject]);

  // Check whitelist status for students
  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (isConnected && account && userType === 'student') {
        try {
          const whitelisted = await contracts.examRegistration.isStudentWhitelisted(account);
          setWhitelistStatus(whitelisted);
        } catch (error) {
          console.error('Error checking whitelist status:', error);
          setWhitelistStatus(false);
        }
      }
    };

    checkWhitelistStatus();
  }, [isConnected, account, userType, contracts.examRegistration]);

  const getCurrentStep = () => {
    if (!isConnected) return 1;
    
    if (userType === 'owner' || isOwner) {
      return 2; // Owner at whitelist management step
    }
    
    if (isRegistered) {
      return studentInfo?.isVerified ? 4 : 3; // Verified or verification step
    }
    
    return 2; // Registration step
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kết nối ví để xem Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng kết nối MetaMask để có thể xem thông tin Dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={getCurrentStep()} userType={userType || (isOwner ? 'owner' : 'student')} />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              {userType === 'owner' || isOwner 
                ? 'Quản lý hệ thống xác thực thi cử' 
                : 'Thông tin cá nhân và tiến trình thi'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userType === 'owner' || isOwner 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {userType === 'owner' || isOwner ? <FaCrown className="mr-1" /> : <FaUser className="mr-1" />}
              {userType === 'owner' || isOwner ? 'Admin' : 'Sinh viên'}
            </span>
            <div className="text-sm text-gray-500">
              {account?.slice(0, 10)}...{account?.slice(-4)}
            </div>
          </div>
        </div>
      </div>

      {/* Content based on user type */}
      {(userType === 'owner' || isOwner) ? (
        <OwnerDashboard />
      ) : (
        <StudentDashboard 
          studentInfo={studentInfo}
          isRegistered={isRegistered}
          whitelistStatus={whitelistStatus}
        />
      )}
    </div>
  );
};

// Owner Dashboard Component
const OwnerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
          >
            <FaCrown className="text-purple-600 text-xl mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Admin Dashboard</h3>
              <p className="text-sm text-gray-600">Quản lý hệ thống</p>
            </div>
          </a>
          <a
            href="/admin?tab=whitelist"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <FaUser className="text-blue-600 text-xl mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Quản lý Whitelist</h3>
              <p className="text-sm text-gray-600">Thêm/xóa sinh viên</p>
            </div>
          </a>
          <a
            href="/admin?tab=students"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
          >
            <FaGraduationCap className="text-green-600 text-xl mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Danh sách sinh viên</h3>
              <p className="text-sm text-gray-600">Xem đăng ký thi</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaShieldAlt className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã xác minh</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaGraduationCap className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kỳ thi</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100">
              <FaImages className="text-pink-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NFT</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Student Dashboard Component
const StudentDashboard = ({ studentInfo, isRegistered, whitelistStatus }) => {
  const [isCheater, setIsCheater] = useState(false);
  const { contracts, account } = useWeb3();

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
  }, [contracts, account]);

  return (
    <div className="space-y-6">
      {/* Cảnh báo gian lận */}
      {isCheater && (
        <div className="bg-red-100 border border-red-400 text-red-800 rounded-lg p-4 text-center font-semibold text-lg">
          <FaTimesCircle className="inline mr-2 text-2xl align-middle" />
          Tài khoản của bạn đã bị đánh dấu <b>gian lận</b>! Bạn sẽ bị cấm thi và không thể nhận chứng nhận.
        </div>
      )}
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trạng thái</p>
              <p className="text-lg font-semibold text-gray-900">
                {isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaShieldAlt className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Xác minh</p>
              <p className="text-lg font-semibold text-gray-900">
                {studentInfo?.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaGraduationCap className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Thi</p>
              <p className={`text-lg font-semibold ${isCheater ? 'text-red-600' : 'text-gray-900'}`}> 
                {isCheater
                  ? 'Bị cấm thi do gian lận'
                  : (studentInfo?.isVerified ? 'Có thể thi' : 'Chưa thể thi')
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100">
              <FaImages className="text-pink-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NFT</p>
              <p className="text-lg font-semibold text-gray-900">Chưa có</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Information */}
      {isRegistered && studentInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đăng ký</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đăng ký:</label>
              <p className="text-gray-900 font-medium">
                {formatBlockchainTimestamp(studentInfo.registrationTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Whitelist Status */}
      {whitelistStatus !== null && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trạng thái Whitelist</h2>
          <div className={`flex items-center p-4 rounded-lg ${
            whitelistStatus 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {whitelistStatus ? (
              <FaCheckCircle className="text-green-600 mr-3 text-xl" />
            ) : (
              <FaTimesCircle className="text-red-600 mr-3 text-xl" />
            )}
            <div>
              <p className={`font-medium ${
                whitelistStatus ? 'text-green-800' : 'text-red-800'
              }`}>
                {whitelistStatus 
                  ? 'Địa chỉ ví của bạn đã được thêm vào whitelist' 
                  : 'Địa chỉ ví của bạn chưa được thêm vào whitelist'
                }
              </p>
              <p className={`text-sm mt-1 ${
                whitelistStatus ? 'text-green-600' : 'text-red-600'
              }`}>
                {whitelistStatus 
                  ? 'Bạn có thể đăng ký thi' 
                  : 'Vui lòng liên hệ admin để được thêm vào whitelist'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isRegistered && (
            <a
              href="/register"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <FaGraduationCap className="text-blue-600 text-xl mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Đăng ký thi</h3>
                <p className="text-sm text-gray-600">Đăng ký tham gia thi</p>
              </div>
            </a>
          )}
          
          {isRegistered && !studentInfo?.isVerified && (
            <a
              href="/verify"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
            >
              <FaShieldAlt className="text-green-600 text-xl mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Xác minh danh tính</h3>
                <p className="text-sm text-gray-600">Chụp ảnh xác minh</p>
              </div>
            </a>
          )}
          
          {studentInfo?.isVerified && (
            <a
              href="/exam"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              <FaGraduationCap className="text-purple-600 text-xl mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Tham gia thi</h3>
                <p className="text-sm text-gray-600">Bắt đầu làm bài thi</p>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 