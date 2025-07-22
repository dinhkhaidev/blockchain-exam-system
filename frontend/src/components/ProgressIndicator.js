import React from 'react';
import { FaWallet, FaUserCheck, FaShieldAlt, FaGraduationCap, FaImages } from 'react-icons/fa';

const ProgressIndicator = ({ currentStep, userType = 'student' }) => {
  const studentSteps = [
    { id: 1, name: 'Kết nối ví', icon: FaWallet, description: 'Kết nối MetaMask' },
    { id: 2, name: 'Đăng ký thi', icon: FaUserCheck, description: 'Nhập thông tin thi' },
    { id: 3, name: 'Xác minh danh tính', icon: FaShieldAlt, description: 'Chụp ảnh xác minh' },
    { id: 4, name: 'Tham gia thi', icon: FaGraduationCap, description: 'Làm bài thi' },
    { id: 5, name: 'Nhận NFT', icon: FaImages, description: 'Chứng nhận hoàn thành' }
  ];

  const ownerSteps = [
    { id: 1, name: 'Kết nối ví', icon: FaWallet, description: 'Kết nối MetaMask' },
    { id: 2, name: 'Quản lý Whitelist', icon: FaUserCheck, description: 'Thêm/xóa sinh viên' },
    { id: 3, name: 'Theo dõi đăng ký', icon: FaShieldAlt, description: 'Xem danh sách đăng ký' },
    { id: 4, name: 'Giám sát thi', icon: FaGraduationCap, description: 'Theo dõi kỳ thi' },
    { id: 5, name: 'Quản lý NFT', icon: FaImages, description: 'Xem chứng nhận' }
  ];

  const steps = userType === 'owner' ? ownerSteps : studentSteps;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tiến trình {userType === 'owner' ? 'Admin' : 'Sinh viên'}
      </h3>
      <div className="flex flex-wrap justify-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center mx-2 mb-4">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-full w-8 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
              <div className="text-center mt-2">
                <p className={`text-xs font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator; 