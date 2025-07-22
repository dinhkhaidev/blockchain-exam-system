import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import UserTypeSelector from '../components/UserTypeSelector';
import RoleSelection from '../components/RoleSelection';
import ProgressIndicator from '../components/ProgressIndicator';
import { 
  FaGraduationCap, 
  FaShieldAlt, 
  FaImages, 
  FaChartBar, 
  FaWallet,
  FaCheckCircle,
  FaArrowRight,
  FaRocket,
  FaCrown
} from 'react-icons/fa';

const Home = () => {
  const { isConnected, account, userType, isOwner } = useWeb3();
  const [selectedUserType, setSelectedUserType] = useState(null);

  const features = [
    {
      icon: FaWallet,
      title: 'Kết nối ví Metamask',
      description: 'Xác định danh tính và thực hiện các giao dịch an toàn',
      color: 'bg-blue-500'
    },
    {
      icon: FaCrown,
      title: 'Quản lý Admin',
      description: 'Owner quản lý whitelist và theo dõi hệ thống',
      color: 'bg-purple-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Đăng ký thi online',
      description: 'Sinh viên đăng ký thông tin thi qua smart contract',
      color: 'bg-green-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Xác minh danh tính',
      description: 'Kiểm tra ví đăng nhập có khớp với thông tin đã đăng ký',
      color: 'bg-purple-500'
    },
    {
      icon: FaImages,
      title: 'NFT chứng nhận',
      description: 'Tạo NFT chứa metadata: MSSV, môn, thời gian thi',
      color: 'bg-pink-500'
    },
    {
      icon: FaChartBar,
      title: 'Giao diện tra cứu',
      description: 'Admin xem danh sách sinh viên đã xác minh, đã thi',
      color: 'bg-orange-500'
    }
  ];

  const studentSteps = [
    {
      step: '1',
      title: 'Kết nối ví',
      description: 'Kết nối MetaMask để xác định danh tính'
    },
    {
      step: '2',
      title: 'Đăng ký thi',
      description: 'Nhập MSSV, môn học, ca thi và đăng ký'
    },
    {
      step: '3',
      title: 'Xác minh danh tính',
      description: 'Hệ thống kiểm tra và xác minh thông tin'
    },
    {
      step: '4',
      title: 'Tham gia thi',
      description: 'Vào thi sau khi xác minh thành công'
    },
    {
      step: '5',
      title: 'Nhận NFT',
      description: 'Nhận NFT chứng nhận đã tham gia thi hợp lệ'
    }
  ];

  const ownerSteps = [
    {
      step: '1',
      title: 'Kết nối ví',
      description: 'Kết nối MetaMask với tài khoản owner'
    },
    {
      step: '2',
      title: 'Quản lý Whitelist',
      description: 'Thêm/xóa địa chỉ sinh viên vào whitelist'
    },
    {
      step: '3',
      title: 'Theo dõi đăng ký',
      description: 'Xem danh sách sinh viên đã đăng ký thi'
    },
    {
      step: '4',
      title: 'Giám sát thi',
      description: 'Theo dõi kỳ thi đang diễn ra'
    },
    {
      step: '5',
      title: 'Quản lý NFT',
      description: 'Xem và quản lý NFT chứng nhận'
    }
  ];

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
  };

  // Show role selection if connected but no user type selected
  if (isConnected && !userType && !selectedUserType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="py-20">
          <RoleSelection />
        </div>
      </div>
    );
  }

  // Determine current step based on user type and status
  const getCurrentStep = () => {
    if (!isConnected) return 0;
    
    if (userType === 'owner' || selectedUserType === 'owner') {
      return 1; // Owner starts at step 1 (connect wallet)
    }
    
    // For students, we'd need to check their registration status
    // For now, return step 1
    return 1;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaGraduationCap className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Hệ thống xác thực thi cử trực tuyến
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ứng dụng Blockchain và NFT để xây dựng hệ thống thi online minh bạch, 
              chống gian lận và đảm bảo tính toàn vẹn của kỳ thi.
            </p>
            
            {isConnected && (userType || selectedUserType) && (
              <ProgressIndicator 
                currentStep={getCurrentStep()} 
                userType={userType || selectedUserType}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isConnected ? (
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaRocket className="mr-2" />
                  Bắt đầu ngay
                </Link>
              ) : (userType === 'owner' || selectedUserType === 'owner') ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <FaCrown className="mr-2" />
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaGraduationCap className="mr-2" />
                    Đăng ký thi
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaGraduationCap className="mr-2" />
                    Đăng ký thi
                  </Link>
                  <Link
                    to="/verify"
                    className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <FaShieldAlt className="mr-2" />
                    Xác minh danh tính
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng chính
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hệ thống được thiết kế với các tính năng tiên tiến để đảm bảo 
              tính minh bạch và bảo mật cho kỳ thi trực tuyến.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quy trình hoạt động
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hướng dẫn từng bước để tham gia kỳ thi trực tuyến an toàn.
            </p>
          </div>
          
          {/* Student Flow */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Flow dành cho Sinh viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {studentSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    {index < studentSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-blue-200 transform translate-x-2"></div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Flow */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Flow dành cho Admin/Owner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {ownerSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    {index < ownerSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-purple-200 transform translate-x-2"></div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sẵn sàng tham gia?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Kết nối ví MetaMask và bắt đầu trải nghiệm thi trực tuyến 
            với công nghệ blockchain tiên tiến.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <FaGraduationCap className="mr-2" />
              Đăng ký thi ngay
              <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              <FaCrown className="mr-2" />
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 