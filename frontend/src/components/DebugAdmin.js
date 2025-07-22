import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const DebugAdmin = () => {
  const { isConnected, account, userType, isOwner, ownerAddress, contracts } = useWeb3();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Debug Admin Access</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Connection Status</h3>
            <p><strong>isConnected:</strong> {isConnected ? '✅ True' : '❌ False'}</p>
            <p><strong>Account:</strong> {account || 'None'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">User Type</h3>
            <p><strong>userType:</strong> {userType || 'None'}</p>
            <p><strong>isOwner:</strong> {isOwner ? '✅ True' : '❌ False'}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Contract Status</h3>
          <p><strong>Owner Address:</strong> {ownerAddress || 'None'}</p>
          <p><strong>Exam Registration Contract:</strong> {contracts.examRegistration ? '✅ Loaded' : '❌ Not Loaded'}</p>
          <p><strong>NFT Contract:</strong> {contracts.examCertificateNFT ? '✅ Loaded' : '❌ Not Loaded'}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Access Check Results</h3>
          <p><strong>!isConnected:</strong> {!isConnected ? '❌ Blocked - Show OwnerLogin' : '✅ Pass'}</p>
          <p><strong>!isOwner:</strong> {!isOwner ? '❌ Blocked - Show AccessDenied' : '✅ Pass'}</p>
          <p><strong>userType !== "owner":</strong> {userType !== 'owner' ? '❌ Blocked - Show OwnerSetup' : '✅ Pass'}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
          {!isConnected && (
            <p className="text-blue-700">• Connect your MetaMask wallet first</p>
          )}
          {isConnected && !isOwner && (
            <p className="text-blue-700">• Your account is not the contract owner. Check if you deployed the contract with the correct address.</p>
          )}
          {isConnected && isOwner && userType !== 'owner' && (
            <p className="text-blue-700">• You are the owner but haven't selected the owner role. Go to homepage and select "Admin/Owner" role.</p>
          )}
          {isConnected && isOwner && userType === 'owner' && (
            <p className="text-green-700">• ✅ All conditions met! You should be able to access Admin Dashboard.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugAdmin; 