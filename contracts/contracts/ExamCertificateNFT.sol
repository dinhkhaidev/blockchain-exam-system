// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ExamCertificateNFT
 * @dev NFT chứng nhận đã tham gia thi hợp lệ
 */
contract ExamCertificateNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Mapping từ địa chỉ ví đến token ID
    mapping(address => uint256) public walletToTokenId;
    
    // Mapping từ token ID đến thông tin thi
    mapping(uint256 => ExamInfo) public examInfo;
    
    // Struct chứa thông tin thi
    struct ExamInfo {
        string studentId;      // MSSV
        string subject;        // Môn học
        string examSession;    // Ca thi
        uint256 examDate;      // Ngày thi
        uint256 verificationTime; // Thời gian xác minh
        string ipAddress;      // IP address khi thi
        bool isValid;          // Chứng nhận còn hợp lệ không
        uint256 score;         // Điểm số
    }
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed studentWallet,
        string studentId,
        string subject,
        uint256 examDate,
        uint256 score
    );
    
    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed studentWallet,
        string reason
    );
    
    constructor() ERC721("Exam Certificate NFT", "EXAMCERT") {}
    
    /**
     * @dev Mint NFT chứng nhận thi (chỉ owner)
     * @param _studentWallet Địa chỉ ví sinh viên
     * @param _studentId MSSV
     * @param _subject Môn học
     * @param _examSession Ca thi
     * @param _ipAddress IP address
     * @param _tokenURI URI metadata của NFT
     */
    function mintCertificate(
        address _studentWallet,
        string memory _studentId,
        string memory _subject,
        string memory _examSession,
        string memory _ipAddress,
        uint256 _score,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        require(_studentWallet != address(0), "Invalid wallet address");
        require(bytes(_studentId).length > 0, "Student ID cannot be empty");
        require(walletToTokenId[_studentWallet] == 0, "Certificate already exists");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(_studentWallet, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        
        walletToTokenId[_studentWallet] = newTokenId;
        
        examInfo[newTokenId] = ExamInfo({
            studentId: _studentId,
            subject: _subject,
            examSession: _examSession,
            examDate: block.timestamp,
            verificationTime: block.timestamp,
            ipAddress: _ipAddress,
            isValid: true,
            score: _score
        });
        
        emit CertificateMinted(
            newTokenId,
            _studentWallet,
            _studentId,
            _subject,
            block.timestamp,
            _score
        );
        
        return newTokenId;
    }
    
    /**
     * @dev Thu hồi chứng nhận (chỉ owner)
     * @param _tokenId ID của token
     * @param _reason Lý do thu hồi
     */
    function revokeCertificate(uint256 _tokenId, string memory _reason) external onlyOwner {
        require(_exists(_tokenId), "Token does not exist");
        require(examInfo[_tokenId].isValid, "Certificate already revoked");
        
        examInfo[_tokenId].isValid = false;
        
        address studentWallet = ownerOf(_tokenId);
        walletToTokenId[studentWallet] = 0;
        
        emit CertificateRevoked(_tokenId, studentWallet, _reason);
    }
    
    /**
     * @dev Lấy thông tin thi từ token ID
     * @param _tokenId ID của token
     * @return Thông tin thi
     */
    function getExamInfo(uint256 _tokenId) external view returns (ExamInfo memory) {
        require(_exists(_tokenId), "Token does not exist");
        return examInfo[_tokenId];
    }
    
    /**
     * @dev Lấy token ID từ địa chỉ ví
     * @param _walletAddress Địa chỉ ví
     * @return Token ID (0 nếu không có)
     */
    function getTokenIdByWallet(address _walletAddress) external view returns (uint256) {
        return walletToTokenId[_walletAddress];
    }
    
    /**
     * @dev Kiểm tra chứng nhận có hợp lệ không
     * @param _tokenId ID của token
     * @return true nếu hợp lệ
     */
    function isCertificateValid(uint256 _tokenId) external view returns (bool) {
        require(_exists(_tokenId), "Token does not exist");
        return examInfo[_tokenId].isValid;
    }
    
    /**
     * @dev Lấy tổng số chứng nhận đã mint
     * @return Tổng số token
     */
    function getTotalCertificates() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 
 
 
 