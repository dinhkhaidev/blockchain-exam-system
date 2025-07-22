import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ExamRegistrationABI from '../contracts/ExamRegistration.json';
import ExamCertificateNFTABI from '../contracts/ExamCertificateNFT.json';
import contractAddresses from '../contracts/contract-address.json';

console.log("==== DEBUG CONTRACT ADDRESS ====");
console.log("ExamRegistration:", contractAddresses.ExamRegistration);
console.log("ExamCertificateNFT:", contractAddresses.ExamCertificateNFT);
console.log("==== DEBUG RPC URL ====");
console.log("RPC URL (should be http://127.0.0.1:7545):", 'http://127.0.0.1:7545');

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState({});
  const [userType, setUserType] = useState(null); // 'owner' or 'student'
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerAddress, setOwnerAddress] = useState(null);

  // Contract addresses - read from file
  const EXAM_REGISTRATION_ADDRESS = contractAddresses.ExamRegistration;
  const EXAM_CERTIFICATE_NFT_ADDRESS = contractAddresses.ExamCertificateNFT;

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);
          setIsConnected(true);
          
          // Initialize contracts
          await initializeContracts(account);
          
          // Check if user is owner
          await checkOwnerStatus(account);
          
          return account;
        }
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setContracts({});
    setUserType(null);
    setIsOwner(false);
    setOwnerAddress(null);
    
    // Clear from localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('userType');
  };

  const initializeContracts = async (account) => {
    try {
      console.log('🔄 Initializing contracts...');
      
      // Lấy contract address và ABI
      const contractAddresses = require('../contracts/contract-address.json');
      const ExamRegistration = require('../contracts/ExamRegistration.json');
      const ExamCertificateNFT = require('../contracts/ExamCertificateNFT.json');

      console.log('📋 Contract addresses:', contractAddresses);
      console.log('📋 ExamRegistration ABI length:', ExamRegistration.abi.length);

      // ethers v6: Dùng JsonRpcProvider cho read-only (như script test)
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
      
      // Khởi tạo BrowserProvider và signer cho write operations
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      console.log('👤 Signer address:', await signer.getAddress());

      // Khởi tạo contract với JsonRpcProvider cho read-only functions
      const examRegistrationContractRead = new ethers.Contract(
        contractAddresses.ExamRegistration,
        ExamRegistration.abi,
        provider
      );
      
      // Khởi tạo contract với signer cho write functions
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

      console.log('📋 NFT Contract address:', examCertificateNFTContract.target);
      console.log('📋 NFT Contract interface:', examCertificateNFTContract.interface);
      
      // Check if functions exist before calling Object.keys
      if (examCertificateNFTContract.interface && examCertificateNFTContract.interface.functions) {
        console.log('📋 NFT Contract functions:', Object.keys(examCertificateNFTContract.interface.functions));
      } else {
        console.log('⚠️ NFT Contract functions not available');
      }

      console.log('✅ Contracts initialized successfully');
      console.log('📋 Read contract address:', examRegistrationContractRead.target);
      console.log('📋 Write contract address:', examRegistrationContractWrite.target);

      // Validate contract interfaces
      console.log('🔄 Validating contract interfaces...');
      
      if (!examRegistrationContractRead.interface) {
        throw new Error('ExamRegistration contract interface is null');
      }
      
      if (!examRegistrationContractWrite.interface) {
        throw new Error('ExamRegistrationWrite contract interface is null');
      }
      
      if (!examCertificateNFTContract.interface) {
        throw new Error('ExamCertificateNFT contract interface is null');
      }
      
      console.log('✅ All contract interfaces are valid');

      setContracts({
        examRegistration: examRegistrationContractRead, // Dùng JsonRpcProvider cho read
        examRegistrationWrite: examRegistrationContractWrite, // Dùng signer cho write
        examCertificateNFT: examCertificateNFTContract
      });
    } catch (error) {
      console.error('❌ Error initializing contracts:', error);
      console.error('❌ Error details:', error.message);
    }
  };

  const checkOwnerStatus = async (account) => {
    try {
      console.log('🔍 Checking owner status for account:', account);
      console.log('📋 Contracts object:', contracts);
      console.log('📋 ExamRegistration contract:', contracts.examRegistration);
      
      let isOwnerAccount = false;
      
      if (contracts.examRegistration) {
        // ethers v6: .target là địa chỉ contract
        console.log('📋 Contract address:', contracts.examRegistration.target);
        
        // Kiểm tra functions trước khi gọi Object.keys
        if (contracts.examRegistration.functions) {
          console.log('📋 Contract functions:', Object.keys(contracts.examRegistration.functions));
        } else {
          console.log('⚠️ Contract functions not available');
        }
        
        // Kiểm tra xem có hàm owner() không
        console.log('📋 Available methods:', Object.getOwnPropertyNames(contracts.examRegistration));
        console.log('📋 Contract interface:', contracts.examRegistration.interface);
        
        try {
          console.log('🔄 Calling owner() function...');
          const owner = await contracts.examRegistration.owner();
          console.log('👑 Contract owner:', owner);
          setOwnerAddress(owner);
          isOwnerAccount = owner.toLowerCase() === account.toLowerCase();
          console.log('✅ Is registration owner:', isOwnerAccount);
        } catch (ownerError) {
          console.error('❌ Error calling owner() function:', ownerError);
          console.error('❌ Error message:', ownerError.message);
          console.error('❌ Error code:', ownerError.code);
          console.error('❌ Error data:', ownerError.data);
        }
      } else {
        console.log('⚠️ Contracts not initialized yet');
      }

      // Also check NFT contract owner
      if (contracts.examCertificateNFT) {
        try {
          console.log('🔄 Checking NFT contract owner...');
          const nftOwner = await contracts.examCertificateNFT.owner();
          console.log('👑 NFT Contract owner:', nftOwner);
          const isNFTOwner = nftOwner.toLowerCase() === account.toLowerCase();
          console.log('✅ Is NFT owner:', isNFTOwner);
          
          // If user is NFT owner, allow minting
          if (isNFTOwner) {
            console.log('✅ User is NFT contract owner, allowing minting');
            isOwnerAccount = true;
          }
        } catch (nftOwnerError) {
          console.error('❌ Error checking NFT contract owner:', nftOwnerError);
        }
      }

      // Set owner status
      console.log('🎯 Final owner status:', isOwnerAccount);
      setIsOwner(isOwnerAccount);
      
      // Set user type - auto-set to owner if user is actually owner
      const savedUserType = localStorage.getItem('userType');
      if (isOwnerAccount) {
        console.log('✅ User is owner, setting userType to owner');
        setUserType('owner');
        localStorage.setItem('userType', 'owner');
      } else if (!savedUserType) {
        setUserType('student');
        localStorage.setItem('userType', 'student');
      }
      
    } catch (error) {
      console.error('❌ Error checking owner status:', error);
    }
  };

  const isStudentWhitelisted = async (studentAddress) => {
    try {
      if (contracts.examRegistration) {
        return await contracts.examRegistration.isStudentWhitelisted(studentAddress);
      }
      return false;
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      return false;
    }
  };

  // Owner functions
  const addStudentToWhitelist = async (studentAddress) => {
    try {
      console.log('🔄 Adding student to whitelist:', studentAddress);
      console.log('📋 isOwner:', isOwner);
      console.log('📋 contracts.examRegistrationWrite:', contracts.examRegistrationWrite);
      console.log('📋 contracts object keys:', Object.keys(contracts));
      
      if (!isOwner) {
        throw new Error('Chỉ owner mới có thể thêm sinh viên vào whitelist');
      }
      
      if (!contracts.examRegistrationWrite) {
        console.error('❌ Contract write not initialized');
        console.error('❌ Available contracts:', Object.keys(contracts));
        throw new Error('Contract write chưa được khởi tạo');
      }
      
      // Kiểm tra contract deployment trước
      try {
        console.log('🔄 Checking contract deployment...');
        const contractAddress = contracts.examRegistration.target;
        console.log('📋 Contract address:', contractAddress);
        
        // Test basic contract functions
        const whitelistCount = await contracts.examRegistration.whitelistCount();
        console.log('📋 Whitelist count:', whitelistCount.toString());
        
        // Test owner function
        const owner = await contracts.examRegistration.owner();
        console.log('📋 Contract owner:', owner);
        
      } catch (deploymentError) {
        console.error('❌ Contract deployment check failed:', deploymentError.message);
        throw new Error('Contract chưa được deploy đúng hoặc không thể kết nối');
      }
      
      // Validate address format
      if (!studentAddress || studentAddress.trim() === '') {
        throw new Error('Địa chỉ ví không được để trống');
      }
      
      if (!/^0x[a-fA-F0-9]{40}$/.test(studentAddress)) {
        throw new Error('Địa chỉ ví không hợp lệ. Vui lòng nhập địa chỉ Ethereum hợp lệ.');
      }
      
      // Check contract owner first
      try {
        const contractOwner = await contracts.examRegistration.owner();
        const currentSigner = await contracts.examRegistrationWrite.runner.getAddress();
        console.log('👑 Contract owner:', contractOwner);
        console.log('👤 Current signer:', currentSigner);
        console.log('✅ Is signer owner?', contractOwner.toLowerCase() === currentSigner.toLowerCase());
        
        if (contractOwner.toLowerCase() !== currentSigner.toLowerCase()) {
          throw new Error('Chỉ owner mới có thể thêm sinh viên vào whitelist');
        }
      } catch (ownerError) {
        console.error('❌ Error checking contract owner:', ownerError.message);
        console.error('❌ Error details:', ownerError);
        
        // Thử kiểm tra contract có tồn tại không
        try {
          console.log('🔄 Testing contract existence...');
          const contractAddress = contracts.examRegistration.target;
          console.log('📋 Contract address:', contractAddress);
          
          // Thử gọi một function đơn giản
          const whitelistCount = await contracts.examRegistration.whitelistCount();
          console.log('📋 Whitelist count:', whitelistCount.toString());
          
        } catch (testError) {
          console.error('❌ Contract test failed:', testError.message);
          throw new Error('Contract không hoạt động hoặc chưa được deploy đúng');
        }
        
        throw new Error('Không thể kiểm tra quyền owner');
      }
      
      // Check if student is already whitelisted
      try {
        const isAlreadyWhitelisted = await contracts.examRegistration.isStudentWhitelisted(studentAddress);
        if (isAlreadyWhitelisted) {
          throw new Error('Sinh viên này đã có trong whitelist rồi');
        }
      } catch (checkError) {
        console.log('⚠️ Could not check whitelist status:', checkError.message);
      }
      
      // Kiểm tra signer
      const signer = contracts.examRegistrationWrite.runner;
      console.log('📋 Signer:', signer);
      console.log('📋 Signer address:', await signer.getAddress());
      
      // Test contract function exists
      try {
        console.log('🔄 Testing contract function...');
        const functionExists = contracts.examRegistrationWrite.interface.hasFunction('addStudentToWhitelist');
        console.log('📋 Function exists:', functionExists);
        
        if (!functionExists) {
          throw new Error('Contract function addStudentToWhitelist không tồn tại');
        }
      } catch (testError) {
        console.error('❌ Error testing contract function:', testError.message);
        throw new Error('Contract không có function addStudentToWhitelist');
      }
      
      console.log('🔄 Calling addStudentToWhitelist...');
      
      // Thêm gas limit và options
      const tx = await contracts.examRegistrationWrite.addStudentToWhitelist(studentAddress, {
        gasLimit: 300000 // Tăng gas limit
      });
      console.log('📋 Transaction sent:', tx.hash);
      
      console.log('🔄 Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed! Block:', receipt.blockNumber);
      
      return true;
    } catch (error) {
      console.error('❌ Error adding student to whitelist:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error data:', error.data);
      
      // Provide specific error messages
      console.error('❌ Transaction error details:', {
        code: error.code,
        message: error.message,
        data: error.data,
        reason: error.reason
      });
      
      if (error.code === 'UNSUPPORTED_OPERATION') {
        throw new Error('Lỗi kết nối MetaMask. Vui lòng kiểm tra kết nối và thử lại.');
      } else if (error.message.includes('Student already whitelisted') || 
                 error.message.includes('Student already whitelisted')) {
        throw new Error('Sinh viên này đã có trong whitelist rồi');
      } else if (error.message.includes('Invalid address')) {
        throw new Error('Địa chỉ ví không hợp lệ');
      } else if (error.message.includes('caller is not the owner')) {
        throw new Error('Chỉ owner mới có thể thêm sinh viên vào whitelist');
      } else if (error.message.includes('missing revert data') || error.message.includes('execution reverted')) {
        // Try to check if student is already whitelisted
        try {
          const isAlreadyWhitelisted = await contracts.examRegistration.isStudentWhitelisted(studentAddress);
          if (isAlreadyWhitelisted) {
            throw new Error('Sinh viên này đã có trong whitelist rồi');
          }
        } catch (checkError) {
          console.log('⚠️ Could not check whitelist status:', checkError.message);
        }
        
        // Check if signer is owner
        try {
          const contractOwner = await contracts.examRegistration.owner();
          const currentSigner = await contracts.examRegistrationWrite.runner.getAddress();
          if (contractOwner.toLowerCase() !== currentSigner.toLowerCase()) {
            throw new Error('Chỉ owner mới có thể thêm sinh viên vào whitelist');
          }
        } catch (ownerCheckError) {
          console.log('⚠️ Could not check owner status:', ownerCheckError.message);
        }
        
        throw new Error('Lỗi giao dịch: Thiếu dữ liệu revert. Vui lòng kiểm tra lại quyền owner và địa chỉ ví.');
      } else {
        throw new Error(`Lỗi thêm sinh viên vào whitelist: ${error.message}`);
      }
    }
  };

  const removeStudentFromWhitelist = async (studentAddress) => {
    try {
      console.log('🔄 Removing student from whitelist:', studentAddress);
      
      if (!isOwner) {
        throw new Error('Chỉ owner mới có thể xóa sinh viên khỏi whitelist');
      }
      
      if (!contracts.examRegistrationWrite) {
        throw new Error('Contract write chưa được khởi tạo');
      }
      
      const tx = await contracts.examRegistrationWrite.removeStudentFromWhitelist(studentAddress);
      const receipt = await tx.wait();
      console.log('✅ Student removed from whitelist! Block:', receipt.blockNumber);
      return true;
    } catch (error) {
      console.error('❌ Error removing student from whitelist:', error);
      throw error;
    }
  };

  const addMultipleStudentsToWhitelist = async (studentAddresses) => {
    try {
      console.log('🔄 Adding multiple students to whitelist:', studentAddresses);
      
      if (!isOwner) {
        throw new Error('Chỉ owner mới có thể thêm sinh viên vào whitelist');
      }
      
      if (!contracts.examRegistrationWrite) {
        throw new Error('Contract write chưa được khởi tạo');
      }
      
      const tx = await contracts.examRegistrationWrite.addMultipleStudentsToWhitelist(studentAddresses);
      const receipt = await tx.wait();
      console.log('✅ Multiple students added to whitelist! Block:', receipt.blockNumber);
      return true;
    } catch (error) {
      console.error('❌ Error adding multiple students to whitelist:', error);
      throw error;
    }
  };

  const getWhitelistedStudents = async () => {
    try {
      if (contracts.examRegistration) {
        // This would need to be implemented in the contract
        // For now, we'll return an empty array
        return [];
      }
      return [];
    } catch (error) {
      console.error('Error getting whitelisted students:', error);
      return [];
    }
  };

  // Set user type manually (for testing)
  const setUserTypeManually = (type) => {
    setUserType(type);
    localStorage.setItem('userType', type);
  };

  const forceRefreshOwnerStatus = async () => {
    if (account) {
      console.log('🔄 Force refreshing owner status...');
      // Clear localStorage to force re-check
      localStorage.removeItem('userType');
      await checkOwnerStatus(account);
    }
  };

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts.length > 0) {
            const account = accounts[0];
            setAccount(account);
            setIsConnected(true);
            localStorage.setItem('walletConnected', 'true');
            
            await initializeContracts(account);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);
          setIsConnected(true);
          localStorage.setItem('walletConnected', 'true');
          
          await initializeContracts(account);
        } else {
          disconnectWallet();
        }
      });

      // Listen for disconnect
      window.ethereum.on('disconnect', () => {
        disconnectWallet();
      });
    }
  }, []);

  // Check owner status when contracts change
  useEffect(() => {
    if (contracts.examRegistration && account) {
      // Add a small delay to ensure contracts are fully ready
      const timer = setTimeout(() => {
        checkOwnerStatus(account);
      }, 1000); // Increased delay
      
      return () => clearTimeout(timer);
    }
  }, [contracts.examRegistration, account]);

  // Also check when NFT contract is available
  useEffect(() => {
    if (contracts.examCertificateNFT && account) {
      const timer = setTimeout(async () => {
        try {
          console.log('🔄 Checking NFT contract owner status...');
          const nftOwner = await contracts.examCertificateNFT.owner();
          const isNFTOwner = nftOwner.toLowerCase() === account.toLowerCase();
          console.log('👑 NFT Contract owner:', nftOwner);
          console.log('👤 Current account:', account);
          console.log('✅ Is NFT owner:', isNFTOwner);
          
          if (isNFTOwner && !isOwner) {
            console.log('✅ Setting user as owner (NFT contract)');
            setIsOwner(true);
          }
        } catch (error) {
          console.error('❌ Error checking NFT owner status:', error);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [contracts.examCertificateNFT, account]);

  const value = {
    isConnected,
    account,
    contracts,
    userType,
    isOwner,
    isLoading,
    ownerAddress,
    connectWallet,
    disconnectWallet,
    isStudentWhitelisted,
    addStudentToWhitelist,
    removeStudentFromWhitelist,
    addMultipleStudentsToWhitelist,
    getWhitelistedStudents,
    setUserTypeManually,
    forceRefreshOwnerStatus,
    // Export contracts for components
    examRegistrationWrite: contracts.examRegistrationWrite,
    examCertificateNFT: contracts.examCertificateNFT,
    // Also export the full contracts object for backward compatibility
    examRegistration: contracts.examRegistration
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}; 
 
 
 