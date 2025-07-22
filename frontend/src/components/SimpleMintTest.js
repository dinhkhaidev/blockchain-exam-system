import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const SimpleMintTest = () => {
  const { contracts, account, isConnected } = useWeb3();
  const [isMinting, setIsMinting] = useState(false);

  const testMint = async () => {
    if (!isConnected || !contracts.examCertificateNFT) {
      toast.error('Please connect MetaMask and ensure contract is available');
      return;
    }

    setIsMinting(true);
    
    try {
      console.log('🧪 Starting simple mint test...');
      
      const contract = contracts.examCertificateNFT;
      console.log('📋 Contract address:', contract.target);
      
      // Test parameters
      const testParams = [
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // studentWallet
        'TEST001', // studentId
        'Blockchain Development', // subject
        '2024', // examSession
        '127.0.0.1', // ipAddress
        'https://ipfs.io/ipfs/QmTest123' // tokenURI
      ];
      
      console.log('📋 Test parameters:', testParams);
      
      // Check owner first
      const owner = await contract.owner();
      console.log('👑 Contract owner:', owner);
      console.log('👤 Current account:', account);
      
      if (owner.toLowerCase() !== account.toLowerCase()) {
        toast.error('You are not the contract owner');
        return;
      }
      
      // Try gas estimation
      console.log('⛽ Estimating gas...');
      const gasEstimate = await contract.mintCertificate.estimateGas(...testParams);
      console.log('⛽ Gas estimate:', gasEstimate.toString());
      
      // Try minting
      console.log('🚀 Attempting to mint...');
      const tx = await contract.mintCertificate(...testParams, {
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      });
      
      console.log('📤 Transaction sent:', tx.hash);
      toast.info('Transaction sent! Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      toast.success('NFT minted successfully!');
      
    } catch (error) {
      console.error('❌ Mint test failed:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction was rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fee');
      } else if (error.message.includes('already has NFT')) {
        toast.error('Student already has an NFT certificate');
      } else if (error.message.includes('Not owner')) {
        toast.error('Only contract owner can mint NFTs');
      } else {
        toast.error(`Minting failed: ${error.message}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Simple Mint Test</h2>
      
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          This is a simple test to verify MetaMask minting works with hardcoded parameters.
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Test Parameters:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Student Wallet: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8</li>
          <li>• Student ID: TEST001</li>
          <li>• Subject: Blockchain Development</li>
          <li>• Exam Session: 2024</li>
          <li>• IP Address: 127.0.0.1</li>
          <li>• Token URI: https://ipfs.io/ipfs/QmTest123</li>
        </ul>
      </div>
      
      <button
        onClick={testMint}
        disabled={!isConnected || isMinting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isMinting ? 'Testing...' : 'Test Mint NFT'}
      </button>
      
      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            Please connect MetaMask first
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleMintTest; 