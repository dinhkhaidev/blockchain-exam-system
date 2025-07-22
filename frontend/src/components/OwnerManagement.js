import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaCrown, FaUserPlus, FaUserMinus, FaShieldAlt, FaKey } from 'react-icons/fa';

const OwnerManagement = () => {
  const { isConnected, account, isOwner, ownerAddress, contracts } = useWeb3();
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    if (!isOwner) {
      toast.error('Chỉ owner hiện tại mới có thể chuyển quyền!');
      return;
    }

    if (!newOwnerAddress || newOwnerAddress.trim() === '') {
      toast.error('Vui lòng nhập địa chỉ ví mới!');
      return;
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(newOwnerAddress)) {
      toast.error('Địa chỉ ví không hợp lệ!');
      return;
    }

    if (newOwnerAddress.toLowerCase() === account.toLowerCase()) {
      toast.error('Không thể chuyển quyền cho chính mình!');
      return;
    }

    setIsLoading(true);

    try {
      toast.info('Đang chuyển quyền ownership...');
      
      const tx = await contracts.examRegistration.transferOwnership(newOwnerAddress);
      await tx.wait();
      
      toast.success('Chuyển quyền ownership thành công!');
      setNewOwnerAddress('');
      setShowTransferForm(false);
      
      // Reload page to update owner status
      window.location.reload();
      
    } catch (error) {
      console.error('Error transferring ownership:', error);
      
      if (error.code === 4001) {
        toast.error('Giao dịch bị hủy bởi người dùng');
      } else if (error.message.includes('Ownable: caller is not the owner')) {
        toast.error('Bạn không phải là owner hiện tại!');
      } else {
        toast.error('Lỗi chuyển quyền: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenounceOwnership = async () => {
    if (!isConnected) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    if (!isOwner) {
      toast.error('Chỉ owner hiện tại mới có thể từ bỏ quyền!');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn từ bỏ quyền ownership? Hành động này không thể hoàn tác!'
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      toast.info('Đang từ bỏ quyền ownership...');
      
      const tx = await contracts.examRegistration.renounceOwnership();
      await tx.wait();
      
      toast.success('Đã từ bỏ quyền ownership thành công!');
      
      // Reload page to update owner status
      window.location.reload();
      
    } catch (error) {
      console.error('Error renouncing ownership:', error);
      
      if (error.code === 4001) {
        toast.error('Giao dịch bị hủy bởi người dùng');
      } else if (error.message.includes('Ownable: caller is not the owner')) {
        toast.error('Bạn không phải là owner hiện tại!');
      } else {
        toast.error('Lỗi từ bỏ quyền: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
          <FaCrown className="text-purple-600 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Owner</h2>
          <p className="text-gray-600">Chuyển quyền hoặc từ bỏ quyền ownership</p>
        </div>
      </div>

      {/* Current Owner Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Owner hiện tại:</h3>
        <div className="flex items-center space-x-2">
          <FaShieldAlt className="text-green-600" />
          <span className="font-mono text-sm text-gray-900">
            {ownerAddress || 'Chưa có owner'}
          </span>
        </div>
        {isOwner && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <FaCrown className="mr-1" />
              Bạn là owner hiện tại
            </span>
          </div>
        )}
      </div>

      {/* Transfer Ownership */}
      {isOwner && (
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chuyển quyền Ownership</h3>
            
            {!showTransferForm ? (
              <button
                onClick={() => setShowTransferForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <FaUserPlus className="mr-2" />
                Chuyển quyền cho địa chỉ khác
              </button>
            ) : (
              <form onSubmit={handleTransferOwnership} className="space-y-4">
                <div>
                  <label htmlFor="newOwner" className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ ví mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="newOwner"
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        : 'bg-blue-600 hover:bg-blue-700'
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
                        Chuyển quyền
                      </span>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowTransferForm(false)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Renounce Ownership */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Từ bỏ quyền Ownership</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <FaKey className="text-red-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Cảnh báo!</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Từ bỏ quyền ownership sẽ làm cho contract không có owner. 
                    Hành động này không thể hoàn tác và sẽ làm mất khả năng quản lý whitelist.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleRenounceOwnership}
                disabled={isLoading}
                className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaUserMinus className="mr-2" />
                    Từ bỏ quyền Ownership
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Owner Message */}
      {!isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaShieldAlt className="text-yellow-600 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Không có quyền</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Chỉ owner hiện tại mới có thể chuyển quyền hoặc từ bỏ quyền ownership.
                Địa chỉ ví của bạn: <span className="font-mono">{account}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerManagement; 