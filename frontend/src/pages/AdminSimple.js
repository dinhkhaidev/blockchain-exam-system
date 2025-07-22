import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { FaUsers, FaShieldAlt, FaGraduationCap, FaImages, FaCrown } from 'react-icons/fa';
import { ethers } from 'ethers';

const AdminSimple = () => {
  const { isConnected, account, userType, isOwner, contracts, forceRefreshOwnerStatus } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  // Force initialize contracts function
  const forceInitializeContracts = async () => {
    try {
      console.log('🔄 Force initializing contracts...');
      
      // Import contract files
      const contractAddresses = require('../contracts/contract-address.json');
      const ExamRegistration = require('../contracts/ExamRegistration.json');
      const ExamCertificateNFT = require('../contracts/ExamCertificateNFT.json');

      console.log('📋 Contract addresses:', contractAddresses);

      // Create provider and signer
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      // Initialize contracts
      const examRegistrationContractRead = new ethers.Contract(
        contractAddresses.ExamRegistration,
        ExamRegistration.abi,
        provider
      );
      
      const examRegistrationContractWrite = new ethers.Contract(
        contractAddresses.ExamRegistration,
        ExamRegistration.abi,
        signer
      );
      
      const examCertificateNFTContract = new ethers.Contract(
        contractAddresses.ExamCertificateNFT,
        ExamCertificateNFT.abi,
        signer
      );

      console.log('✅ Contracts force initialized');
      console.log('📋 Registration contract:', examRegistrationContractRead.target);
      console.log('📋 NFT contract:', examCertificateNFTContract.target);

      // Test owner function
      try {
        const owner = await examRegistrationContractRead.owner();
        console.log('👑 Contract owner:', owner);
        console.log('👤 Current account:', account);
        console.log('✅ Is owner?', owner.toLowerCase() === account.toLowerCase());
        
        // If user is owner, force set userType
        if (owner.toLowerCase() === account.toLowerCase()) {
          console.log('🎯 User is owner, forcing userType...');
          localStorage.setItem('userType', 'owner');
          console.log('✅ Owner status set, you can now refresh manually');
        }
      } catch (error) {
        console.error('❌ Error testing owner function:', error);
      }

      return {
        examRegistration: examRegistrationContractRead,
        examRegistrationWrite: examRegistrationContractWrite,
        examCertificateNFT: examCertificateNFTContract
      };
    } catch (error) {
      console.error('❌ Error force initializing contracts:', error);
      throw error;
    }
  };

  // Check contract deployment status
  const checkContractDeployment = async () => {
    try {
      console.log('🔍 Checking contract deployment...');
      
      const contractAddresses = require('../contracts/contract-address.json');
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
      
      // Check if contracts exist at addresses
      const registrationCode = await provider.getCode(contractAddresses.ExamRegistration);
      const nftCode = await provider.getCode(contractAddresses.ExamCertificateNFT);
      
      console.log('📋 Registration contract code length:', registrationCode.length);
      console.log('📋 NFT contract code length:', nftCode.length);
      
      const isRegistrationDeployed = registrationCode !== '0x';
      const isNFTDeployed = nftCode !== '0x';
      
      console.log('✅ Registration deployed:', isRegistrationDeployed);
      console.log('✅ NFT deployed:', isNFTDeployed);
      
      return { isRegistrationDeployed, isNFTDeployed };
    } catch (error) {
      console.error('❌ Error checking deployment:', error);
      return { isRegistrationDeployed: false, isNFTDeployed: false };
    }
  };

  // Debug function to check owner status directly
  const debugOwnerStatus = async () => {
    try {
      console.log('🔍 Debugging owner status directly...');
      console.log('📋 Contracts:', contracts);
      console.log('📋 Account:', account);
      
      const debugData = {
        account: account,
        contractsAvailable: !!contracts.examRegistration,
        examRegistrationAddress: contracts.examRegistration?.target,
        examCertificateNFTAddress: contracts.examCertificateNFT?.target
      };

      if (contracts.examRegistration) {
        try {
          const owner = await contracts.examRegistration.owner();
          debugData.registrationOwner = owner;
          debugData.isRegistrationOwner = owner.toLowerCase() === account.toLowerCase();
          console.log('👑 Registration owner:', owner);
          console.log('✅ Is registration owner:', debugData.isRegistrationOwner);
        } catch (error) {
          debugData.registrationOwnerError = error.message;
          console.error('❌ Error getting registration owner:', error);
        }
      }

      if (contracts.examCertificateNFT) {
        try {
          const nftOwner = await contracts.examCertificateNFT.owner();
          debugData.nftOwner = nftOwner;
          debugData.isNFTOwner = nftOwner.toLowerCase() === account.toLowerCase();
          console.log('👑 NFT owner:', nftOwner);
          console.log('✅ Is NFT owner:', debugData.isNFTOwner);
        } catch (error) {
          debugData.nftOwnerError = error.message;
          console.error('❌ Error getting NFT owner:', error);
        }
      }

      setDebugInfo(debugData);
      console.log('📋 Debug data:', debugData);
    } catch (error) {
      console.error('❌ Debug error:', error);
    }
  };

  // Run debug on mount
  useEffect(() => {
    if (isConnected && account) {
      debugOwnerStatus();
    }
  }, [isConnected, account, contracts]);

  // Force set owner status if debug shows user is actually owner
  useEffect(() => {
    if (debugInfo.isRegistrationOwner || debugInfo.isNFTOwner) {
      console.log('🎯 User is actually owner, forcing owner status...');
      // Force set owner status
      localStorage.setItem('userType', 'owner');
      // Don't reload automatically - let user see the debug info first
      console.log('✅ Owner status set, you can now refresh manually');
    }
  }, [debugInfo.isRegistrationOwner, debugInfo.isNFTOwner]);

  // Check if user is authorized to access admin
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kết nối ví để truy cập Admin
          </h2>
          <p className="text-gray-600">
            Vui lòng kết nối MetaMask để có thể truy cập trang Admin.
          </p>
        </div>
      </div>
    );
  }

  // For AdminSimple, always show debug tools even if not owner
  // Only show access denied message if not connected

  return (
    <div className="max-w-7xl mx-auto">
      {/* Access Status */}
      {!isOwner && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <FaCrown className="text-red-600 text-xl mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Access Denied</h3>
          </div>
          <p className="text-red-700 mb-2">
            Chỉ owner mới có thể truy cập Admin Dashboard.
          </p>
          <div className="text-sm text-red-600">
            <p>Account: {account}</p>
            <p>Is Owner: {isOwner ? 'Yes' : 'No'}</p>
            <p>User Type: {userType || 'None'}</p>
          </div>
        </div>
      )}

      {/* Debug Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">Connected:</span> {isConnected ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <span className="font-semibold">Account:</span> {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'None'}
          </div>
          <div>
            <span className="font-semibold">Is Owner:</span> {isOwner ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <span className="font-semibold">User Type:</span> {userType || 'None'}
          </div>
        </div>
        
        {/* Additional Debug Info */}
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold text-sm mb-2">Contract Debug Info:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div><span className="font-semibold">Contracts Available:</span> {debugInfo.contractsAvailable ? '✅ Yes' : '❌ No'}</div>
            <div><span className="font-semibold">Registration Owner:</span> {debugInfo.registrationOwner || 'Unknown'}</div>
            <div><span className="font-semibold">Is Registration Owner:</span> {debugInfo.isRegistrationOwner ? '✅ Yes' : '❌ No'}</div>
            <div><span className="font-semibold">NFT Owner:</span> {debugInfo.nftOwner || 'Unknown'}</div>
            <div><span className="font-semibold">Is NFT Owner:</span> {debugInfo.isNFTOwner ? '✅ Yes' : '❌ No'}</div>
            {debugInfo.registrationOwnerError && (
              <div className="text-red-600"><span className="font-semibold">Registration Error:</span> {debugInfo.registrationOwnerError}</div>
            )}
            {debugInfo.nftOwnerError && (
              <div className="text-red-600"><span className="font-semibold">NFT Error:</span> {debugInfo.nftOwnerError}</div>
            )}
          </div>
        </div>
        
        <div className="mt-3 space-x-2">
          <button
            onClick={async () => {
              setIsLoading(true);
              await debugOwnerStatus();
              await forceRefreshOwnerStatus();
              setIsLoading(false);
            }}
            disabled={isLoading}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Debugging...' : 'Debug Owner Status'}
          </button>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                await forceInitializeContracts();
                await debugOwnerStatus();
                await forceRefreshOwnerStatus();
              } catch (error) {
                console.error('❌ Force initialize error:', error);
              }
              setIsLoading(false);
            }}
            disabled={isLoading}
            className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Initializing...' : 'Force Initialize Contracts'}
          </button>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                await checkContractDeployment();
              } catch (error) {
                console.error('❌ Deployment check error:', error);
              }
              setIsLoading(false);
            }}
            disabled={isLoading}
            className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Checking...' : 'Check Contract Deployment'}
          </button>
          <button
            onClick={async () => {
              setIsLoading(true);
              await forceRefreshOwnerStatus();
              window.location.reload();
            }}
            disabled={isLoading}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Owner Status'}
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Clear Cache & Reload
          </button>
          <button
            onClick={() => {
              localStorage.setItem('userType', 'owner');
              window.location.reload();
            }}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            Force Set Owner
          </button>
        </div>
      </div>
      
      {/* Header - Only show if user is owner */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Quản lý hệ thống xác thực thi cử trực tuyến
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <FaCrown className="mr-1" />
                Owner
              </span>
              <div className="text-sm text-gray-500">
                {account?.slice(0, 10)}...{account?.slice(-4)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Stats - Only show if user is owner */}
      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaShieldAlt className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã xác minh</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaGraduationCap className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng kỳ thi</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100">
                <FaImages className="text-pink-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">NFT đã mint</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message - Only show if user is owner */}
      {isOwner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCrown className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Truy cập Admin thành công!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Bạn đã có quyền truy cập đầy đủ vào trang Admin.</p>
                <p>Account: {account}</p>
                <p>Owner Status: {isOwner ? 'Confirmed' : 'Not Confirmed'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSimple; 
 
 
 
 
 