const fs = require('fs');
const path = require('path');

function updatePrivateKey(newPrivateKey) {
  try {
    const configPath = path.join(__dirname, 'config.env');
    
    if (!fs.existsSync(configPath)) {
      console.log('❌ config.env not found. Please create it first.');
      return false;
    }
    
    // Read current config
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update PRIVATE_KEY line
    const lines = configContent.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('PRIVATE_KEY=')) {
        lines[i] = `PRIVATE_KEY=${newPrivateKey}`;
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      // Add PRIVATE_KEY if not found
      lines.push(`PRIVATE_KEY=${newPrivateKey}`);
    }
    
    // Write back to file
    fs.writeFileSync(configPath, lines.join('\n'));
    
    console.log('✅ Private key updated successfully!');
    console.log(`🔑 New private key: ${newPrivateKey}`);
    console.log('🔄 Please restart your backend server');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating private key:', error.message);
    return false;
  }
}

// If run directly
if (require.main === module) {
  const newPrivateKey = process.argv[2];
  
  if (!newPrivateKey) {
    console.log('📝 Usage: node update-private-key.js <private_key>');
    console.log('💡 Get private key from Ganache UI: http://localhost:7545');
    console.log('   Click on Account 0 and copy the private key');
    process.exit(1);
  }
  
  updatePrivateKey(newPrivateKey);
}

module.exports = { updatePrivateKey }; 