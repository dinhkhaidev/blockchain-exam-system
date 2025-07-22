import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const MetaMaskMint = () => {
  const { 
    isConnected, 
    account, 
    contracts, 
    connectWallet, 
    isOwner, 
    ownerAddress 
  } = useWeb3();
  
  const [isMinting, setIsMinting] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(false);
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

  const checkOwnerStatus = async () => {
    if (!isConnected || !contracts.examCertificateNFT) {
      toast.error('Please connect MetaMask first');
      return false;
    }

    setIsCheckingOwner(true);
    try {
      const signerAddress = account;
      const contractOwner = await contracts.examCertificateNFT.owner();
      
      console.log('🔍 Signer address:', signerAddress);
      console.log('👑 Contract owner:', contractOwner);
      
      const isOwnerAccount = signerAddress.toLowerCase() === contractOwner.toLowerCase();
      
      if (!isOwnerAccount) {
        toast.error('Only contract owner can mint NFTs');
        return false;
      }
      
      toast.success('Owner verification successful!');
      return true;
    } catch (error) {
      console.error('❌ Owner check error:', error);
      toast.error(`Owner verification failed: ${error.message}`);
      return false;
    } finally {
      setIsCheckingOwner(false);
    }
  };

  const mintWithMetaMask = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect MetaMask first');
      return;
    }

    if (!contracts.examCertificateNFT) {
      toast.error('NFT contract not available');
      return;
    }

    // Check owner status first
    const isOwnerVerified = await checkOwnerStatus();
    if (!isOwnerVerified) {
      return;
    }

    setIsMinting(true);
    
    try {
      console.log('🚀 Starting MetaMask minting...');
      console.log('📋 Form data:', formData);
      
      // Validate form data
      if (!formData.studentWallet || !formData.studentId || !formData.subject) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate wallet address
      if (!formData.studentWallet.startsWith('0x') || formData.studentWallet.length !== 42) {
        toast.error('Invalid student wallet address');
        return;
      }

      // Get signer from MetaMask
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      console.log('👤 Current signer:', accounts[0]);
      
      // Create contract with signer
      const contractWithSigner = contracts.examCertificateNFT;
      
      console.log('📋 Contract with signer:', contractWithSigner);
      console.log('📋 Contract address:', contractWithSigner.target);
      
      // Prepare transaction parameters
      const mintParams = [
        formData.studentWallet,
        formData.studentId,
        formData.subject,
        formData.examSession,
        formData.ipAddress,
        formData.tokenURI
      ];
      
      console.log('📋 Mint parameters:', mintParams);
      
      // Estimate gas first
      console.log('⛽ Estimating gas...');
      const gasEstimate = await contractWithSigner.mintCertificate.estimateGas(...mintParams);
      console.log('⛽ Gas estimate:', gasEstimate.toString());
      
      // Calculate gas limit with buffer
      const gasLimit = typeof gasEstimate.mul === 'function' 
        ? gasEstimate.mul(120).div(100)
        : Math.floor(Number(gasEstimate) * 1.2);
      
      // Prepare transaction
      console.log('📝 Preparing transaction...');
      const tx = await contractWithSigner.mintCertificate(
        formData.studentWallet,
        formData.studentId,
        formData.subject,
        formData.examSession,
        formData.ipAddress,
        formData.tokenURI,
        {
          gasLimit: gasLimit // Add 20% buffer
        }
      );
      
      console.log('📤 Transaction sent:', tx.hash);
      toast.info('Transaction sent! Waiting for confirmation...');
      
      // Wait for confirmation
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed:', receipt);
      
      // Get token ID from event
      let tokenId = null;
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          const transferEvent = receipt.logs.find(log => 
            log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
          );
          if (transferEvent) {
            tokenId = parseInt(transferEvent.topics[3], 16);
          }
        } catch (error) {
          console.log('⚠️ Could not parse token ID from event');
        }
      }
      
      toast.success(`NFT minted successfully!${tokenId ? ` Token ID: ${tokenId}` : ''}`);
      
      // Reset form
      setFormData({
        studentWallet: '',
        studentId: '',
        subject: '',
        examSession: '',
        ipAddress: '',
        tokenURI: ''
      });
      
    } catch (error) {
      console.error('❌ MetaMask minting error:', error);
      
      // Handle specific errors
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

  const connectAndMint = async () => {
    try {
      await connectWallet();
      toast.success('MetaMask connected successfully!');
    } catch (error) {
      toast.error(`Failed to connect MetaMask: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Mint NFT with MetaMask</h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">MetaMask Status</h3>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
            {isConnected && account && (
              <p className="text-xs text-gray-500 mt-1">
                Account: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            )}
          </div>
          {!isConnected && (
            <button
              onClick={connectAndMint}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Connect MetaMask
            </button>
          )}
        </div>
        
        {/* Owner Status */}
        {isConnected && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Owner Status:</span>
              <span className={`text-sm ${isOwner ? 'text-green-600' : 'text-red-600'}`}>
                {isOwner ? '✅ Owner' : '❌ Not Owner'}
              </span>
            </div>
            {ownerAddress && (
              <p className="text-xs text-gray-500 mt-1">
                Contract Owner: {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Minting Form */}
      <form onSubmit={mintWithMetaMask} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Student Wallet *
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
            Student ID *
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject *
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
          />
        </div>
        
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
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={checkOwnerStatus}
            disabled={!isConnected || isCheckingOwner}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          >
            {isCheckingOwner ? 'Checking...' : 'Check Owner'}
          </button>
          
          <button
            type="submit"
            disabled={!isConnected || !isOwner || isMinting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isMinting ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      </form>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Connect MetaMask with owner account</li>
          <li>• Ensure you have enough ETH for gas fees</li>
          <li>• Approve transaction when MetaMask popup appears</li>
          <li>• Wait for transaction confirmation</li>
        </ul>
      </div>
      
      {/* Error Handling */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Note:</strong> You must connect MetaMask first to mint NFTs.
          </p>
        </div>
      )}
      
      {isConnected && !isOwner && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Note:</strong> Only contract owner can mint NFTs. 
            Make sure your MetaMask account is the contract owner.
          </p>
        </div>
      )}
    </div>
  );
};

export default MetaMaskMint; 