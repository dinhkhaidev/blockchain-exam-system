import React from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaGraduationCap, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

const AccessDenied = ({ account, isOwner, userType }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Không có quyền truy cập Admin Dashboard
        </h2>
        
        <p className="text-gray-600 mb-6">
          Chỉ Owner thực sự mới có thể truy cập Admin Dashboard.
        </p>

        {/* Status Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái hiện tại:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-center">
              <FaShieldAlt className="text-blue-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Địa chỉ ví:</p>
                <p className="text-sm text-gray-900 font-mono">{account}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              {isOwner ? (
                <FaCrown className="text-green-600 mr-3" />
              ) : (
                <FaExclamationTriangle className="text-red-600 mr-3" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Quyền Owner:</p>
                <p className={`text-sm font-medium ${isOwner ? 'text-green-600' : 'text-red-600'}`}>
                  {isOwner ? 'Có quyền' : 'Không có quyền'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              {userType === 'owner' ? (
                <FaCrown className="text-green-600 mr-3" />
              ) : (
                <FaGraduationCap className="text-blue-600 mr-3" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Vai trò hiện tại:</p>
                <p className={`text-sm font-medium ${userType === 'owner' ? 'text-green-600' : 'text-blue-600'}`}>
                  {userType === 'owner' ? 'Owner' : 'Student'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Trạng thái truy cập:</p>
                <p className="text-sm font-medium text-red-600">
                  Bị từ chối
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {isOwner && userType !== 'owner' && (
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">✅ Bạn có quyền Owner!</h4>
              <p className="text-sm text-green-700 mb-3">
                Bạn là owner của contract nhưng chưa chọn vai trò Owner. 
                Hãy chọn vai trò để truy cập Admin Dashboard.
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                <FaCrown className="mr-2" />
                Chọn vai trò Owner
              </Link>
            </div>
          )}

          {!isOwner && (
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">❌ Bạn không phải Owner!</h4>
              <p className="text-sm text-red-700 mb-3">
                Địa chỉ ví của bạn không phải là owner của contract. 
                Vui lòng deploy lại contract với địa chỉ ví của bạn.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                <FaExclamationTriangle className="mr-2" />
                Về trang chủ
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaGraduationCap className="mr-2" />
              Về trang chủ
            </Link>
            
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FaGraduationCap className="mr-2" />
              Đăng ký thi
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Thông tin bổ sung:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Admin Dashboard chỉ dành cho Owner thực sự</li>
            <li>• Owner phải có quyền trong smart contract</li>
            <li>• Owner phải chọn vai trò Owner trong hệ thống</li>
            <li>• Sinh viên có thể sử dụng chức năng đăng ký thi</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 