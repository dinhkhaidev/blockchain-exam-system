import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const CertificateViewer = () => {
  const { contracts, isConnected } = useWeb3();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);

  // Load all certificates from blockchain
  const loadCertificates = async () => {
    if (!contracts || !contracts.examCertificateNFT) return;
    setLoading(true);
    try {
      const contract = contracts.examCertificateNFT;
      // Get total supply
      const supply = await contract.getTotalCertificates();
      setTotalSupply(Number(supply));
      if (Number(supply) === 0) {
        setCertificates([]);
        setLoading(false);
        return;
      }
      // Get all certificates
      const certs = [];
      for (let i = 1; i <= Number(supply); i++) {
        try {
          const certData = await contract.getExamInfo(i);
          const owner = await contract.ownerOf(i);
          const tokenURI = await contract.tokenURI(i);
          certs.push({
            tokenId: i,
            owner: owner,
            studentId: certData.studentId,
            subject: certData.subject,
            examSession: certData.examSession,
            examDate: certData.examDate,
            verificationTime: certData.verificationTime,
            ipAddress: certData.ipAddress,
            isValid: certData.isValid,
            tokenURI: tokenURI
          });
        } catch (error) {
          certs.push({
            tokenId: i,
            error: true
          });
        }
      }
      setCertificates(certs);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Lỗi khi tải danh sách NFT từ blockchain');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && contracts) {
      loadCertificates();
    }
    // eslint-disable-next-line
  }, [isConnected, contracts]);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Certificate Overview</h3>
            <p className="text-sm text-gray-500">
              Total certificates minted: {totalSupply}
            </p>
          </div>
          <button
            onClick={loadCertificates}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No certificates found</p>
            <p className="text-sm text-gray-400 mt-2">
              Mint some certificates to see them here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {certificates.map((cert) => (
              <div
                key={cert.tokenId}
                className={`p-6 ${cert.error ? 'bg-red-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Certificate #{cert.tokenId}
                      </h4>
                      {cert.error && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Error Loading
                        </span>
                      )}
                    </div>
                    {!cert.error && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Student ID:</label>
                            <p className="text-sm text-gray-900">{cert.studentId}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Subject:</label>
                            <p className="text-sm text-gray-900">{cert.subject}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Exam Session:</label>
                            <p className="text-sm text-gray-900">{cert.examSession}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">IP Address:</label>
                            <p className="text-sm text-gray-900">{cert.ipAddress}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Valid:</label>
                            <span className={`text-sm font-semibold ${cert.isValid ? 'text-green-600' : 'text-red-600'}`}>
                              {cert.isValid ? '✅' : '❌'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Owner:</label>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-mono text-gray-900">
                                {cert.owner.slice(0, 6)}...{cert.owner.slice(-4)}
                              </p>
                              <button
                                onClick={() => copyToClipboard(cert.owner)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Mint Time:</label>
                            <p className="text-sm text-gray-900">{formatDate(cert.examDate)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Token URI:</label>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-900 truncate max-w-xs">
                                {cert.tokenURI || 'No URI'}
                              </p>
                              {cert.tokenURI && (
                                <button
                                  onClick={() => copyToClipboard(cert.tokenURI)}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  Copy
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => copyToClipboard(cert.tokenId.toString())}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                    >
                      Copy ID
                    </button>
                    {cert.tokenURI && (
                      <a
                        href={cert.tokenURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 text-center"
                      >
                        View URI
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateViewer;
