import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const StepByStepTest = () => {
  const { contracts, account, isConnected } = useWeb3();
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState({});

  const steps = [
    {
      name: 'Check MetaMask Connection',
      test: async () => {
        if (!isConnected) {
          throw new Error('MetaMask not connected');
        }
        return `Connected: ${account}`;
      }
    },
    {
      name: 'Check Contract Availability',
      test: async () => {
        if (!contracts || !contracts.examCertificateNFT) {
          throw new Error('NFT contract not available');
        }
        return `Contract: ${contracts.examCertificateNFT.target}`;
      }
    },
    {
      name: 'Check Contract Deployment',
      test: async () => {
        const contract = contracts.examCertificateNFT;
        try {
          // Try to call a simple function to check if contract is working
          await contract.getTotalCertificates();
          return `Contract is working and deployed`;
        } catch (error) {
          throw new Error(`Contract not deployed or not accessible: ${error.message}`);
        }
      }
    },
    {
      name: 'Check Owner Status',
      test: async () => {
        const contract = contracts.examCertificateNFT;
        const owner = await contract.owner();
        const isOwner = owner.toLowerCase() === account.toLowerCase();
        if (!isOwner) {
          throw new Error(`Not owner. Owner: ${owner}, Account: ${account}`);
        }
        return `Owner verified: ${owner}`;
      }
    },
    {
      name: 'Check Student NFT Status',
      test: async () => {
        const contract = contracts.examCertificateNFT;
        const testWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
        const tokenId = await contract.getTokenIdByWallet(testWallet);
        if (tokenId > 0) {
          throw new Error(`Student already has NFT (token ID: ${tokenId})`);
        }
        return `Student can receive NFT (no existing token)`;
      }
    },
    {
      name: 'Test Contract Functions',
      test: async () => {
        const contract = contracts.examCertificateNFT;
        
        // Test getTotalCertificates
        const totalCerts = await contract.getTotalCertificates();
        
        // Test owner function
        const owner = await contract.owner();
        
        // Test getTokenIdByWallet
        const testWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
        const tokenId = await contract.getTokenIdByWallet(testWallet);
        
        return `Total certs: ${totalCerts}, Owner: ${owner.slice(0, 6)}..., Test wallet token: ${tokenId}`;
      }
    },
    {
      name: 'Test Parameter Encoding',
      test: async () => {
        const contract = contracts.examCertificateNFT;
        const testParams = [
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          'TEST001',
          'Blockchain Development',
          '2024',
          '127.0.0.1',
          'https://ipfs.io/ipfs/QmTest123'
        ];
        
        const encodedData = contract.interface.encodeFunctionData('mintCertificate', testParams);
        return `Encoding successful (${encodedData.length} chars)`;
      }
    },
    {
      name: 'Test Gas Estimation',
      test: async () => {
        const contract = contracts.examCertificateNFT;
        const testParams = [
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          'TEST001',
          'Blockchain Development',
          '2024',
          '127.0.0.1',
          'https://ipfs.io/ipfs/QmTest123'
        ];
        
        const gasEstimate = await contract.mintCertificate.estimateGas(...testParams);
        return `Gas estimate: ${gasEstimate.toString()}`;
      }
    },
    {
      name: 'Execute Mint Transaction',
      test: async () => {
        const contract = contracts.examCertificateNFT;
        const testParams = [
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          'TEST001',
          'Blockchain Development',
          '2024',
          '127.0.0.1',
          'https://ipfs.io/ipfs/QmTest123'
        ];
        
        const gasEstimate = await contract.mintCertificate.estimateGas(...testParams);
        // Convert to BigNumber if needed and calculate gas limit
        const gasLimit = typeof gasEstimate.mul === 'function' 
          ? gasEstimate.mul(120).div(100)
          : Math.floor(Number(gasEstimate) * 1.2);
        
        const tx = await contract.mintCertificate(...testParams, {
          gasLimit: gasLimit
        });
        
        const receipt = await tx.wait();
        return `Transaction successful: ${receipt.hash}`;
      }
    }
  ];

  const runStep = async (stepIndex) => {
    if (stepIndex >= steps.length) return;
    
    const step = steps[stepIndex];
    setCurrentStep(stepIndex);
    
    try {
      console.log(`🧪 Running step ${stepIndex + 1}: ${step.name}`);
      const result = await step.test();
      
      setResults(prev => ({
        ...prev,
        [stepIndex]: { success: true, result }
      }));
      
      toast.success(`Step ${stepIndex + 1} passed: ${result}`);
      console.log(`✅ Step ${stepIndex + 1} passed:`, result);
      
      // Auto-run next step after 1 second
      setTimeout(() => {
        if (stepIndex < steps.length - 1) {
          runStep(stepIndex + 1);
        }
      }, 1000);
      
    } catch (error) {
      console.error(`❌ Step ${stepIndex + 1} failed:`, error);
      
      setResults(prev => ({
        ...prev,
        [stepIndex]: { success: false, error: error.message }
      }));
      
      toast.error(`Step ${stepIndex + 1} failed: ${error.message}`);
    }
  };

  const runAllSteps = () => {
    setResults({});
    setCurrentStep(0);
    runStep(0);
  };

  const runFromStep = (stepIndex) => {
    setResults(prev => {
      const newResults = {};
      for (let i = 0; i < stepIndex; i++) {
        if (prev[i]) {
          newResults[i] = prev[i];
        }
      }
      return newResults;
    });
    setCurrentStep(stepIndex);
    runStep(stepIndex);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Step-by-Step Test</h2>
      
      <div className="mb-6">
        <button
          onClick={runAllSteps}
          disabled={!isConnected}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          Run All Steps
        </button>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const result = results[index];
          const isCurrent = currentStep === index;
          const isCompleted = result !== undefined;
          
          return (
            <div
              key={index}
              className={`p-4 border rounded-lg ${
                isCurrent ? 'border-blue-500 bg-blue-50' :
                isCompleted && result.success ? 'border-green-500 bg-green-50' :
                isCompleted && !result.success ? 'border-red-500 bg-red-50' :
                'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCurrent ? 'bg-blue-500 text-white' :
                    isCompleted && result.success ? 'bg-green-500 text-white' :
                    isCompleted && !result.success ? 'bg-red-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className="font-semibold">{step.name}</h3>
                </div>
                
                <div className="flex space-x-2">
                  {!isCompleted && (
                    <button
                      onClick={() => runFromStep(index)}
                      className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Run
                    </button>
                  )}
                  
                  {isCompleted && result.success && (
                    <span className="text-green-600 text-sm">✅ Passed</span>
                  )}
                  
                  {isCompleted && !result.success && (
                    <span className="text-red-600 text-sm">❌ Failed</span>
                  )}
                </div>
              </div>
              
              {isCompleted && (
                <div className="mt-3 p-3 bg-white rounded border">
                  {result.success ? (
                    <p className="text-sm text-green-700">{result.result}</p>
                  ) : (
                    <p className="text-sm text-red-700">{result.error}</p>
                  )}
                </div>
              )}
              
              {isCurrent && !isCompleted && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-blue-700">Running...</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Summary:</h3>
        <div className="text-sm text-gray-600">
          <p>• Total steps: {steps.length}</p>
          <p>• Completed: {Object.keys(results).length}</p>
          <p>• Passed: {Object.values(results).filter(r => r.success).length}</p>
          <p>• Failed: {Object.values(results).filter(r => !r.success).length}</p>
        </div>
      </div>
    </div>
  );
};

export default StepByStepTest; 