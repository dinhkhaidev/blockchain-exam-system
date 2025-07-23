const PinataClient = require('@pinata/sdk');
require('dotenv').config();
const PINATA_API_KEY = process.env.PINATA_API_KEY || 'YOUR_PINATA_API_KEY';
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || 'YOUR_PINATA_API_SECRET';
console.log("PINATA_API_KEY",PINATA_API_KEY);
console.log("PINATA_API_SECRET",PINATA_API_SECRET);
const pinata = new PinataClient({ pinataApiKey: PINATA_API_KEY, pinataSecretApiKey: PINATA_API_SECRET });

async function testPinata() {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error('Pinata API key/secret chưa được cấu hình!');
  }
  // Test authentication
  const auth = await pinata.testAuthentication();
  if (!auth || !auth.authenticated) {
    throw new Error('Pinata authentication failed: ' + JSON.stringify(auth));
  }
  console.log('✅ Kết nối Pinata thành công!');
  // Test upload JSON
  const result = await pinata.pinJSONToIPFS({ test: 'hello pinata' });
  if (!result || !result.IpfsHash) {
    throw new Error('Pinata upload failed: ' + JSON.stringify(result));
  }
  console.log('✅ Upload thành công! IpfsHash:', result.IpfsHash);
}

if (require.main === module) {
  testPinata().catch(err => {
    console.error('❌ Lỗi test Pinata:', err);
  });
} 