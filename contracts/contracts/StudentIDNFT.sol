// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title StudentIDNFT
 * @dev NFT xác thực danh tính sinh viên (chứa embedding khuôn mặt)
 */
contract StudentIDNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping từ ví đến tokenId
    mapping(address => uint256) public walletToTokenId;

    // Sự kiện mint
    event StudentIDMinted(
        uint256 indexed tokenId,
        address indexed studentWallet,
        string studentId
    );

    constructor() ERC721("Student ID NFT", "STUDENTID") {}

    /**
     * @dev Mint NFT xác thực danh tính (chỉ owner)
     * @param _studentWallet Địa chỉ ví sinh viên
     * @param _studentId MSSV
     * @param _tokenURI Metadata (chứa embedding)
     */
    function mintStudentID(
        address _studentWallet,
        string memory _studentId,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        require(_studentWallet != address(0), "Invalid wallet address");
        require(bytes(_studentId).length > 0, "Student ID cannot be empty");
        require(walletToTokenId[_studentWallet] == 0, "StudentID already exists");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(_studentWallet, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        walletToTokenId[_studentWallet] = newTokenId;

        emit StudentIDMinted(newTokenId, _studentWallet, _studentId);
        return newTokenId;
    }

    /**
     * @dev Lấy tokenId từ ví
     */
    function getTokenIdByWallet(address _walletAddress) external view returns (uint256) {
        return walletToTokenId[_walletAddress];
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