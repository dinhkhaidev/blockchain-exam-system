import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaCrown, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaSync } from 'react-icons/fa';

const OwnerSetup = () => {
  const { isConnected, account, contracts, isOwner, ownerAddress, userType, setUserTypeManually } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);

  const checkCurrentOwner = async () => {
    try {
      setIsLoading(true);
      if (contracts.examRegistration) {
        const owner = await contracts.examRegistration.owner();
        setCurrentOwner(owner);
        toast.info(`Owner hiện tại: ${owner}`);
      }
    } catch (error) {
      console.error('Error checking owner:', error);
      toast.error('Lỗi kiểm tra owner: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupOwner = async () => {
    try {
      setIsLoading(true);
      
      if (!isConnected) {
        toast.error('Vui lòng kết nối ví trước!');
        return;
      }

      if (!contracts.examRegistration) {
        toast.error('Contract chưa được khởi tạo!');
        return;
      }

      toast.info('Đang thiết lập owner...');
      
      // Try to transfer ownership to current account
      const tx = await contracts.examRegistration.transferOwnership(account);
      await tx.wait();
      
      toast.success('Thiết lập owner thành công!');
      
      // Reload page to update status
      window.location.reload();
      
    } catch (error) {
      console.error('Error setting up owner:', error);
      
      if (error.code === 4001) {
        toast.error('Giao dịch bị hủy bởi người dùng');
      } else if (error.message.includes('Ownable: caller is not the owner')) {
        toast.error('Bạn không phải là owner hiện tại!');
        toast.info('💡 Cần deploy lại contract với địa chỉ ví của bạn');
      } else {
        toast.error('Lỗi thiết lập owner: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectOwnerRole = () => {
    setUserTypeManually('owner');
    toast.success('Đã chọn vai trò Owner!');
    // Reload page to update status
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCrown className="text-purple-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Thiết lập Owner
          </h2>
          <p className="text-gray-600">
            Kiểm tra và thiết lập quyền owner cho địa chỉ ví của bạn
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái hiện tại:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <FaShieldAlt className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Địa chỉ ví:</p>
                <p className="text-sm text-gray-900 font-mono">{account || 'Chưa kết nối'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              {isOwner ? (
                <FaCheckCircle className="text-green-600 mr-3" />
              ) : (
                <FaTimesCircle className="text-red-600 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">Quyền Owner:</p>
                <p className={`text-sm font-medium ${isOwner ? 'text-green-600' : 'text-red-600'}`}>
                  {isOwner ? 'Có quyền' : 'Không có quyền'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {userType === 'owner' ? (
                <FaCheckCircle className="text-green-600 mr-3" />
              ) : (
                <FaTimesCircle className="text-red-600 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">Vai trò Owner:</p>
                <p className={`text-sm font-medium ${userType === 'owner' ? 'text-green-600' : 'text-red-600'}`}>
                  {userType === 'owner' ? 'Đã chọn' : 'Chưa chọn'}
                </p>
              </div>
            </div>
            
            {currentOwner && (
              <div className="flex items-center md:col-span-2">
                <FaCrown className="text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Owner hiện tại:</p>
                  <p className="text-sm text-gray-900 font-mono">{currentOwner}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={checkCurrentOwner}
            disabled={isLoading || !isConnected}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
              isLoading || !isConnected
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FaSync className="mr-2" />
            Kiểm tra Owner hiện tại
          </button>

          {!isOwner && (
            <button
              onClick={setupOwner}
              disabled={isLoading || !isConnected}
              className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                isLoading || !isConnected
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <FaCrown className="mr-2" />
              Thiết lập Owner (nếu có quyền)
            </button>
          )}

          {isOwner && userType !== 'owner' && (
            <button
              onClick={selectOwnerRole}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
            >
              <FaCrown className="mr-2" />
              Chọn vai trò Owner
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">💡 Hướng dẫn khắc phục:</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Nếu bạn không phải owner:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 ml-4">
                <li>1. Đảm bảo Ganache đang chạy</li>
                <li>2. Deploy lại contract với địa chỉ ví của bạn</li>
                <li>3. Cập nhật địa chỉ contract trong frontend</li>
                <li>4. Restart ứng dụng</li>
              </ol>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Nếu bạn là owner nhưng chưa chọn vai trò:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 ml-4">
                <li>1. Click "Chọn vai trò Owner" để thiết lập vai trò</li>
                <li>2. Hệ thống sẽ tự động chuyển đến Admin Dashboard</li>
                <li>3. Bây giờ bạn có thể sử dụng tất cả tính năng Admin</li>
              </ol>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Nếu bạn là owner nhưng không có quyền:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 ml-4">
                <li>1. Kiểm tra địa chỉ contract có đúng không</li>
                <li>2. Thử kết nối lại MetaMask</li>
                <li>3. Refresh trang và thử lại</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Thông tin Contract:</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>ExamRegistration:</strong> 0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
            <p><strong>ExamCertificateNFT:</strong> 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</p>
            <p><strong>Network:</strong> localhost:8545</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSetup; 