import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { FaImages, FaEye, FaDownload, FaShare, FaRegCopy, FaCheckCircle } from 'react-icons/fa';

const NFTGallery = () => {
  const { isConnected, account, contracts } = useWeb3();
  const [nftCertificates, setNftCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    const loadNFTs = async () => {
      if (!contracts || !contracts.examCertificateNFT) {
        setNftCertificates([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const contract = contracts.examCertificateNFT;
        const total = await contract.getTotalCertificates();
        const nfts = [];
        for (let i = 1; i <= Number(total); i++) {
          try {
            const info = await contract.getExamInfo(i);
            const owner = await contract.ownerOf(i);
            const tokenURI = await contract.tokenURI(i);
            let attributes = [];
            try {
              const meta = JSON.parse(tokenURI);
              if (meta && Array.isArray(meta.attributes)) {
                attributes = meta.attributes;
              }
            } catch (e) {}
            nfts.push({
              tokenId: i.toString(),
              owner,
              studentId: info.studentId,
              subject: info.subject,
              examSession: info.examSession,
              examDate: info.examDate ? Number(info.examDate) : null,
              verificationTime: info.verificationTime ? Number(info.verificationTime) : null,
              score: typeof info.score !== 'undefined' ? Number(info.score) : null,
              ipAddress: info.ipAddress,
              isValid: info.isValid,
              tokenURI,
              attributes
            });
          } catch (err) {
            continue;
          }
        }
        setNftCertificates(nfts);
      } catch (error) {
        console.error('Error loading NFTs from blockchain:', error);
        setNftCertificates([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadNFTs();
  }, [contracts]);

  const viewNFTDetails = async (nft) => {
    setSelectedNFT(nft);
  };

  const downloadMetadata = (nft) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(nft.tokenURI);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nft_metadata_${nft.tokenId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const shareMetadata = (nft) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(nft.tokenURI);
      alert('Đã copy metadata vào clipboard!');
    } else {
      alert('Trình duyệt không hỗ trợ copy clipboard.');
    }
  };

  // Lọc chỉ NFT thuộc về user hiện tại
  const userNFTs = account ? nftCertificates.filter(nft => nft.owner && nft.owner.toLowerCase() === account.toLowerCase()) : [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải NFT Gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT Gallery</h1>
            <p className="text-gray-600">
              Bộ sưu tập NFT chứng nhận thi cử
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{userNFTs.length}</p>
            <p className="text-sm text-gray-500">NFT đã mint</p>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {userNFTs.map((nft, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* NFT Image */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FaImages className="text-white text-4xl" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Minted
                </span>
              </div>
            </div>

            {/* NFT Info */}
            <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Exam Certificate - {nft.studentId}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Certificate for {nft.subject} exam
            </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">MSSV:</span>
                  <span className="font-medium">{nft.studentId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Môn học:</span>
                  <span className="font-medium">{nft.subject}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ca thi:</span>
                  <span className="font-medium">{nft.examSession}</span>
                </div>
                {/* Hiển thị Score nếu có */}
                {typeof nft.score !== 'undefined' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Điểm:</span>
                    <span className="font-medium">{typeof nft.score !== 'undefined' && nft.score !== null ? nft.score : 'N/A'}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Exam Date:</span>
                  <span className="font-medium">{nft.examDate && !isNaN(Number(nft.examDate)) ? new Date(Number(nft.examDate) * 1000).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Token ID:</span>
                  <span className="font-mono text-xs">{nft.tokenId ? nft.tokenId.slice(0, 8) + '...' : 'N/A'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {account && nft.owner && nft.owner.toLowerCase() === account.toLowerCase() ? (
                  <button
                    onClick={() => viewNFTDetails(nft)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FaEye className="mr-1" />
                    Xem chi tiết
                  </button>
                ) : (
                  <button
                    className="flex-1 bg-gray-300 text-gray-500 px-3 py-2 rounded-lg text-sm cursor-not-allowed flex items-center justify-center"
                    disabled
                    title="Chỉ chủ sở hữu NFT mới xem được chi tiết"
                  >
                    <FaEye className="mr-1" />
                    Xem chi tiết
                  </button>
                )}
                <button className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors duration-200">
                  <FaShare />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {userNFTs.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaImages className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bạn chưa sở hữu NFT nào
          </h3>
          <p className="text-gray-600 mb-6">
            Hãy tham gia thi và hoàn thành để nhận NFT chứng nhận!
          </p>
        </div>
      )}

      {/* NFT Details Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-purple-400">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-extrabold text-purple-700 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-2xl" />
                  Certificate Details
                </h2>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* NFT Image */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 flex flex-col items-center justify-center border-2 border-purple-300 shadow-lg">
                  <FaImages className="text-white text-7xl mb-4" />
                  <div className="text-white text-lg font-bold">Exam Certificate NFT</div>
                  <div className="text-white text-sm mt-2">Token ID: <span className="font-mono">{selectedNFT.tokenId}</span></div>
                </div>
                {/* NFT Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Exam Certificate - {selectedNFT.studentId}
                    </h3>
                    <p className="text-gray-600 text-lg">Certificate for <span className="font-semibold">{selectedNFT.subject}</span> exam</p>
                  </div>
                  <div className="space-y-3 bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-700 mb-2">Thông tin NFT</h4>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Student ID:</span><span className="text-sm font-medium text-gray-900">{selectedNFT.studentId}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Subject:</span><span className="text-sm font-medium text-gray-900">{selectedNFT.subject}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Exam Session:</span><span className="text-sm font-medium text-gray-900">{selectedNFT.examSession}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Score:</span><span className="text-sm font-medium text-gray-900">{typeof selectedNFT.score !== 'undefined' && selectedNFT.score !== null ? selectedNFT.score : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Exam Date:</span><span className="text-sm font-medium text-gray-900">{selectedNFT.examDate && !isNaN(Number(selectedNFT.examDate)) ? new Date(Number(selectedNFT.examDate) * 1000).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">IP Address:</span><span className="text-sm font-medium text-gray-900">{selectedNFT.ipAddress}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Token ID:</span><span className="text-sm font-medium text-gray-900">{selectedNFT.tokenId}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Owner:</span><span className="text-sm font-medium text-gray-900">{selectedNFT.owner}</span></div>
                  </div>
                  {/* Nếu muốn vẫn hiển thị metadata attributes, render thêm bên dưới */}
                  {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900">Metadata (attributes):</h4>
                      {selectedNFT.attributes
                        ?.filter(attr => attr.value && attr.value !== 'undefined/3' && attr.value !== 'undefined' && attr.value !== '')
                        .map((attr, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-sm text-gray-500">{attr.trait_type}:</span>
                            <span className="text-sm font-medium text-gray-900">{attr.value}</span>
                          </div>
                        ))}
                    </div>
                  )}
                  <div className="pt-4 border-t flex space-x-3">
                    <button
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      onClick={() => downloadMetadata(selectedNFT)}
                    >
                      <FaDownload />
                      Tải metadata
                    </button>
                    <button
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      onClick={() => shareMetadata(selectedNFT)}
                    >
                      <FaShare />
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTGallery; 