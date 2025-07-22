import React, { useState } from 'react';
import { FaCrown, FaGraduationCap, FaWallet } from 'react-icons/fa';

const UserTypeSelector = ({ onUserTypeSelect, isConnected, account }) => {
  const [selectedType, setSelectedType] = useState(null);

  const userTypes = [
    {
      id: 'owner',
      name: 'Admin/Owner',
      description: 'Quản lý hệ thống, thêm sinh viên vào whitelist',
      icon: FaCrown,
      color: 'bg-purple-500',
      features: [
        'Quản lý whitelist sinh viên',
        'Theo dõi đăng ký thi',
        'Giám sát kỳ thi',
        'Quản lý NFT chứng nhận'
      ]
    },
    {
      id: 'student',
      name: 'Sinh viên',
      description: 'Đăng ký thi, xác minh danh tính và tham gia thi',
      icon: FaGraduationCap,
      color: 'bg-blue-500',
      features: [
        'Đăng ký thi trực tuyến',
        'Xác minh danh tính',
        'Tham gia thi',
        'Nhận NFT chứng nhận'
      ]
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    onUserTypeSelect(type);
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaWallet className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kết nối ví để tiếp tục
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng kết nối MetaMask để có thể sử dụng hệ thống.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chọn vai trò của bạn
          </h2>
          <p className="text-gray-600">
            Vui lòng chọn vai trò phù hợp để tiếp tục sử dụng hệ thống.
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Địa chỉ ví:</strong> {account}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mr-4`}>
                    <Icon className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {type.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tính năng chính:</h4>
                  <ul className="space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      selectedType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedType === type.id ? 'Đã chọn' : 'Chọn vai trò này'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selectedType && (
          <div className="mt-6 text-center">
            <button
              onClick={() => handleTypeSelect(selectedType)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
            >
              Tiếp tục với vai trò {selectedType === 'owner' ? 'Admin' : 'Sinh viên'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTypeSelector; 