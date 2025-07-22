const { ethers } = require('ethers');

async function checkContractDeployment() {
  try {
    console.log('🔄 Checking contract deployment on blockchain...');
    
    // Initialize provider
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Load contract addresses
    const contractAddresses = require('./frontend/src/contracts/contract-address.json');
    console.log('📋 Contract addresses:', contractAddresses);
    
    // Check each contract
    const contracts = [
      { name: 'ExamRegistration', address: contractAddresses.examRegistration },
      { name: 'ExamCertificateNFT', address: contractAddresses.examCertificateNFT },
      { name: 'ExamNFTRegistry', address: contractAddresses.examNFTRegistry }
    ];
    
    for (const contract of contracts) {
      console.log(`\n🔄 Checking ${contract.name}...`);
      console.log(`📋 Address: ${contract.address}`);
      
      try {
        // Check if contract exists by getting code
        const code = await provider.getCode(contract.address);
        console.log(`📋 Contract code length: ${code.length}`);
        
        if (code === '0x') {
          console.log(`❌ ${contract.name} is NOT deployed at ${contract.address}`);
        } else {
          console.log(`✅ ${contract.name} is deployed at ${contract.address}`);
          
          // Try to get balance
          const balance = await provider.getBalance(contract.address);
          console.log(`📋 Contract balance: ${ethers.formatEther(balance)} ETH`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${contract.name}:`, error.message);
      }
    }
    
    // Check Ganache accounts
    console.log('\n🔄 Checking Ganache accounts...');
    const accounts = await provider.listAccounts();
    console.log(`📋 Available accounts: ${accounts.length}`);
    console.log(`📋 First account: ${accounts[0]}`);
    
    // Check if deployer account exists
    const deployerAddress = contractAddresses.deployer;
    console.log(`📋 Deployer address: ${deployerAddress}`);
    
    const deployerBalance = await provider.getBalance(deployerAddress);
    console.log(`📋 Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`);
    
  } catch (error) {
    console.error('❌ Error checking contract deployment:', error);
  }
}

checkContractDeployment(); 