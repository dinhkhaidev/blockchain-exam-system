import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const WhitelistTest = () => {
  const { 
    isConnected, 
    account, 
    isOwner, 
    contracts 
  } = useWeb3();
  
  const [testAddress, setTestAddress] = useState('0x8e4Cf11A8F982c0cFD54f3f1F6A0db91f0c1b30a');
  const [isLoading, setIsLoading] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState(null);

  const checkWhitelistStatus = async () => {
    if (!testAddress) {
      toast.error('Vui lòng nhập địa chỉ ví!');
      return;
    }

    if (!contracts || !contracts.examRegistration) {
      toast.error('Contract not available');
      return;
    }

    setIsLoading(true);
    try {
      const contract = contracts.examRegistration;
      const status = await contract.isStudentWhitelisted(testAddress);
      setWhitelistStatus(status);
      toast.info(`Status: ${status ? 'Whitelisted' : 'Not whitelisted'}`);
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWhitelist = async () => {
    if (!testAddress) {
      toast.error('Vui lòng nhập địa chỉ ví!');
      return;
    }

    if (!contracts || !contracts.examRegistration) {
      toast.error('Contract not available');
      return;
    }

    setIsLoading(true);
    try {
      const contract = contracts.examRegistration;
      
      // Estimate gas first
      const gasEstimate = await contract.addStudentToWhitelist.estimateGas(testAddress);
      
      // Add to whitelist
      const tx = await contract.addStudentToWhitelist(testAddress, {
        gasLimit: typeof gasEstimate.mul === 'function' 
          ? gasEstimate.mul(120).div(100)
          : Math.floor(Number(gasEstimate) * 1.2)
      });
      
      toast.info('Adding to whitelist... Please confirm in MetaMask');
      
      const receipt = await tx.wait();
      console.log('Add to whitelist transaction:', receipt.hash);
      
      toast.success('✅ Đã thêm vào whitelist thành công!');
      await checkWhitelistStatus();
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkContractInfo = () => {
    console.log('📋 Contract info:');
    console.log('📋 isConnected:', isConnected);
    console.log('📋 account:', account);
    console.log('📋 isOwner:', isOwner);
    console.log('📋 contracts:', contracts);
    
    if (contracts.examRegistration) {
      console.log('📋 examRegistration contract:', contracts.examRegistration);
      console.log('📋 contract target:', contracts.examRegistration.target);
    }
    
    if (contracts.examRegistrationWrite) {
      console.log('📋 examRegistrationWrite contract:', contracts.examRegistrationWrite);
      console.log('📋 contract target:', contracts.examRegistrationWrite.target);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Whitelist Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Address
          </label>
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="0x..."
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={checkWhitelistStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Check Status
          </button>
          
          {isOwner && (
            <button
              onClick={addToWhitelist}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Add to Whitelist
            </button>
          )}
          
          <button
            onClick={checkContractInfo}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Check Contract Info
          </button>
        </div>

        {whitelistStatus !== null && (
          <div className={`p-3 rounded-md ${
            whitelistStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            Status: {whitelistStatus ? '✅ Whitelisted' : '❌ Not whitelisted'}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Connected: {isConnected ? '✅' : '❌'}</p>
          <p>Account: {account || 'Not connected'}</p>
          <p>Is Owner: {isOwner ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
};

export default WhitelistTest; 