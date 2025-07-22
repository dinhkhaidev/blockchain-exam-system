import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const ContractDebug = () => {
  const { contracts, account, isConnected } = useWeb3();
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkContractDeployment = async () => {
    setIsLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout reached, forcing completion...');
      setIsLoading(false);
      toast.error('Contract check timed out. Please try again.');
    }, 10000); // 10 seconds timeout
    
    try {
      console.log('🔄 Checking contract deployment...');
      
      const info = {
        isConnected,
        account,
        contracts: {},
        errors: []
      };

      // Check ExamRegistration contract
      if (contracts.examRegistration) {
        try {
          console.log('🔄 Checking ExamRegistration contract...');
          
          // Check if contract interface exists
          if (!contracts.examRegistration.interface) {
            info.errors.push('ExamRegistration: Contract interface is null or undefined');
          } else if (!contracts.examRegistration.interface.functions) {
            info.errors.push('ExamRegistration: Contract functions are null or undefined');
          } else {
            try {
              const owner = await contracts.examRegistration.owner();
              const whitelistCount = await contracts.examRegistration.whitelistCount();
              
              info.contracts.examRegistration = {
                target: contracts.examRegistration.target,
                owner,
                whitelistCount: whitelistCount.toString(),
                functions: Object.keys(contracts.examRegistration.interface.functions)
              };
              console.log('✅ ExamRegistration contract check completed');
            } catch (callError) {
              info.errors.push(`ExamRegistration function call error: ${callError.message}`);
            }
          }
        } catch (error) {
          info.errors.push(`ExamRegistration error: ${error.message}`);
        }
      } else {
        info.errors.push('ExamRegistration contract not initialized');
      }

      // Check ExamRegistrationWrite contract
      if (contracts.examRegistrationWrite) {
        try {
          console.log('🔄 Checking ExamRegistrationWrite contract...');
          
          // Check if contract interface exists
          if (!contracts.examRegistrationWrite.interface) {
            info.errors.push('ExamRegistrationWrite: Contract interface is null or undefined');
          } else if (!contracts.examRegistrationWrite.interface.functions) {
            info.errors.push('ExamRegistrationWrite: Contract functions are null or undefined');
          } else {
            try {
              const target = contracts.examRegistrationWrite.target;
              const signer = contracts.examRegistrationWrite.runner;
              const signerAddress = await signer.getAddress();
              
              info.contracts.examRegistrationWrite = {
                target,
                signerAddress,
                functions: Object.keys(contracts.examRegistrationWrite.interface.functions)
              };
              console.log('✅ ExamRegistrationWrite contract check completed');
            } catch (callError) {
              info.errors.push(`ExamRegistrationWrite function call error: ${callError.message}`);
            }
          }
        } catch (error) {
          info.errors.push(`ExamRegistrationWrite error: ${error.message}`);
        }
      } else {
        info.errors.push('ExamRegistrationWrite contract not initialized');
      }

      // Check ExamCertificateNFT contract
      if (contracts.examCertificateNFT) {
        try {
          console.log('🔄 Checking ExamCertificateNFT contract...');
          
          // Check if contract interface exists
          if (!contracts.examCertificateNFT.interface) {
            info.errors.push('ExamCertificateNFT: Contract interface is null or undefined');
          } else if (!contracts.examCertificateNFT.interface.functions) {
            info.errors.push('ExamCertificateNFT: Contract functions are null or undefined');
          } else {
            try {
              const target = contracts.examCertificateNFT.target;
              
              info.contracts.examCertificateNFT = {
                target,
                functions: Object.keys(contracts.examCertificateNFT.interface.functions)
              };
              console.log('✅ ExamCertificateNFT contract check completed');
            } catch (callError) {
              info.errors.push(`ExamCertificateNFT function call error: ${callError.message}`);
            }
          }
        } catch (error) {
          info.errors.push(`ExamCertificateNFT error: ${error.message}`);
        }
      } else {
        info.errors.push('ExamCertificateNFT contract not initialized');
      }

      console.log('🔄 Setting debug info...');
      setDebugInfo(info);
      console.log('📋 Debug info:', info);
      
      if (info.errors.length === 0) {
        toast.success('✅ Contract deployment check completed successfully!');
      } else {
        toast.warning(`⚠️ Found ${info.errors.length} issues with contract deployment`);
      }
      
    } catch (error) {
      console.error('❌ Error checking contract deployment:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      console.log('🔄 Setting loading to false...');
      clearTimeout(timeout); // Clear timeout
      setIsLoading(false);
    }
  };

  const testWhitelistFunction = async () => {
    if (!contracts.examRegistrationWrite) {
      toast.error('Contract not initialized');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Testing whitelist function...');
      
      // Test with a sample address
      const testAddress = '0x4EE204518233e2e71025C75E59eF204435479844';
      
      // Check if function exists
      const hasFunction = contracts.examRegistrationWrite.interface.hasFunction('addStudentToWhitelist');
      console.log('📋 Function exists:', hasFunction);
      
      if (!hasFunction) {
        throw new Error('addStudentToWhitelist function does not exist');
      }
      
      // Try to estimate gas
      try {
        const gasEstimate = await contracts.examRegistrationWrite.addStudentToWhitelist.estimateGas(testAddress);
        console.log('📋 Gas estimate:', gasEstimate.toString());
        toast.success(`Gas estimate: ${gasEstimate.toString()}`);
      } catch (gasError) {
        console.error('❌ Gas estimation failed:', gasError.message);
        toast.error(`Gas estimation failed: ${gasError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error testing whitelist function:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkContractABI = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Checking contract ABI...');
      
      if (!contracts.examRegistration) {
        throw new Error('Contract not initialized');
      }

      // Check if interface exists
      if (!contracts.examRegistration.interface) {
        throw new Error('Contract interface is null or undefined');
      }

      const contractInterface = contracts.examRegistration.interface;
      
      // Check if functions exist
      if (!contractInterface.functions) {
        throw new Error('Contract functions are null or undefined');
      }
      
      const functions = Object.keys(contractInterface.functions);
      
      console.log('📋 Available functions:', functions);
      
      // Check specific functions
      const requiredFunctions = [
        'owner',
        'whitelistCount', 
        'addStudentToWhitelist',
        'removeStudentFromWhitelist',
        'isStudentWhitelisted'
      ];
      
      const missingFunctions = requiredFunctions.filter(func => !functions.includes(func));
      
      if (missingFunctions.length > 0) {
        toast.error(`Missing functions: ${missingFunctions.join(', ')}`);
      } else {
        toast.success('✅ All required functions found in ABI');
      }
      
      console.log('📋 Missing functions:', missingFunctions);
      
      // Check ABI loading
      try {
        const ExamRegistration = require('../contracts/ExamRegistration.json');
        console.log('📋 ABI loaded successfully');
        console.log('📋 ABI functions count:', ExamRegistration.abi.length);
      } catch (abiError) {
        console.error('❌ Error loading ABI:', abiError.message);
        toast.error('Error loading ABI file');
      }
      
    } catch (error) {
      console.error('❌ Error checking ABI:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testOwnerFunction = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Testing owner function...');
      
      if (!contracts.examRegistration) {
        throw new Error('Contract not initialized');
      }

      const owner = await contracts.examRegistration.owner();
      console.log('📋 Contract owner:', owner);
      
      toast.success(`Contract owner: ${owner}`);
      
    } catch (error) {
      console.error('❌ Error testing owner function:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkContractInitialization = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Checking contract initialization...');
      
      const info = {
        contracts: {},
        errors: []
      };

      // Check if contracts object exists
      if (!contracts) {
        info.errors.push('Contracts object is null or undefined');
      } else {
        console.log('📋 Contracts object keys:', Object.keys(contracts));
        
        // Check each contract
        if (contracts.examRegistration) {
          info.contracts.examRegistration = {
            exists: true,
            target: contracts.examRegistration.target,
            hasInterface: !!contracts.examRegistration.interface,
            hasFunctions: !!(contracts.examRegistration.interface && contracts.examRegistration.interface.functions)
          };
        } else {
          info.errors.push('ExamRegistration contract not found');
        }
        
        if (contracts.examRegistrationWrite) {
          info.contracts.examRegistrationWrite = {
            exists: true,
            target: contracts.examRegistrationWrite.target,
            hasInterface: !!contracts.examRegistrationWrite.interface,
            hasFunctions: !!(contracts.examRegistrationWrite.interface && contracts.examRegistrationWrite.interface.functions)
          };
        } else {
          info.errors.push('ExamRegistrationWrite contract not found');
        }
        
        if (contracts.examCertificateNFT) {
          info.contracts.examCertificateNFT = {
            exists: true,
            target: contracts.examCertificateNFT.target,
            hasInterface: !!contracts.examCertificateNFT.interface,
            hasFunctions: !!(contracts.examCertificateNFT.interface && contracts.examCertificateNFT.interface.functions)
          };
        } else {
          info.errors.push('ExamCertificateNFT contract not found');
        }
      }

      console.log('📋 Initialization info:', info);
      
      if (info.errors.length === 0) {
        toast.success('✅ Contract initialization check completed successfully!');
      } else {
        toast.warning(`⚠️ Found ${info.errors.length} initialization issues`);
      }
      
    } catch (error) {
      console.error('❌ Error checking initialization:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Contract Debug</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={checkContractInitialization}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            Check Initialization
          </button>
          
          <button
            onClick={checkContractDeployment}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Check Contract Deployment
          </button>
          
          <button
            onClick={testWhitelistFunction}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            Test Whitelist Function
          </button>
          
          <button
            onClick={checkContractABI}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            Check ABI
          </button>
          
          <button
            onClick={testOwnerFunction}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
          >
            Test Owner Function
          </button>
        </div>

        {debugInfo && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Connection Status</h4>
                <p>Connected: {debugInfo.isConnected ? '✅' : '❌'}</p>
                <p>Account: {debugInfo.account || 'Not connected'}</p>
              </div>

              {debugInfo.contracts.examRegistration && (
                <div>
                  <h4 className="font-medium">ExamRegistration Contract</h4>
                  <p>Target: {debugInfo.contracts.examRegistration.target}</p>
                  <p>Owner: {debugInfo.contracts.examRegistration.owner}</p>
                  <p>Whitelist Count: {debugInfo.contracts.examRegistration.whitelistCount}</p>
                  <p>Functions: {debugInfo.contracts.examRegistration.functions.length}</p>
                </div>
              )}

              {debugInfo.contracts.examRegistrationWrite && (
                <div>
                  <h4 className="font-medium">ExamRegistrationWrite Contract</h4>
                  <p>Target: {debugInfo.contracts.examRegistrationWrite.target}</p>
                  <p>Signer: {debugInfo.contracts.examRegistrationWrite.signerAddress}</p>
                  <p>Functions: {debugInfo.contracts.examRegistrationWrite.functions.length}</p>
                </div>
              )}

              {debugInfo.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600">Errors</h4>
                  <ul className="list-disc list-inside text-red-600">
                    {debugInfo.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDebug; 