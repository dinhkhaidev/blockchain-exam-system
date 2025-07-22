const { JsonRpcProvider } = require('ethers');

async function getPrivateKey() {
  try {
    console.log('🔍 Getting Ganache account 0 private key...\n');
    
    const provider = new JsonRpcProvider('http://localhost:7545');
    
    // Get accounts
    const accounts = await provider.listAccounts();
    const account0 = accounts[0];
    
    console.log(`📋 Account 0: ${account0.address || account0}`);
    
    // Get private key (this only works with Ganache)
    const privateKey = await provider.send('eth_accounts', []);
    console.log(`🔑 Private key: ${account0.privateKey || 'Not available'}`);
    
    // Alternative: Ganache exposes private keys in accounts array
    if (account0.privateKey) {
      console.log(`✅ Private key found: ${account0.privateKey}`);
    } else {
      console.log('❌ Private key not available in accounts array');
      console.log('💡 Try accessing Ganache UI to get private key');
    }
    
  } catch (error) {
    console.error('❌ Error getting private key:', error.message);
  }
}

getPrivateKey(); 