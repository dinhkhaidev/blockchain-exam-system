import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaUsers, FaUpload, FaSpinner } from 'react-icons/fa';
import { isAddress } from "ethers";

const WhitelistManager = () => {
  const { 
    isConnected, 
    account, 
    isOwner, 
    contracts
  } = useWeb3();
  
  const [singleAddress, setSingleAddress] = useState('');
  const [multipleAddresses, setMultipleAddresses] = useState('');
  const [whitelistedStudents, setWhitelistedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwnerStatus, setIsOwnerStatus] = useState(false);

  // Check if current user is owner
  useEffect(() => {
      if (isConnected && account) {
        setIsOwnerStatus(isOwner);
      }
  }, [isConnected, account, isOwner]);

  // Load whitelisted students from blockchain
  useEffect(() => {
    if (isOwnerStatus) {
      loadWhitelistedStudents();
    }
  }, [isOwnerStatus]);

  const loadWhitelistedStudents = async () => {
    if (!contracts || !contracts.examRegistration) {
      setWhitelistedStudents([]);
      return;
    }
    setIsLoading(true);
    try {
      const contract = contracts.examRegistration;
      const addresses = await contract.getWhitelistedAddresses();
      setWhitelistedStudents(addresses);
    } catch (error) {
      console.error('Error loading whitelisted students:', error);
      toast.error('Lỗi khi tải danh sách whitelist từ blockchain');
      setWhitelistedStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingleStudent = async (e) => {
    e.preventDefault();
    if (!singleAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ ví!');
      return;
    }
    if (!isAddress(singleAddress.trim())) {
      toast.error('Địa chỉ ví không hợp lệ!');
      return;
    }
    if (!contracts || !contracts.examRegistrationWrite) {
      toast.error('Contract write not available. Vui lòng reload lại trang hoặc kết nối lại ví.');
      return;
    }
    setIsLoading(true);
    try {
      const contract = contracts.examRegistrationWrite;
      const owner = await contract.owner();
      console.log('--- DEBUG WHITELIST ---');
      console.log('Current MetaMask account:', account);
      console.log('Contract owner:', owner);
      console.log('Contract address:', contract.target);
      if (window.ethereum && window.ethereum.networkVersion) {
        console.log('MetaMask network:', window.ethereum.networkVersion);
      }
      const isWhitelisted = await contracts.examRegistration.isStudentWhitelisted(singleAddress.trim());
      console.log('Is whitelisted before add:', isWhitelisted);
      if (owner.toLowerCase() !== account.toLowerCase()) {
        toast.error('Bạn không phải owner của contract!');
        setIsLoading(false);
        return;
      }
      if (isWhitelisted) {
        toast.error('Địa chỉ đã có trong whitelist! Vui lòng nhập địa chỉ mới.');
        setIsLoading(false);
        return;
      }
      // Gọi trực tiếp, không estimateGas để tránh bug ethers v6 + Ganache
      const tx = await contract.addStudentToWhitelist(singleAddress.trim());
      toast.info('Đang thêm vào whitelist... Vui lòng xác nhận trên MetaMask');
      await tx.wait();
      setSingleAddress('');
      await loadWhitelistedStudents();
      toast.success('✅ Đã thêm sinh viên vào whitelist thành công!');
    } catch (error) {
      console.error('❌ Error adding student:', error);
      toast.error(`❌ Thêm sinh viên thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMultipleStudents = async (e) => {
    e.preventDefault();
    if (!multipleAddresses.trim()) {
      toast.error('Vui lòng nhập danh sách địa chỉ ví!');
      return;
    }
    if (!contracts || !contracts.examRegistration) {
      toast.error('Contract not available');
      return;
    }
    const addresses = multipleAddresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);
    if (addresses.length === 0) {
      toast.error('Không có địa chỉ hợp lệ!');
      return;
    }
    setIsLoading(true);
    try {
      const contract = contracts.examRegistration;
      for (const address of addresses) {
        const gasEstimate = await contract.addStudentToWhitelist.estimateGas(address);
        const tx = await contract.addStudentToWhitelist(address, {
          gasLimit: typeof gasEstimate.mul === 'function' 
            ? gasEstimate.mul(120).div(100)
            : Math.floor(Number(gasEstimate) * 1.2)
        });
        await tx.wait();
      }
      setMultipleAddresses('');
      await loadWhitelistedStudents();
      toast.success(`Đã thêm ${addresses.length} sinh viên vào whitelist!`);
    } catch (error) {
      console.error('Error adding multiple students:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async (address) => {
    if (!contracts || !contracts.examRegistration) {
      toast.error('Contract not available');
      return;
    }
    setIsLoading(true);
    try {
      const contract = contracts.examRegistration;
      const gasEstimate = await contract.removeStudentFromWhitelist.estimateGas(address);
      const tx = await contract.removeStudentFromWhitelist(address, {
        gasLimit: typeof gasEstimate.mul === 'function' 
          ? gasEstimate.mul(120).div(100)
          : Math.floor(Number(gasEstimate) * 1.2)
      });
      toast.info('Đang xóa khỏi whitelist... Vui lòng xác nhận trên MetaMask');
      await tx.wait();
      await loadWhitelistedStudents();
      toast.success('✅ Đã xóa sinh viên khỏi whitelist thành công!');
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUsers className="text-blue-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Kết nối ví để quản lý whitelist
        </h2>
        <p className="text-gray-600">
          Vui lòng kết nối MetaMask để có thể quản lý danh sách sinh viên.
        </p>
      </div>
    );
  }

  if (!isOwnerStatus) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUsers className="text-red-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Không có quyền truy cập
        </h2>
        <p className="text-gray-600">
          Chỉ owner mới có thể quản lý whitelist. Địa chỉ hiện tại: {account}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý Whitelist
        </h2>
        <p className="text-gray-600">
          Thêm hoặc xóa sinh viên khỏi danh sách được phép đăng ký thi.
        </p>
      </div>

      {/* Add Single Student */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thêm sinh viên đơn lẻ
        </h3>
        <form onSubmit={handleAddSingleStudent} className="space-y-4">
          <div>
            <label htmlFor="singleAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ ví sinh viên
            </label>
            <input
              type="text"
              id="singleAddress"
              value={singleAddress}
              onChange={(e) => setSingleAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0x..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaPlus className="mr-2" />
            )}
            Thêm vào whitelist
          </button>
        </form>
      </div>

      {/* Add Multiple Students */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thêm nhiều sinh viên
        </h3>
        <form onSubmit={handleAddMultipleStudents} className="space-y-4">
          <div>
            <label htmlFor="multipleAddresses" className="block text-sm font-medium text-gray-700 mb-2">
              Danh sách địa chỉ ví (mỗi dòng một địa chỉ)
            </label>
            <textarea
              id="multipleAddresses"
              value={multipleAddresses}
              onChange={(e) => setMultipleAddresses(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="6"
              placeholder="0x1234567890abcdef...\n0xabcdef1234567890...\n0x9876543210fedcba..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaUpload className="mr-2" />
            )}
            Thêm tất cả vào whitelist
          </button>
        </form>
      </div>

      {/* Whitelisted Students List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Danh sách sinh viên trong whitelist ({whitelistedStudents.length})
        </h3>
        {isLoading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto mb-2" />
            <p className="text-gray-500">Đang tải danh sách whitelist...</p>
          </div>
        ) : whitelistedStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Chưa có sinh viên nào trong whitelist
          </p>
        ) : (
          <div className="space-y-2">
            {whitelistedStudents.map((address, index) => (
              <div
                key={address}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span className="font-mono text-sm text-gray-700">
                  {address}
                </span>
                <button
                  onClick={() => handleRemoveStudent(address)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                  title="Xóa khỏi whitelist"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhitelistManager; 