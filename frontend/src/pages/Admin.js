import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { FaUsers, FaShieldAlt, FaGraduationCap, FaImages, FaSearch, FaDownload, FaEye, FaUserCheck, FaCrown, FaCoins } from 'react-icons/fa';
import { formatBlockchainTimestamp } from '../utils/bigIntUtils';
import WhitelistManager from '../components/WhitelistManager';
import OwnerManagement from '../components/OwnerManagement';
import NFTMintingManager from '../components/NFTMintingManager';
import OwnerLogin from '../components/OwnerLogin';
import OwnerSetup from '../components/OwnerSetup';
import AccessDenied from '../components/AccessDenied';
import ProgressIndicator from '../components/ProgressIndicator';
import DebugAdmin from '../components/DebugAdmin';
import WhitelistTest from '../components/WhitelistTest';
import ContractDebug from '../components/ContractDebug';

const Admin = () => {
  const { isConnected, account, userType, isOwner, contracts, forceRefreshOwnerStatus } = useWeb3();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVerified: 0,
    totalExams: 0,
    totalNFTs: 0
  });
  const [students, setStudents] = useState([]);
  const [verificationLogs, setVerificationLogs] = useState([]);
  const [examSessions, setExamSessions] = useState([]);
  const [nftCertificates, setNftCertificates] = useState([]);
  const [whitelistData, setWhitelistData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        if (!contracts || !contracts.examRegistration || !contracts.examCertificateNFT) {
          setIsLoading(false);
          return;
        }
        // Lấy tổng số whitelist
        const totalStudents = Number(await contracts.examRegistration.whitelistCount());
        // Lấy danh sách whitelist
        const whitelistedAddresses = await contracts.examRegistration.getWhitelistedAddresses();
        let totalVerified = 0;
        let totalExams = 0;
        const studentData = [];
        const verificationLogsData = [];
        const examSessionsData = [];
        for (const addr of whitelistedAddresses) {
          try {
            const info = await contracts.examRegistration.getStudentInfo(addr);
            const isVerified = info.isVerified;
            const isRegistered = info.isRegistered;
            // Lấy trạng thái gian lận
            let isCheater = false;
            try {
              isCheater = await contracts.examRegistration.isStudentCheater(addr);
            } catch (e) {}
            if (isVerified) totalVerified++;
            if (isRegistered) totalExams++;
            studentData.push({
              studentId: info.studentId,
              walletAddress: addr,
              subject: info.subject,
              isVerified: info.isVerified,
              registrationTime: info.registrationTime ? Number(info.registrationTime) * 1000 : null,
              isCheater // thêm trạng thái gian lận
            });
            // Lấy log xác minh nếu có
            try {
              const logs = await contracts.examRegistration.getVerificationLogs(addr);
              logs.forEach(log => {
                verificationLogsData.push({
                  studentId: log.studentId,
                  ipAddress: log.ipAddress,
                  timestamp: log.timestamp ? Number(log.timestamp) * 1000 : null,
                  success: log.success
                });
              });
            } catch (e) {}
            // Lấy session thi nếu đã đăng ký
            if (isRegistered) {
              examSessionsData.push({
                studentId: info.studentId,
                subject: info.subject,
                startTime: info.registrationTime ? Number(info.registrationTime) * 1000 : null,
                status: isVerified ? 'active' : 'pending'
              });
            }
          } catch (e) {}
        }
        // Lấy tổng số NFT đã mint
        const totalNFTs = Number(await contracts.examCertificateNFT.getTotalCertificates());
        // Lấy danh sách NFT đã mint
        const nftList = [];
        for (let i = 1; i <= totalNFTs; i++) {
          try {
            const info = await contracts.examCertificateNFT.getExamInfo(i);
            nftList.push({
              tokenId: i.toString(),
              studentId: info.studentId,
              subject: info.subject,
              mintDate: info.examDate ? Number(info.examDate) * 1000 : null,
              isValid: info.isValid
            });
          } catch (e) {}
        }
        setStats({ totalStudents, totalVerified, totalExams, totalNFTs });
        setStudents(studentData);
        setVerificationLogs(verificationLogsData.sort((a, b) => b.timestamp - a.timestamp));
        setExamSessions(examSessionsData.sort((a, b) => b.startTime - a.startTime));
        setNftCertificates(nftList);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAdminData();
  }, [contracts]);

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: FaEye },
    { id: 'students', name: 'Sinh viên', icon: FaUsers },
    { id: 'verifications', name: 'Xác minh', icon: FaShieldAlt },
    { id: 'exams', name: 'Kỳ thi', icon: FaGraduationCap },
    { id: 'nfts', name: 'NFT', icon: FaImages },
    { id: 'nft-minting', name: 'Quản lý NFT', icon: FaCoins },
    { id: 'whitelist', name: 'Quản lý Whitelist', icon: FaUserCheck },
    { id: 'whitelist-test', name: 'Test Whitelist', icon: FaUserCheck },
    { id: 'contract-debug', name: 'Contract Debug', icon: FaShieldAlt },
    { id: 'owner', name: 'Quản lý Owner', icon: FaCrown },
  ];

  // Check if user is authorized to access admin
  if (!isConnected) {
    return (
      <div>
        <DebugAdmin />
        <OwnerLogin />
      </div>
    );
  }

  // Check if user has owner permissions
  if (!isOwner) {
    return (
      <div>
        <DebugAdmin />
        <AccessDenied account={account} isOwner={isOwner} userType={userType} />
      </div>
    );
  }

  // Auto-set userType to 'owner' if user is actually owner
  if (isOwner && userType !== 'owner') {
    console.log('🔄 Auto-setting userType to owner because user is actually owner');
    // This will be handled by the context, but we can show the admin anyway
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Debug Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">Connected:</span> {isConnected ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <span className="font-semibold">Account:</span> {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'None'}
          </div>
          <div>
            <span className="font-semibold">Is Owner:</span> {isOwner ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <span className="font-semibold">User Type:</span> {userType || 'None'}
          </div>
        </div>
        <div className="mt-3 space-x-2">
          <button
            onClick={async () => {
              await forceRefreshOwnerStatus();
              window.location.reload();
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Refresh Owner Status
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Clear Cache & Reload
          </button>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={2} userType="owner" />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Quản lý hệ thống xác thực thi cử trực tuyến
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <FaCrown className="mr-1" />
              Owner
            </span>
            <div className="text-sm text-gray-500">
              {account?.slice(0, 10)}...{account?.slice(-4)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalStudents || 0}
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
              <p className="text-sm font-medium text-gray-600">Đã xác minh</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalVerified || 0}
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
              <p className="text-sm font-medium text-gray-600">Tổng kỳ thi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalExams || 0}
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
              <p className="text-sm font-medium text-gray-600">NFT đã mint</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalNFTs || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
                  <div className="space-y-3">
                    {verificationLogs.slice(0, 5).map((log, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.studentId}</p>
                          <p className="text-xs text-gray-500">{log.ipAddress}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? 'Thành công' : 'Thất bại'}
                        </span>
                      </div>
                    ))}
                    {verificationLogs.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Không có hoạt động gần đây
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Kỳ thi đang diễn ra</h3>
                  <div className="space-y-3">
                    {examSessions.filter(s => s.status === 'active').slice(0, 5).map((session, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{session.studentId}</p>
                          <p className="text-xs text-gray-500">{session.subject}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Đang thi
                        </span>
                      </div>
                    ))}
                    {examSessions.filter(s => s.status === 'active').length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Không có kỳ thi nào đang diễn ra
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách sinh viên</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <FaDownload className="mr-2" />
                  Xuất dữ liệu
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MSSV
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ví
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Môn học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian đăng ký
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái gian lận
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.walletAddress.slice(0, 10)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                          </span>
                          {student.isCheater && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Gian lận
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.registrationTime ? new Date(student.registrationTime).toLocaleString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.isCheater && (
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                              onClick={async () => {
                                if (!contracts.examRegistrationWrite) return;
                                try {
                                  await contracts.examRegistrationWrite.unmarkCheating(student.walletAddress);
                                  alert('Đã gỡ gian lận cho sinh viên!');
                                  window.location.reload();
                                } catch (e) {
                                  alert('Lỗi khi gỡ gian lận: ' + (e?.message || e));
                                }
                              }}
                            >
                              Gỡ gian lận
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Verifications Tab */}
          {activeTab === 'verifications' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Log xác minh</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MSSV
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kết quả
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {verificationLogs.map((log, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.success ? 'Thành công' : 'Thất bại'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Exams Tab */}
          {activeTab === 'exams' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kỳ thi</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MSSV
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Môn học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian bắt đầu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {examSessions.map((session, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {session.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.startTime ? new Date(session.startTime).toLocaleString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.status === 'completed' ? 'Hoàn thành' : 'Đang thi'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NFTs Tab */}
          {activeTab === 'nfts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">NFT Chứng nhận</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Token ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MSSV
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Môn học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày mint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nftCertificates.map((nft, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {nft.tokenId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {nft.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {nft.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {nft.mintDate ? new Date(nft.mintDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            nft.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {nft.isValid ? 'Valid' : 'Revoked'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Whitelist Tab */}
          {activeTab === 'whitelist' && (
            <WhitelistManager />
          )}

          {/* Whitelist Test Tab */}
          {activeTab === 'whitelist-test' && (
            <WhitelistTest />
          )}

          {/* Contract Debug Tab */}
          {activeTab === 'contract-debug' && (
            <ContractDebug />
          )}

          {/* Owner Management Tab */}
          {activeTab === 'owner' && (
            <OwnerManagement />
          )}

          {/* NFT Minting Tab */}
          {activeTab === 'nft-minting' && (
            <NFTMintingManager />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin; 