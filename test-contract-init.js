const { ethers } = require('ethers');

async function testContractInitialization() {
  try {
    console.log('🔄 Testing contract initialization...');
    
    // Load contract addresses and ABI
    const contractAddresses = require('./frontend/src/contracts/contract-address.json');
    const ExamRegistration = require('./frontend/src/contracts/ExamRegistration.json');
    const ExamCertificateNFT = require('./frontend/src/contracts/ExamCertificateNFT.json');
    
    console.log('📋 Contract addresses:', contractAddresses);
    console.log('📋 ExamRegistration ABI length:', ExamRegistration.abi.length);
    console.log('📋 ExamCertificateNFT ABI length:', ExamCertificateNFT.abi.length);
    
    // Initialize provider
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Test ExamRegistration contract
    console.log('\n🔄 Testing ExamRegistration contract...');
    const examRegistrationContract = new ethers.Contract(
      contractAddresses.examRegistration,
      ExamRegistration.abi,
      provider
    );
    
    console.log('✅ ExamRegistration contract initialized');
    console.log('📋 Contract address:', examRegistrationContract.target);
    
    // Test ExamCertificateNFT contract
    console.log('\n🔄 Testing ExamCertificateNFT contract...');
    const examCertificateNFTContract = new ethers.Contract(
      contractAddresses.examCertificateNFT,
      ExamCertificateNFT.abi,
      provider
    );
    
    console.log('✅ ExamCertificateNFT contract initialized');
    console.log('📋 Contract address:', examCertificateNFTContract.target);
    
    // Test contract functions
    console.log('\n🔄 Testing contract functions...');
    
    try {
      const owner = await examRegistrationContract.owner();
      console.log('👑 Contract owner:', owner);
    } catch (error) {
      console.error('❌ Error calling owner():', error.message);
    }
    
    try {
      const totalStudents = await examRegistrationContract.getTotalStudents();
      console.log('📊 Total students:', totalStudents.toString());
    } catch (error) {
      console.error('❌ Error calling getTotalStudents():', error.message);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during contract initialization test:', error);
    console.error('❌ Error details:', error.message);
  }
}

testContractInitialization(); 