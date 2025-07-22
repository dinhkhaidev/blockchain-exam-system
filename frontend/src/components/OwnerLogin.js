import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaCrown, FaKey, FaUserPlus, FaShieldAlt } from 'react-icons/fa';

const OwnerLogin = () => {
  const { isConnected, account, contracts, connectWallet } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [newOwnerAddress, setNewOwnerAddress] = useState('');

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      await connectWallet();
      toast.success('Kết nối ví thành công!');
    } catch (error) {
      toast.error('Lỗi kết nối ví: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupOwner = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    if (!newOwnerAddress || newOwnerAddress.trim() === '') {
      toast.error('Vui lòng nhập địa chỉ ví!');
      return;
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(newOwnerAddress)) {
      toast.error('Địa chỉ ví không hợp lệ!');
      return;
    }

    setIsLoading(true);

    try {
      toast.info('Đang thiết lập owner...');
      
      // Try to transfer ownership
      const tx = await contracts.examRegistration.transferOwnership(newOwnerAddress);
      await tx.wait();
      
      toast.success('Thiết lập owner thành công!');
      setNewOwnerAddress('');
      setShowSetupForm(false);
      
      // Reload page to update status
      window.location.reload();
      
    } catch (error) {
      console.error('Error setting up owner:', error);
      
      if (error.code === 4001) {
        toast.error('Giao dịch bị hủy bởi người dùng');
      } else if (error.message.includes('Ownable: caller is not the owner')) {
        toast.error('Bạn không phải là owner hiện tại!');
        toast.info('💡 Hướng dẫn: Deploy lại contract với địa chỉ ví của bạn');
      } else {
        toast.error('Lỗi thiết lập owner: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCrown className="text-purple-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng nhập Admin
          </h2>
          <p className="text-gray-600">
            Kết nối ví để truy cập Admin Dashboard
          </p>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
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
                  <FaKey className="mr-2" />
                  Kết nối MetaMask
                </span>
              )}
            </button>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                💡 Hướng dẫn thiết lập Owner:
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Kết nối ví MetaMask</li>
                <li>• Nếu chưa là owner, sử dụng chức năng "Thiết lập Owner"</li>
                <li>• Hoặc deploy lại contract với địa chỉ ví của bạn</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaShieldAlt className="text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Đã kết nối ví
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1 font-mono">
                {account}
              </p>
            </div>

            {!showSetupForm ? (
              <button
                onClick={() => setShowSetupForm(true)}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
              >
                <FaUserPlus className="mr-2" />
                Thiết lập Owner mới
              </button>
            ) : (
              <form onSubmit={handleSetupOwner} className="space-y-4">
                <div>
                  <label htmlFor="newOwner" className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ ví Owner mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="newOwner"
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0x..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Địa chỉ ví sẽ trở thành owner mới của contract
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaUserPlus className="mr-2" />
                        Thiết lập Owner
                      </span>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowSetupForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ Lưu ý quan trọng:
              </h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Chỉ owner hiện tại mới có thể thiết lập owner mới</li>
                <li>• Nếu không phải owner, cần deploy lại contract</li>
                <li>• Đảm bảo địa chỉ ví chính xác</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerLogin; 