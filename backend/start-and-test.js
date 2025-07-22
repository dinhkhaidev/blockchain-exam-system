const { spawn } = require('child_process');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/nft';

async function waitForServer() {
  console.log('⏳ Waiting for server to start...');
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(`${BASE_URL}/contract-status`);
      console.log('✅ Server is ready!');
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  console.log('❌ Server failed to start');
  return false;
}

async function testAPI() {
  try {
    console.log('🔍 Testing Backend API...\n');

    // Test 1: Check contract status
    console.log('1️⃣ Testing contract status...');
    try {
      const response = await axios.get(`${BASE_URL}/contract-status`);
      console.log('✅ Contract status:', response.data);
    } catch (error) {
      console.log('❌ Contract status error:', error.response?.data || error.message);
    }

    // Test 2: Test whitelist
    console.log('\n2️⃣ Testing whitelist...');
    const testWallet = '0x8e4cf11a8f982c0cfd54f3f1f6a0db91f0c1b30a';
    try {
      const response = await axios.post(`${BASE_URL}/test-whitelist`, {
        studentAddress: testWallet
      });
      console.log('✅ Test whitelist:', response.data);
    } catch (error) {
      console.log('❌ Test whitelist error:', error.response?.data || error.message);
    }

    // Test 3: Test mint
    console.log('\n3️⃣ Testing mint...');
    try {
      const response = await axios.post(`${BASE_URL}/test-mint`, {
        studentWallet: testWallet
      });
      console.log('✅ Test mint:', response.data);
    } catch (error) {
      console.log('❌ Test mint error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Start backend server
console.log('🚀 Starting backend server...');
const server = spawn('npm', ['start'], {
  cwd: __dirname,
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log(`📋 Server: ${data}`);
});

server.stderr.on('data', (data) => {
  console.log(`❌ Server Error: ${data}`);
});

// Wait for server to start then test
setTimeout(async () => {
  const isReady = await waitForServer();
  if (isReady) {
    await testAPI();
  }
  server.kill();
}, 2000);

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill();
  process.exit();
}); 