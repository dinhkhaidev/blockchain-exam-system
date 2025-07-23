const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN || 'YOUR_NFT_STORAGE_API_TOKEN'; // <-- Dán token v2 ở đây
const NFT_STORAGE_TOKEN = "1feb776b.7faf590912c9494c9324e65c17cb7e97"
console.log("NFT_STORAGE_TOKEN",NFT_STORAGE_TOKEN)
async function testUpload() {
  if (!NFT_STORAGE_TOKEN || NFT_STORAGE_TOKEN.length < 20) {
    throw new Error('NFT.Storage token không hợp lệ hoặc chưa được cấu hình!');
  }
  const jsonString = JSON.stringify({ test: 'hello nft.storage v2' });
  const res = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NFT_STORAGE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: jsonString
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error('NFT.Storage upload failed: ' + text);
  }
  console.log('Upload thành công! Response:', text);
}

// Chạy test
if (require.main === module) {
  testUpload().catch(err => {
    console.error('Lỗi test upload NFT.Storage:', err.message);
  });
} 