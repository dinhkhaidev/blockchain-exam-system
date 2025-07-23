// backend/ipfs-utils.js

const pinataSDK = require('@pinata/sdk');
const fetch = require('node-fetch');

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || '';

if (!PINATA_API_KEY || !PINATA_API_SECRET) {
  throw new Error('PINATA_API_KEY hoặc PINATA_API_SECRET chưa được cấu hình!');
}

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

async function uploadToIPFS(metadataObj) {
  try {
    const result = await pinata.pinJSONToIPFS(metadataObj);
    if (!result || !result.IpfsHash) {
      throw new Error('Pinata upload failed: ' + JSON.stringify(result));
    }
    return `ipfs://${result.IpfsHash}`;
  } catch (err) {
    throw new Error('Pinata upload failed: ' + err.message);
  }
}

async function getMetadataFromIPFS(metadataURI) {
  const url = metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  const res = await fetch(url);
  return await res.json();
}

module.exports = { uploadToIPFS, getMetadataFromIPFS }; 