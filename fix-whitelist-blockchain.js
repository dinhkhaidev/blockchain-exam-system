const { ethers } = require('ethers');

async function fixWhitelistBlockchain() {
  try {
    console.log('🔄 Fixing whitelist on blockchain...');
    
    // Load contract addresses and ABI
    const contractAddresses = require('./frontend/src/contracts/contract-address.json');
    const ExamRegistration = require('./frontend/src/contracts/ExamRegistration.json');
    
    console.log('📋 Contract addresses:', contractAddresses);
    console.log('📋 ExamRegistration address:', contractAddresses.examRegistration);
    
    // Initialize provider
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log('📋 Available accounts:', accounts);
    
    const ownerAccount = accounts[0];
    const studentAccount = "0x8e4Cf11A8F982c0cFD54f3f1F6A0db91f0c1b30a"; // From error log
    
    console.log('👑 Owner account:', ownerAccount);
    console.log('👤 Student account:', studentAccount);
    
    // Create signer for owner
    const signer = await provider.getSigner(ownerAccount);
    console.log('👤 Signer address:', await signer.getAddress());
    
    // Initialize contract with signer
    const examRegistrationContract = new ethers.Contract(
      contractAddresses.examRegistration,
      ExamRegistration.abi,
      signer
    );
    
    console.log('✅ Contract initialized');
    console.log('📋 Contract address:', examRegistrationContract.target);
    
    // Check contract owner
    try {
      const contractOwner = await examRegistrationContract.owner();
      console.log('👑 Contract owner:', contractOwner);
      console.log('👑 Current signer:', await signer.getAddress());
      console.log('✅ Is signer owner?', contractOwner.toLowerCase() === (await signer.getAddress()).toLowerCase());
    } catch (error) {
      console.error('❌ Error checking contract owner:', error.message);
    }
    
    // Check if student is already whitelisted
    try {
      const isWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAccount);
      console.log('📋 Is student already whitelisted:', isWhitelisted);
      
      if (isWhitelisted) {
        console.log('✅ Student is already whitelisted!');
      } else {
        console.log('🔄 Adding student to whitelist...');
        
        // Add student to whitelist
        const tx = await examRegistrationContract.addStudentToWhitelist(studentAccount);
        console.log('📋 Transaction sent:', tx.hash);
        
        console.log('🔄 Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed! Block:', receipt.blockNumber);
        
        // Verify student is now whitelisted
        const isNowWhitelisted = await examRegistrationContract.isStudentWhitelisted(studentAccount);
        console.log('✅ Student is now whitelisted:', isNowWhitelisted);
      }
    } catch (error) {
      console.error('❌ Error with whitelist operation:', error);
      console.error('❌ Error details:', error.message);
    }
    
    // Test registration
    console.log('\n🔄 Testing student registration...');
    try {
      // Create signer for student
      const studentSigner = await provider.getSigner(studentAccount);
      const studentContract = new ethers.Contract(
        contractAddresses.examRegistration,
        ExamRegistration.abi,
        studentSigner
      );
      
      console.log('👤 Student signer address:', await studentSigner.getAddress());
      
      // Check if student can register
      const canRegister = await studentContract.isStudentWhitelisted(studentAccount);
      console.log('📋 Can student register?', canRegister);
      
      if (canRegister) {
        console.log('✅ Student can now register for exam!');
        
        // Test registration
        console.log('🔄 Testing registration with sample data...');
        try {
          const tx = await studentContract.registerForExam(
            "test123",
            "Web Development",
            "Ca 1 (8:00 - 10:00)"
          );
          console.log('📋 Registration transaction sent:', tx.hash);
          
          const receipt = await tx.wait();
          console.log('✅ Registration successful! Block:', receipt.blockNumber);
        } catch (regError) {
          console.error('❌ Registration failed:', regError.message);
        }
      } else {
        console.log('❌ Student still cannot register');
      }
      
    } catch (error) {
      console.error('❌ Error testing student registration:', error.message);
    }
    
    console.log('\n✅ Whitelist fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing whitelist:', error);
    console.error('❌ Error details:', error.message);
  }
}

fixWhitelistBlockchain(); 