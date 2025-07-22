import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaGraduationCap, FaUsers, FaShieldAlt, FaImages, FaEye, FaUserCheck, FaCertificate, FaClipboardCheck } from 'react-icons/fa';

const RoleSelection = () => {
  const { isConnected, account, connectWallet, setUserTypeManually } = useWeb3();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role) => {
    setUserTypeManually(role);
    
    if (role === 'owner') {
      navigate('/admin');
    } else {
      navigate('/register');
    }
  };

  const adminFeatures = [
    { icon: FaUsers, title: 'Quản lý whitelist sinh viên', desc: 'Thêm/xóa sinh viên khỏi danh sách được phép' },
    { icon: FaEye, title: 'Theo dõi đăng ký thi', desc: 'Xem danh sách sinh viên đã đăng ký' },
    { icon: FaShieldAlt, title: 'Giám sát kỳ thi', desc: 'Theo dõi tiến trình và kết quả thi' },
    { icon: FaImages, title: 'Quản lý NFT chứng nhận', desc: 'Phát hành và quản lý chứng nhận NFT' },
    { icon: FaUserCheck, title: 'Xác minh danh tính', desc: 'Kiểm tra và xác thực thông tin sinh viên' }
  ];

  const studentFeatures = [
    { icon: FaClipboardCheck, title: 'Đăng ký thi trực tuyến', desc: 'Đăng ký tham gia kỳ thi một cách dễ dàng' },
    { icon: FaShieldAlt, title: 'Xác minh danh tính', desc: 'Xác thực thông tin cá nhân qua blockchain' },
    { icon: FaEye, title: 'Tham gia thi', desc: 'Truy cập vào hệ thống thi an toàn' },
    { icon: FaCertificate, title: 'Nhận NFT chứng nhận', desc: 'Nhận chứng nhận thi dưới dạng NFT' },
    { icon: FaUsers, title: 'Theo dõi tiến trình', desc: 'Xem trạng thái đăng ký và kết quả' }
  ];

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kết nối ví để tiếp tục
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng kết nối MetaMask để có thể chọn vai trò và sử dụng hệ thống.
          </p>
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang kết nối...
              </span>
            ) : (
              <span className="flex items-center">
                <FaShieldAlt className="mr-2" />
                Kết nối MetaMask
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Chọn vai trò của bạn
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Vui lòng chọn vai trò phù hợp để tiếp tục sử dụng hệ thống.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 inline-block">
          <p className="text-sm text-blue-700">
            <strong>Địa chỉ ví:</strong> {account}
          </p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admin/Owner Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-all duration-200">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <FaCrown className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Admin/Owner</h2>
                <p className="text-purple-100">Quản lý hệ thống, thêm sinh viên vào whitelist</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng chính:</h3>
            <div className="space-y-3 mb-6">
              {adminFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <feature.icon className="text-purple-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{feature.title}</p>
                    <p className="text-xs text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleRoleSelection('owner')}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
            >
              <FaCrown className="mr-2" />
              Chọn vai trò này
            </button>
          </div>
        </div>

        {/* Student Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <FaGraduationCap className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sinh viên</h2>
                <p className="text-blue-100">Đăng ký thi, xác minh danh tính và tham gia thi</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng chính:</h3>
            <div className="space-y-3 mb-6">
              {studentFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <feature.icon className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{feature.title}</p>
                    <p className="text-xs text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleRoleSelection('student')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              <FaGraduationCap className="mr-2" />
              Chọn vai trò này
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Lưu ý quan trọng:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-700 mb-2">🔐 Bảo mật:</p>
            <ul className="space-y-1">
              <li>• Vai trò được lưu trong trình duyệt</li>
              <li>• Có thể thay đổi vai trò bất cứ lúc nào</li>
              <li>• Đảm bảo kết nối đúng ví MetaMask</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-2">⚡ Tính năng:</p>
            <ul className="space-y-1">
              <li>• Giao diện thân thiện và dễ sử dụng</li>
              <li>• Hướng dẫn chi tiết cho từng vai trò</li>
              <li>• Tự động chuyển hướng sau khi chọn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 