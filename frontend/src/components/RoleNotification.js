import React from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaGraduationCap, FaArrowRight } from 'react-icons/fa';

const RoleNotification = ({ account }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCrown className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng bạn đến với hệ thống!
          </h2>
          <p className="text-gray-600 mb-4">
            Vui lòng chọn vai trò phù hợp để tiếp tục sử dụng hệ thống.
          </p>
          <div className="bg-blue-50 rounded-lg p-3 inline-block">
            <p className="text-sm text-blue-700">
              <strong>Địa chỉ ví:</strong> {account}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin/Owner Option */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200 hover:border-purple-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <FaCrown className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin/Owner</h3>
                <p className="text-sm text-gray-600">Quản lý hệ thống, thêm sinh viên vào whitelist</p>
              </div>
            </div>
            
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>• Quản lý whitelist sinh viên</li>
              <li>• Theo dõi đăng ký thi</li>
              <li>• Giám sát kỳ thi</li>
              <li>• Quản lý NFT chứng nhận</li>
            </ul>

            <Link
              to="/"
              className="inline-flex items-center w-full justify-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
            >
              <FaCrown className="mr-2" />
              Chọn vai trò này
              <FaArrowRight className="ml-2" />
            </Link>
          </div>

          {/* Student Option */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FaGraduationCap className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sinh viên</h3>
                <p className="text-sm text-gray-600">Đăng ký thi, xác minh danh tính và tham gia thi</p>
              </div>
            </div>
            
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>• Đăng ký thi trực tuyến</li>
              <li>• Xác minh danh tính</li>
              <li>• Tham gia thi</li>
              <li>• Nhận NFT chứng nhận</li>
            </ul>

            <Link
              to="/register"
              className="inline-flex items-center w-full justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              <FaGraduationCap className="mr-2" />
              Chọn vai trò này
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Lưu ý:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Bạn có thể thay đổi vai trò bất cứ lúc nào</li>
            <li>• Vai trò được lưu trong trình duyệt</li>
            <li>• Đảm bảo kết nối đúng ví MetaMask</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoleNotification; 