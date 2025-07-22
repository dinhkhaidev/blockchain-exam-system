const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Blockchain Exam System...\n');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if Ganache is running
function checkGanache() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec('curl -s http://localhost:7545', (error, stdout, stderr) => {
      if (error) {
        log('❌ Ganache not running. Starting Ganache...', 'yellow');
        resolve(false);
      } else {
        log('✅ Ganache is already running', 'green');
        resolve(true);
      }
    });
  });
}

// Start Ganache
function startGanache() {
  log('⛓️ Starting Ganache...', 'blue');
  
  const ganache = spawn('ganache-cli', ['--port', '7545'], {
    stdio: 'pipe',
    shell: true
  });
  
  ganache.stdout.on('data', (data) => {
    log(`Ganache: ${data.toString().trim()}`, 'blue');
  });
  
  ganache.stderr.on('data', (data) => {
    log(`Ganache Error: ${data.toString().trim()}`, 'red');
  });
  
  ganache.on('close', (code) => {
    log(`Ganache process exited with code ${code}`, 'yellow');
  });
  
  return ganache;
}

// Deploy contracts
function deployContracts() {
  log('📦 Deploying contracts...', 'blue');
  
  return new Promise((resolve, reject) => {
    const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deploy-to-ganache.js', '--network', 'ganache'], {
      cwd: path.join(__dirname, '../contracts'),
      stdio: 'pipe',
      shell: true
    });
    
    deploy.stdout.on('data', (data) => {
      log(`Deploy: ${data.toString().trim()}`, 'blue');
    });
    
    deploy.stderr.on('data', (data) => {
      log(`Deploy Error: ${data.toString().trim()}`, 'red');
    });
    
    deploy.on('close', (code) => {
      if (code === 0) {
        log('✅ Contracts deployed successfully', 'green');
        resolve();
      } else {
        log('❌ Contract deployment failed', 'red');
        reject(new Error('Deployment failed'));
      }
    });
  });
}

// Start backend
function startBackend() {
  log('🔧 Starting backend...', 'blue');
  
  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../backend'),
    stdio: 'pipe',
    shell: true
  });
  
  backend.stdout.on('data', (data) => {
    log(`Backend: ${data.toString().trim()}`, 'blue');
  });
  
  backend.stderr.on('data', (data) => {
    log(`Backend Error: ${data.toString().trim()}`, 'red');
  });
  
  backend.on('close', (code) => {
    log(`Backend process exited with code ${code}`, 'yellow');
  });
  
  return backend;
}

// Start frontend
function startFrontend() {
  log('🎨 Starting frontend...', 'blue');
  
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../frontend'),
    stdio: 'pipe',
    shell: true
  });
  
  frontend.stdout.on('data', (data) => {
    log(`Frontend: ${data.toString().trim()}`, 'blue');
  });
  
  frontend.stderr.on('data', (data) => {
    log(`Frontend Error: ${data.toString().trim()}`, 'red');
  });
  
  frontend.on('close', (code) => {
    log(`Frontend process exited with code ${code}`, 'yellow');
  });
  
  return frontend;
}

// Wait for service to be ready
function waitForService(url, serviceName, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const check = () => {
      attempts++;
      const { exec } = require('child_process');
      
      exec(`curl -s ${url}`, (error, stdout, stderr) => {
        if (error) {
          if (attempts >= maxAttempts) {
            log(`❌ ${serviceName} not ready after ${maxAttempts} attempts`, 'red');
            reject(new Error(`${serviceName} not ready`));
          } else {
            log(`⏳ Waiting for ${serviceName}... (${attempts}/${maxAttempts})`, 'yellow');
            setTimeout(check, 2000);
          }
        } else {
          log(`✅ ${serviceName} is ready`, 'green');
          resolve();
        }
      });
    };
    
    check();
  });
}

// Main startup function
async function startSystem() {
  try {
    // Check if Ganache is running
    const ganacheRunning = await checkGanache();
    
    let ganacheProcess;
    if (!ganacheRunning) {
      ganacheProcess = startGanache();
      
      // Wait for Ganache to start
      log('⏳ Waiting for Ganache to start...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Deploy contracts
    await deployContracts();
    
    // Start backend
    const backendProcess = startBackend();
    
    // Wait for backend to be ready
    await waitForService('http://localhost:3001/api/nft/pending-mint', 'Backend');
    
    // Start frontend
    const frontendProcess = startFrontend();
    
    // Wait for frontend to be ready
    await waitForService('http://localhost:3000', 'Frontend');
    
    log('\n🎉 System started successfully!', 'green');
    log('\n📋 Services running:', 'blue');
    log('✅ Ganache: http://localhost:7545', 'green');
    log('✅ Backend: http://localhost:3001', 'green');
    log('✅ Frontend: http://localhost:3000', 'green');
    
    log('\n🌐 Open your browser and go to: http://localhost:3000', 'blue');
    log('🔗 Don\'t forget to connect MetaMask to Ganache network', 'yellow');
    
    // Handle process termination
    process.on('SIGINT', () => {
      log('\n🛑 Shutting down system...', 'yellow');
      
      if (ganacheProcess) ganacheProcess.kill();
      if (backendProcess) backendProcess.kill();
      if (frontendProcess) frontendProcess.kill();
      
      process.exit(0);
    });
    
  } catch (error) {
    log(`❌ Failed to start system: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the startup
startSystem(); 