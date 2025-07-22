import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import MetaMaskMint from '../components/MetaMaskMint';

const AdminHybrid = () => {
  const { contracts } = useWeb3();
  const [mintingMethod, setMintingMethod] = useState('backend'); // 'backend' or 'metamask'
  const [isMinting, setIsMinting] = useState(false);
  const [formData, setFormData] = useState({
    studentWallet: '',
    studentId: '',
    subject: '',
    examSession: '',
    ipAddress: '',
    tokenURI: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Backend minting (existing functionality)
  const mintWithBackend = async (e) => {
    e.preventDefault();
    setIsMinting(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('NFT minted successfully via backend!');
        setFormData({
          studentWallet: '',
          studentId: '',
          subject: '',
          examSession: '',
          ipAddress: '',
          tokenURI: ''
        });
      } else {
        toast.error(`Backend minting failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Backend minting error:', error);
      toast.error(`Backend minting failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Hybrid Minting</h1>
      
      {/* Minting Method Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Choose Minting Method:</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setMintingMethod('backend')}
            className={`px-4 py-2 rounded-md ${
              mintingMethod === 'backend'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Backend Ký (Auto)
          </button>
          <button
            onClick={() => setMintingMethod('metamask')}
            className={`px-4 py-2 rounded-md ${
              mintingMethod === 'metamask'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            MetaMask Ký (Manual)
          </button>
        </div>
      </div>

      {/* Method Description */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        {mintingMethod === 'backend' ? (
          <div>
            <h3 className="font-semibold text-green-700">Backend Ký (Recommended for Batch Operations)</h3>
            <ul className="mt-2 text-sm text-gray-600">
              <li>✅ Tự động - không cần approve từng transaction</li>
              <li>✅ Phù hợp cho minting hàng loạt</li>
              <li>✅ UX đơn giản - 1 click</li>
              <li>⚠️ Private key lưu ở server (cần bảo mật)</li>
            </ul>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-blue-700">MetaMask Ký (Recommended for Security)</h3>
            <ul className="mt-2 text-sm text-gray-600">
              <li>✅ Bảo mật cao - private key ở client</li>
              <li>✅ Admin kiểm soát hoàn toàn</li>
              <li>✅ Không cần setup private key ở server</li>
              <li>⚠️ Phải approve từng transaction</li>
            </ul>
          </div>
        )}
      </div>

      {/* Minting Form */}
      {mintingMethod === 'backend' ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Mint NFT via Backend</h2>
          
          <form onSubmit={mintWithBackend} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student Wallet
                </label>
                <input
                  type="text"
                  name="studentWallet"
                  value={formData.studentWallet}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="STU001"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Blockchain Development"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Session
                </label>
                <input
                  type="text"
                  name="examSession"
                  value={formData.examSession}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="2024"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IP Address
                </label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="127.0.0.1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Token URI
                </label>
                <input
                  type="text"
                  name="tokenURI"
                  value={formData.tokenURI}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://ipfs.io/ipfs/QmTest123..."
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isMinting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isMinting ? 'Minting via Backend...' : 'Mint NFT via Backend'}
            </button>
          </form>
        </div>
      ) : (
        <MetaMaskMint />
      )}

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Batch Operations</h3>
          <p className="text-sm text-blue-600 mt-1">Use Backend ký for minting multiple NFTs at once</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Security First</h3>
          <p className="text-sm text-green-600 mt-1">Use MetaMask ký for critical operations</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Flexible Choice</h3>
          <p className="text-sm text-purple-600 mt-1">Switch between methods based on your needs</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHybrid; 