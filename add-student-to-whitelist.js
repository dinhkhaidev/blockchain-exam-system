const { ethers } = require('ethers');

async function addStudentToWhitelist() {
  try {
    console.log('🔄 Adding student to whitelist...');
    
    // Load contract addresses and ABI
    const contractAddresses = require('./frontend/src/contracts/contract-address.json');
    const ExamRegistration = require('./frontend/src/contracts/ExamRegistration.json');
    
    console.log('📋 Contract addresses:', contractAddresses);
    console.log('📋 ExamRegistration address:', contractAddresses.examRegistration);
    
    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get the first account as owner (deployer)
    const accounts = await provider.listAccounts();
    const ownerAccount = accounts[0];
    console.log('👑 Owner account:', ownerAccount);
    
    // ethers v6: getSigner(0) hoặc getSigner(address) với address là string
    const signer = await provider.getSigner(0); // Lấy signer đầu tiên
    console.log('👤 Signer address:', await signer.getAddress());
    
    // Initialize contract with signer
    const examRegistrationContract = new ethers.Contract(
      contractAddresses.ExamRegistration, // Đúng key, chữ hoa đầu
      ExamRegistration.abi,
      signer
    );
    
    console.log('✅ Contract initialized');
    console.log('📋 Contract address:', examRegistrationContract.target);
    
    // Test student address (replace with actual student address)
    const studentAddress = "0x8e4Cf11A8F982c0cFD54f3f1F6A0db91f0c1b30a"; // From error log
    console.log('👤 Student address to whitelist:', studentAddress);
    
    // Check if student is already whitelisted
    try {
      const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAddress);
      console.log('📋 Is student already whitelisted:', isWhitelisted);
      
      if (isWhitelisted) {
        console.log('✅ Student is already whitelisted!');
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not check whitelist status:', error.message);
    }
    
    // Add student to whitelist
    console.log('🔄 Adding student to whitelist...');
    const tx = await examRegistrationContract.addStudentToWhitelist(studentAddress);
    console.log('📋 Transaction sent:', tx.hash);
    
    console.log('🔄 Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed! Block:', receipt.blockNumber);
    
    // Verify student is now whitelisted
    const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAddress);
    console.log('✅ Student is now whitelisted:', isWhitelisted);
    
    console.log('\n✅ Student successfully added to whitelist!');
    
  } catch (error) {
    console.error('❌ Error adding student to whitelist:', error);
    console.error('❌ Error details:', error.message);
  }
}

addStudentToWhitelist(); 