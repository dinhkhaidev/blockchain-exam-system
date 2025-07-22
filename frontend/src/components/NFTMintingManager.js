import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { FaCoins, FaCertificate, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const NFTMintingManager = () => {
  const { isConnected, isOwner, examCertificateNFT, contracts, forceRefreshOwnerStatus } = useWeb3();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [overview, setOverview] = useState({
    totalWhitelisted: 0,
    totalVerified: 0,
    totalRegistered: 0,
    totalNFTs: 0
  });


  useEffect(() => {
    if (isOwner) {
      loadPendingStudents();
      loadMintedNFTs();
    }
  }, [isOwner, contracts]);

  const loadOverview = async () => {
    if (!contracts || !contracts.examRegistration || !contracts.examCertificateNFT) return;
    try {
      // Lấy tổng số whitelist
      const totalWhitelisted = Number(await contracts.examRegistration.whitelistCount());
      // Lấy danh sách whitelist
      const whitelistedAddresses = await contracts.examRegistration.getWhitelistedAddresses();
      let totalVerified = 0;
      let totalRegistered = 0;
      for (const addr of whitelistedAddresses) {
        try {
          const isVerified = await contracts.examRegistration.isStudentVerified(addr);
          if (isVerified) totalVerified++;
          const isRegistered = await contracts.examRegistration.isStudentRegistered(addr);
          if (isRegistered) totalRegistered++;
        } catch (e) {}
      }
      // Lấy tổng số NFT đã mint
      const totalNFTs = Number(await contracts.examCertificateNFT.getTotalCertificates());
      setOverview({ totalWhitelisted, totalVerified, totalRegistered, totalNFTs });
    } catch (e) {
      setOverview({ totalWhitelisted: 0, totalVerified: 0, totalRegistered: 0, totalNFTs: 0 });
    }
  };

  useEffect(() => {
    if (isOwner && contracts.examRegistration && contracts.examCertificateNFT) {
      loadOverview();
    }
  }, [isOwner, contracts]);


  const loadPendingStudents = async () => {
    try {
      console.log('🔄 Loading pending students from API...');
      
      const response = await fetch('/api/nft/pending-mint');
      const data = await response.json();
      
      if (data.success) {
        console.log('📊 Pending students from API:', data.data.pendingStudents);
        setPendingStudents(data.data.pendingStudents);
      } else {
        console.error('Error loading pending students:', data.message);
        toast.error('Lỗi tải danh sách sinh viên chờ mint NFT');
      }
    } catch (error) {
      console.error('Error loading pending students:', error);
      toast.error('Lỗi kết nối server');
    }
  };

  const loadMintedNFTs = async () => {
    try {
      if (!contracts || !contracts.examCertificateNFT) {
        setMintedNFTs([]);
        return;
      }
      const contract = contracts.examCertificateNFT;
      const total = await contract.getTotalCertificates();
      const nfts = [];
      for (let i = 1; i <= Number(total); i++) {
        try {
          const info = await contract.getExamInfo(i);
          const owner = await contract.ownerOf(i);
          const tokenURI = await contract.tokenURI(i);
          nfts.push({
            tokenId: i.toString(),
            owner,
            studentId: info.studentId,
            subject: info.subject,
            examSession: info.examSession,
            examDate: Number(info.examDate) * 1000 ? new Date(Number(info.examDate) * 1000) : null,
            verificationTime: Number(info.verificationTime) * 1000 ? new Date(Number(info.verificationTime) * 1000) : null,
            ipAddress: info.ipAddress,
            isValid: info.isValid,
            tokenURI,
            mintDate: Number(info.examDate) * 1000 ? new Date(Number(info.examDate) * 1000) : null
          });
        } catch (err) {
          // Có thể token đã bị burn hoặc lỗi, bỏ qua
          continue;
        }
      }
      setMintedNFTs(nfts);
    } catch (error) {
      console.error('Error loading minted NFTs from blockchain:', error);
      setMintedNFTs([]);
    }
  };

  const mintNFTForStudent = async (student) => {
    if (!isOwner) {
      toast.error('Chỉ owner mới có thể mint NFT!');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Minting NFT for student:', student.studentId);
      
      if (!examCertificateNFT) {
        throw new Error('NFT contract chưa được khởi tạo');
      }

      // Tạo token URI metadata
      const tokenURI = JSON.stringify({
        name: `Exam Certificate - ${student.studentId}`,
        description: `Certificate for ${student.subject} exam`,
        image: "https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Exam+Certificate",
        attributes: [
          {
            trait_type: "Student ID",
            value: student.studentId
          },
          {
            trait_type: "Subject",
            value: student.subject
          },
          {
            trait_type: "Exam Session",
            value: student.examSession
          },
          {
            trait_type: "Score",
            value: student.score.toString()
          },
          {
            trait_type: "Exam Date",
            value: student.examDate
          },
          {
            trait_type: "IP Address",
            value: student.ipAddress
          }
        ]
      });

      console.log('📋 Token URI:', tokenURI);
      console.log('📋 Student data:', {
        wallet: student.studentWallet,
        studentId: student.studentId,
        subject: student.subject,
        examSession: student.examSession,
        ipAddress: student.ipAddress
      });

      // Validate data before minting
      if (!student.studentWallet || !student.studentId || !student.subject || !student.examSession) {
        throw new Error('Missing required student data for minting');
      }

      const tx = await examCertificateNFT.mintCertificate(
        student.studentWallet,
        student.studentId,
        student.subject,
        student.examSession,
        student.ipAddress || 'Unknown',
        student.score || 0,
        tokenURI
      );

      console.log('📋 Transaction hash:', tx.hash);
      toast.info('Đang xử lý giao dịch...');

      const receipt = await tx.wait();
      console.log('✅ NFT minted successfully! Block:', receipt.blockNumber);

      // Move student from pending to completed
      const completeResponse = await fetch(`http://localhost:3001/api/nft/complete-mint/${student.studentWallet}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: receipt.blockNumber.toString(), // Use block number as token ID
          mintDate: new Date().toISOString()
        }),
      });

      const completeData = await completeResponse.json();
      if (completeData.success) {
        console.log('✅ Student moved to completed list');
        toast.success(`NFT đã được mint thành công cho ${student.studentId}!`);
      } else {
        console.log('⚠️ Could not move to completed list:', completeData.message);
        toast.success(`NFT đã được mint thành công cho ${student.studentId}!`);
      }

      // Refresh data from API
      setTimeout(() => {
        loadPendingStudents();
        loadMintedNFTs();
      }, 1000);

    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);

      if (error.code === 'UNSUPPORTED_OPERATION') {
        toast.error('Lỗi kết nối MetaMask. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        toast.error('Lỗi mint NFT: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const mintAllNFTs = async () => {
    if (!isOwner) {
      toast.error('Chỉ owner mới có thể mint NFT!');
      return;
    }

    if (pendingStudents.length === 0) {
      toast.info('Không có sinh viên nào cần mint NFT!');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Minting NFTs for all pending students...');

      for (const student of pendingStudents) {
        await mintNFTForStudent(student);
        // Delay giữa các transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      toast.success(`Đã mint thành công ${pendingStudents.length} NFT!`);

    } catch (error) {
      console.error('❌ Error minting all NFTs:', error);
      toast.error('Lỗi mint tất cả NFT: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await loadPendingStudents();
      await loadMintedNFTs();
      toast.success('Đã cập nhật dữ liệu từ blockchain!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Lỗi cập nhật dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };



  const debugContracts = async () => {
    console.log('🔍 Debugging contracts...');
    console.log('📋 Web3Context contracts:', contracts);
    console.log('📋 examCertificateNFT:', examCertificateNFT);
    console.log('📋 isOwner state:', isOwner);
    
    // Check if user is owner
    if (examCertificateNFT) {
      try {
        const owner = await examCertificateNFT.owner();
        const currentUser = await contracts.provider.getSigner().getAddress();
        console.log('👑 Contract owner:', owner);
        console.log('👤 Current user address:', currentUser);
        console.log('✅ Is owner state:', isOwner);
        console.log('✅ Owner check:', owner.toLowerCase() === currentUser.toLowerCase());
        
        // Check if user has permission to mint
        if (owner.toLowerCase() === currentUser.toLowerCase()) {
          console.log('✅ User is owner, should be able to mint');
          if (!isOwner) {
            console.log('⚠️ isOwner state is false but user is actually owner');
            console.log('💡 Try clicking "Refresh Owner Status" button');
          }
        } else {
          console.log('❌ User is NOT owner, cannot mint');
          console.log('💡 Solution: Switch to owner account in MetaMask');
          console.log('💡 Owner account should be:', owner);
        }
      } catch (error) {
        console.log('❌ Error checking owner:', error.message);
      }
    }
    
    try {
      if (contracts.examRegistration) {
        console.log('✅ Exam registration contract available');
        const owner = await contracts.examRegistration.owner();
        console.log('👑 Contract owner:', owner);
        
        // Test with one address
        const testAddress = '0x4EE204518233e2e71025C75E59eF204435479844';
        const isRegistered = await contracts.examRegistration.isStudentRegistered(testAddress);
        const isVerified = await contracts.examRegistration.isStudentVerified(testAddress);
        const isWhitelisted = await contracts.examRegistration.isStudentWhitelisted(testAddress);
        
        console.log('🧪 Test results for', testAddress, {
          isRegistered, isVerified, isWhitelisted
        });
      } else {
        console.log('❌ Exam registration contract not available');
      }
      
      if (examCertificateNFT) {
        console.log('✅ NFT contract available');
        console.log('📋 NFT contract functions:', Object.keys(examCertificateNFT.interface.functions));
        
        // Test different ways to get total NFTs
        try {
          if (examCertificateNFT.totalSupply) {
            const totalSupply = await examCertificateNFT.totalSupply();
            console.log('🎨 Total supply:', totalSupply.toString());
          }
        } catch (error) {
          console.log('❌ Error getting totalSupply:', error.message);
        }
        
        try {
          if (examCertificateNFT.getTotalCertificates) {
            const totalCertificates = await examCertificateNFT.getTotalCertificates();
            console.log('🎨 Total certificates:', totalCertificates.toString());
          }
        } catch (error) {
          console.log('❌ Error getting getTotalCertificates:', error.message);
        }
        
        // Test minting function
        try {
          const hasMintFunction = examCertificateNFT.interface.hasFunction('mintCertificate');
          console.log('📋 Has mintCertificate function:', hasMintFunction);
        } catch (error) {
          console.log('❌ Error checking mint function:', error.message);
        }
      } else {
        console.log('❌ NFT contract not available');
      }
      
      // Test completeExam function
      if (contracts.examRegistrationWrite) {
        console.log('🔍 Testing completeExam function...');
        console.log('📋 Contract address:', contracts.examRegistrationWrite.target);
        console.log('📋 Available functions:', Object.keys(contracts.examRegistrationWrite.interface.functions));
        
        // Kiểm tra xem có function completeExam không
        const hasCompleteExam = contracts.examRegistrationWrite.interface.hasFunction('completeExam');
        console.log('📋 Has completeExam function:', hasCompleteExam);
        
        if (hasCompleteExam) {
          console.log('✅ completeExam function exists in ABI');
        } else {
          console.log('❌ completeExam function NOT found in ABI');
        }
      }
      
      toast.info('Debug info đã được ghi vào console');
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Lỗi debug: ' + error.message);
    }
  };

  const manualCreateTestData = async () => {
    if (!isOwner) {
      toast.error('Chỉ owner mới có thể tạo dữ liệu test!');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Manually creating test data...');
      
      const testAddress = '0x4EE204518233e2e71025C75E59eF204435479844';
      
      // Step 1: Check current status
      console.log(`\n📊 Step 1: Checking current status for ${testAddress}`);
      const isRegistered = await contracts.examRegistration.isStudentRegistered(testAddress);
      const isVerified = await contracts.examRegistration.isStudentVerified(testAddress);
      const isWhitelisted = await contracts.examRegistration.isStudentWhitelisted(testAddress);
      
      console.log('Current status:', { isRegistered, isVerified, isWhitelisted });
      
      // Step 2: Add to whitelist
      if (!isWhitelisted) {
        console.log(`\n📊 Step 2: Adding to whitelist...`);
        const tx1 = await contracts.examRegistrationWrite.addStudentToWhitelist(testAddress);
        console.log('Transaction sent:', tx1.hash);
        await tx1.wait();
        console.log('✅ Added to whitelist');
      } else {
        console.log('✅ Already whitelisted');
      }
      
      // Step 3: Register student
      if (!isRegistered) {
        console.log(`\n📊 Step 3: Registering student...`);
        const tx2 = await contracts.examRegistrationWrite.registerStudent(
          testAddress,
          'SV479844',
          'Lập trình Web',
          'Ca 1 (8:00 - 10:00)'
        );
        console.log('Transaction sent:', tx2.hash);
        await tx2.wait();
        console.log('✅ Registered for exam');
      } else {
        console.log('✅ Already registered');
      }
      
      // Step 4: Verify student
      if (!isVerified) {
        console.log(`\n📊 Step 4: Verifying student...`);
        const tx3 = await contracts.examRegistrationWrite.verifyStudentIdentity(
          testAddress,
          'SV479844',
          '192.168.1.100',
          'test_image_hash'
        );
        console.log('Transaction sent:', tx3.hash);
        await tx3.wait();
        console.log('✅ Verified');
      } else {
        console.log('✅ Already verified');
      }
      
      // Step 5: Complete exam
      console.log(`\n📊 Step 5: Completing exam...`);
      try {
        const tx4 = await contracts.examRegistrationWrite.completeExam(testAddress);
        console.log('Transaction sent:', tx4.hash);
        await tx4.wait();
        console.log('✅ Exam completed');
      } catch (error) {
        console.log('⚠️ Could not complete exam:', error.message);
      }
      
      // Step 6: Check final status
      console.log(`\n📊 Step 6: Checking final status...`);
      const finalRegistered = await contracts.examRegistration.isStudentRegistered(testAddress);
      const finalVerified = await contracts.examRegistration.isStudentVerified(testAddress);
      const finalWhitelisted = await contracts.examRegistration.isStudentWhitelisted(testAddress);
      
      console.log('Final status:', { 
        isRegistered: finalRegistered, 
        isVerified: finalVerified, 
        isWhitelisted: finalWhitelisted 
      });
      
      toast.success('Đã tạo dữ liệu test thủ công!');
      
      // Refresh data
      setTimeout(() => {
        loadPendingStudents();
        loadMintedNFTs();
      }, 2000);
      
    } catch (error) {
      console.error('Error creating test data manually:', error);
      toast.error('Lỗi tạo dữ liệu test: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateExamCompletion = async () => {
    if (!isOwner) {
      toast.error('Chỉ owner mới có thể simulate!');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Simulating exam completion...');
      
      const testAddresses = [
        '0x4EE204518233e2e71025C75E59eF204435479844',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      ];

      for (const address of testAddresses) {
        try {
          // Kiểm tra xem sinh viên đã đăng ký và xác minh chưa
          const isRegistered = await contracts.examRegistration.isStudentRegistered(address);
          const isVerified = await contracts.examRegistration.isStudentVerified(address);
          
          if (isRegistered && isVerified) {
            console.log(`🎯 Completing exam for ${address}...`);
            await contracts.examRegistrationWrite.completeExam(address);
            console.log(`✅ Exam completed for ${address}`);
          } else {
            console.log(`⚠️ Student ${address} not ready for exam completion`);
          }
          
        } catch (error) {
          console.log(`⚠️ Error completing exam for ${address}:`, error.message);
        }
      }
      
      toast.success('Đã simulate hoàn thành thi!');
      
      // Refresh data
      setTimeout(() => {
        loadPendingStudents();
        loadMintedNFTs();
      }, 2000);
      
    } catch (error) {
      console.error('Error simulating exam completion:', error);
      toast.error('Lỗi simulate: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testMinting = async () => {
    // Check owner status first
    try {
      if (examCertificateNFT) {
        const owner = await examCertificateNFT.owner();
        const currentUser = await contracts.provider.getSigner().getAddress();
        const isActuallyOwner = owner.toLowerCase() === currentUser.toLowerCase();
        
        if (!isActuallyOwner) {
          toast.error(`Bạn không phải là owner! Owner: ${owner}, Bạn: ${currentUser}`);
          console.log('❌ Owner mismatch detected');
          console.log('👑 Contract owner:', owner);
          console.log('👤 Current user:', currentUser);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error checking owner status:', error);
      toast.error('Lỗi kiểm tra quyền owner: ' + error.message);
      return;
    }

    if (!isOwner) {
      toast.error('Chỉ owner mới có thể test minting!');
      return;
    }

    try {
      console.log('🧪 Testing minting with simple data...');
      
      if (!examCertificateNFT) {
        throw new Error('NFT contract chưa được khởi tạo');
      }

      // Check contract details
      console.log('📋 NFT Contract address:', examCertificateNFT.target);
      console.log('📋 NFT Contract interface:', examCertificateNFT.interface);
      
      // Check if mintCertificate function exists
      const hasMintFunction = examCertificateNFT.interface.hasFunction('mintCertificate');
      console.log('📋 Has mintCertificate function:', hasMintFunction);
      
      if (hasMintFunction) {
        const mintFunction = examCertificateNFT.interface.getFunction('mintCertificate');
        console.log('📋 mintCertificate signature:', mintFunction.format());
        console.log('📋 mintCertificate inputs:', mintFunction.inputs);
      }

      // Check current user
      const currentUser = await contracts.provider.getSigner().getAddress();
      console.log('👤 Current user:', currentUser);
      
      // Check contract owner
      const contractOwner = await examCertificateNFT.owner();
      console.log('👑 Contract owner:', contractOwner);
      console.log('✅ Is current user owner:', currentUser.toLowerCase() === contractOwner.toLowerCase());

      // Simple test data - Use a different address that doesn't have NFT yet
      const testWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Different address
      const testStudentId = 'TEST456';
      const testSubject = 'Test Subject 2';
      const testSession = 'Test Session 2';
      const testIP = '127.0.0.1';
      const testURI = JSON.stringify({
        name: 'Test Certificate 2',
        description: 'Test certificate for debugging - second attempt'
      });

      console.log('🧪 Test data:', {
        wallet: testWallet,
        studentId: testStudentId,
        subject: testSubject,
        session: testSession,
        ip: testIP,
        uri: testURI
      });

      // Check if student already has NFT
      try {
        const existingTokenId = await examCertificateNFT.getTokenIdByWallet(testWallet);
        console.log('📋 Existing token ID for student:', existingTokenId.toString());
        if (existingTokenId > 0) {
          console.log('⚠️ Student already has NFT, this will fail');
        }
      } catch (error) {
        console.log('📋 No existing NFT for student');
      }

      // Try to estimate gas first
      try {
        console.log('🔄 Estimating gas...');
        const gasEstimate = await examCertificateNFT.mintCertificate.estimateGas(
          testWallet,
          testStudentId,
          testSubject,
          testSession,
          testIP,
          testURI
        );
        console.log('✅ Gas estimate:', gasEstimate.toString());
      } catch (estimateError) {
        console.error('❌ Gas estimate failed:', estimateError);
        console.error('❌ Estimate error details:', estimateError);
        throw new Error('Gas estimation failed: ' + estimateError.message);
      }

      // If gas estimation succeeds, try the actual transaction
      console.log('🔄 Starting mint transaction...');
      const tx = await examCertificateNFT.mintCertificate(
        testWallet,
        testStudentId,
        testSubject,
        testSession,
        testIP,
        testURI
      );

      console.log('✅ Test minting successful! Hash:', tx.hash);
      toast.success('Test minting thành công!');

    } catch (error) {
      console.error('❌ Test minting failed:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error data:', error.data);
      console.error('❌ Full error:', error);
      toast.error('Test minting thất bại: ' + error.message);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCertificate className="text-blue-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Kết nối ví để quản lý NFT
        </h2>
        <p className="text-gray-600">
          Vui lòng kết nối MetaMask để có thể mint NFT chứng nhận.
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCertificate className="text-red-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Không có quyền truy cập
        </h2>
        <p className="text-gray-600">
          Chỉ owner mới có thể mint NFT chứng nhận.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quản lý Mint NFT
            </h2>
            <p className="text-gray-600">
              Mint NFT chứng nhận cho sinh viên đã hoàn thành thi.
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaCertificate className="mr-2" />
            )}
            Cập nhật dữ liệu
          </button>
          <button
            onClick={debugContracts}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center ml-2"
          >
            Debug Contracts
          </button>
          <button
            onClick={async () => {
              await forceRefreshOwnerStatus();
              toast.info('Đã refresh owner status. Kiểm tra console để xem chi tiết.');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center ml-2"
          >
            Refresh Owner Status
          </button>
          {isOwner && (
            <button
              onClick={manualCreateTestData}
              disabled={isLoading}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center ml-2"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCertificate className="mr-2" />
              )}
              Tạo test data thủ công
            </button>
          )}
          {isOwner && (
            <button
              onClick={simulateExamCompletion}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center ml-2"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCertificate className="mr-2" />
              )}
              Simulate hoàn thành thi
            </button>
          )}
          {isOwner && (
            <button
              onClick={testMinting}
              disabled={isLoading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center ml-2"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCertificate className="mr-2" />
              )}
              Test Minting
            </button>
          )}
          <button
            onClick={debugContracts}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center ml-2"
          >
            Debug Contracts
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin hệ thống
        </h3>
        <p className="text-gray-600 mb-4">
          Hệ thống tự động thêm sinh viên vào danh sách chờ mint NFT khi họ hoàn thành thi. 
          Admin có thể mint NFT cho sinh viên từ danh sách "Sinh viên chờ mint NFT" bên dưới.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="font-semibold text-blue-800">Sinh viên (whitelist)</div>
            <div className="text-blue-600">{overview.totalWhitelisted}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <div className="font-semibold text-green-800">Xác minh</div>
            <div className="text-green-600">{overview.totalVerified}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="font-semibold text-purple-800">Kỳ thi (đã đăng ký)</div>
            <div className="text-purple-600">{overview.totalRegistered}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md">
            <div className="font-semibold text-yellow-800">NFT</div>
            <div className="text-yellow-600">{overview.totalNFTs}</div>
          </div>
        </div>
      </div>

      {/* Pending Students */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sinh viên chờ mint NFT ({pendingStudents.length})
          </h3>
          {pendingStudents.length > 0 && (
            <button
              onClick={mintAllNFTs}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCoins className="mr-2" />
              )}
              Mint tất cả
            </button>
          )}
        </div>

        {pendingStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Không có sinh viên nào cần mint NFT
          </p>
        ) : (
          <div className="space-y-4">
            {pendingStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold text-gray-900">{student.studentId}</p>
                      <p className="text-sm text-gray-600">{student.studentWallet.slice(0, 10)}...{student.studentWallet.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{student.subject}</p>
                      <p className="text-sm text-gray-600">{student.examSession}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Điểm: {student.score}/3</p>
                      <p className="text-sm text-gray-600">{new Date(student.examDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => mintNFTForStudent(student)}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaCoins className="mr-2" />
                  )}
                  Mint NFT
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minted NFTs */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          NFT đã mint ({mintedNFTs.length})
        </h3>
        {mintedNFTs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Chưa có NFT nào được mint
          </p>
        ) : (
          <div className="space-y-4">
            {mintedNFTs.map((nft, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <FaCheckCircle className="text-green-600 text-xl" />
                  <div>
                    <p className="font-semibold text-gray-900">Token #{nft.tokenId}</p>
                    <p className="text-sm text-gray-600">{nft.studentId} - {nft.subject}</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {new Date(nft.mintDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMintingManager; 