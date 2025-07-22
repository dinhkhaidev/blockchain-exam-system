const { JsonRpcProvider, formatEther } = require('ethers');

async function checkGanache() {
  try {
    console.log('🔍 Checking Ganache accounts...\n');
    
    const provider = new JsonRpcProvider('http://localhost:7545');
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log('📋 Ganache accounts:');
    accounts.forEach((account, index) => {
      console.log(`  Account ${index}: ${account.address || account}`);
    });
    
    // Get balance of first account
    const balance = await provider.getBalance(accounts[0]);
    console.log(`\n💰 Balance of Account 0: ${formatEther(balance)} ETH`);
    
    // Check if your account exists
    const yourAccount = '0xB873AD3DB908B6689e53Ef8dA3f36d82C7bdEF84';
    const yourBalance = await provider.getBalance(yourAccount);
    console.log(`💰 Balance of your account: ${formatEther(yourBalance)} ETH`);
    
    // Check if your account is in the list
    const accountAddresses = accounts.map(acc => acc.address || acc);
    const isYourAccountInList = accountAddresses.includes(yourAccount);
    console.log(`\n✅ Your account in Ganache: ${isYourAccountInList ? 'Yes' : 'No'}`);
    
    if (isYourAccountInList) {
      const index = accountAddresses.indexOf(yourAccount);
      console.log(`📋 Your account is Account ${index}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking Ganache:', error.message);
  }
}

checkGanache(); 