const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/nft';

async function testBackend() {
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

    // Test 2: Get pending students
    console.log('\n2️⃣ Testing pending students...');
    try {
      const response = await axios.get(`${BASE_URL}/pending-mint`);
      console.log('✅ Pending students:', response.data);
    } catch (error) {
      console.log('❌ Pending students error:', error.response?.data || error.message);
    }

    // Test 3: Get completed students
    console.log('\n3️⃣ Testing completed students...');
    try {
      const response = await axios.get(`${BASE_URL}/completed-mint`);
      console.log('✅ Completed students:', response.data);
    } catch (error) {
      console.log('❌ Completed students error:', error.response?.data || error.message);
    }

    // Test 4: Get certificates
    console.log('\n4️⃣ Testing certificates...');
    try {
      const response = await axios.get(`${BASE_URL}/certificates`);
      console.log('✅ Certificates:', response.data);
    } catch (error) {
      console.log('❌ Certificates error:', error.response?.data || error.message);
    }

    // Test 5: Test whitelist
    console.log('\n5️⃣ Testing whitelist...');
    const testWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Ganache account 1
    try {
      const response = await axios.post(`${BASE_URL}/test-whitelist`, {
        studentAddress: testWallet
      });
      console.log('✅ Test whitelist:', response.data);
    } catch (error) {
      console.log('❌ Test whitelist error:', error.response?.data || error.message);
    }

    // Test 6: Test mint (if you have a test wallet)
    console.log('\n6️⃣ Testing mint (optional)...');
    try {
      const response = await axios.post(`${BASE_URL}/test-mint`, {
        studentWallet: testWallet
      });
      console.log('✅ Test mint:', response.data);
    } catch (error) {
      console.log('❌ Test mint error:', error.response?.data || error.message);
    }

    // Test 7: Check whitelist status
    console.log('\n7️⃣ Testing whitelist status...');
    try {
      const response = await axios.get(`${BASE_URL}/whitelist/status/${testWallet}`);
      console.log('✅ Whitelist status:', response.data);
    } catch (error) {
      console.log('❌ Whitelist status error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackend(); 