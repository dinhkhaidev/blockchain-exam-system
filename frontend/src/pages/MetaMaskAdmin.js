import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import MetaMaskMint from '../components/MetaMaskMint';
import SimpleMintTest from '../components/SimpleMintTest';
import StepByStepTest from '../components/StepByStepTest';
import WhitelistManager from '../components/WhitelistManager';
import CertificateViewer from '../components/CertificateViewer';

const MetaMaskAdmin = () => {
  const { 
    isConnected, 
    account, 
    contracts, 
    connectWallet, 
    isOwner, 
    ownerAddress 
  } = useWeb3();

  const [activeTab, setActiveTab] = useState('step-test');

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('MetaMask connected successfully!');
    } catch (error) {
      toast.error(`Failed to connect MetaMask: ${error.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MetaMask Admin Panel
        </h1>
        <p className="text-gray-600">
          Manage NFT certificates using MetaMask for enhanced security
        </p>
      </div>

      {/* Connection Status Banner */}
      <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <h3 className="font-semibold">
                {isConnected ? 'MetaMask Connected' : 'MetaMask Not Connected'}
              </h3>
              <p className="text-sm text-gray-600">
                {isConnected 
                  ? `Account: ${account?.slice(0, 6)}...${account?.slice(-4)}`
                  : 'Connect MetaMask to start minting NFTs'
                }
              </p>
            </div>
          </div>
          
          {!isConnected && (
            <button
              onClick={handleConnect}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Connect MetaMask
            </button>
          )}
        </div>

        {/* Owner Status */}
        {isConnected && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Contract Owner Status:</span>
                <span className={`ml-2 text-sm ${isOwner ? 'text-green-600' : 'text-red-600'}`}>
                  {isOwner ? '✅ You are the owner' : '❌ You are not the owner'}
                </span>
              </div>
              {ownerAddress && (
                <span className="text-xs text-gray-500">
                  Owner: {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
                </span>
              )}
            </div>
            
            {!isOwner && isConnected && (
              <div className="mt-2 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Only the contract owner can mint NFTs. 
                  Please switch to the owner account in MetaMask.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('step-test')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'step-test'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Step Test
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'test'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Simple Test
          </button>
          <button
            onClick={() => setActiveTab('mint')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mint'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mint NFT
          </button>
          <button
            onClick={() => setActiveTab('whitelist')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'whitelist'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Whitelist
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'certificates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            View Certificates
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md">
        {activeTab === 'step-test' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step-by-Step Test</h2>
              <p className="text-gray-600">
                Run comprehensive tests to identify and fix minting issues
              </p>
            </div>
            <StepByStepTest />
          </div>
        )}
        
        {activeTab === 'test' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple Mint Test</h2>
              <p className="text-gray-600">
                Test MetaMask minting with hardcoded parameters to verify functionality
              </p>
            </div>
            <SimpleMintTest />
          </div>
        )}
        
        {activeTab === 'mint' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mint NFT Certificate</h2>
              <p className="text-gray-600">
                Create new NFT certificates for students using MetaMask
              </p>
            </div>
            <MetaMaskMint />
          </div>
        )}

        {activeTab === 'whitelist' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Whitelist</h2>
              <p className="text-gray-600">
                Add or remove students from the whitelist
              </p>
            </div>
            
            {!isConnected ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Connect MetaMask to manage whitelist</p>
                <button
                  onClick={handleConnect}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Connect MetaMask
                </button>
              </div>
            ) : !isOwner ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">Only contract owner can manage whitelist</p>
                <p className="text-sm text-gray-500">Switch to owner account in MetaMask</p>
              </div>
            ) : (
              <WhitelistManager />
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">View Certificates</h2>
              <p className="text-gray-600">
                Browse all minted NFT certificates
              </p>
            </div>
            
            <CertificateViewer />
          </div>
        )}
      </div>

      {/* Features Comparison */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">MetaMask Benefits</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✅ Enhanced security - private key stays in your wallet</li>
            <li>✅ Full control over transactions</li>
            <li>✅ No server-side private key management</li>
            <li>✅ Transparent transaction approval</li>
            <li>✅ Works with any Ethereum wallet</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3">Best Practices</h3>
          <ul className="text-sm text-green-700 space-y-2">
            <li>🔒 Keep your private key secure</li>
            <li>💰 Ensure sufficient ETH for gas fees</li>
            <li>✅ Double-check transaction details</li>
            <li>📱 Use hardware wallet for large amounts</li>
            <li>🔄 Keep MetaMask updated</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('mint')}
            className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Mint New NFT</div>
            <div className="text-sm text-gray-500">Create certificate for student</div>
          </button>
          
          <button
            onClick={() => window.open('https://metamask.io', '_blank')}
            className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Get MetaMask</div>
            <div className="text-sm text-gray-500">Download wallet extension</div>
          </button>
          
          <button
            onClick={() => window.open('https://ganache.com', '_blank')}
            className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Setup Ganache</div>
            <div className="text-sm text-gray-500">Local blockchain for testing</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskAdmin; 