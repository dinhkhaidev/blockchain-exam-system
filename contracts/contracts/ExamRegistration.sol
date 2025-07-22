// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ExamRegistration
 * @dev Smart contract quản lý đăng ký thi và xác minh danh tính
 */
contract ExamRegistration is Ownable, ReentrancyGuard {
    
    // Structs
    struct Student {
        string studentId;      // MSSV
        string subject;        // Môn học
        string examSession;    // Ca thi
        address walletAddress; // Địa chỉ ví
        bool isRegistered;     // Đã đăng ký chưa
        bool isVerified;       // Đã xác minh chưa
        uint256 registrationTime; // Thời gian đăng ký
        uint256 verificationTime; // Thời gian xác minh
    }
    
    struct VerificationLog {
        address studentWallet;
        string studentId;
        string ipAddress;
        string imageHash;
        uint256 timestamp;
        bool success;
    }
    
    // State variables
    mapping(address => Student) public students;
    mapping(string => address) public studentIdToWallet;
    mapping(address => VerificationLog[]) public verificationLogs;
    mapping(address => bool) public whitelistedStudents;
    uint256 public whitelistCount;
    address[] public whitelistedAddresses;
    mapping(address => bool) public isCheater;
    event CheatingDetected(address indexed student, string reason, uint256 timestamp);
    
    // Events
    event StudentRegistered(
        address indexed walletAddress,
        string studentId,
        string subject,
        string examSession,
        uint256 timestamp
    );
    
    event IdentityVerified(
        address indexed walletAddress,
        string studentId,
        string ipAddress,
        string imageHash,
        uint256 timestamp
    );
    
    event ExamCompleted(
        address indexed walletAddress,
        string studentId,
        string subject,
        uint256 timestamp
    );
    
    event StudentWhitelisted(
        address indexed studentAddress,
        uint256 timestamp
    );
    
    event StudentRemovedFromWhitelist(
        address indexed studentAddress,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyRegisteredStudent() {
        require(students[msg.sender].isRegistered, "Student not registered");
        _;
    }
    
    modifier onlyVerifiedStudent() {
        require(students[msg.sender].isVerified, "Student not verified");
        _;
    }
    
    modifier onlyWhitelistedStudent() {
        require(whitelistedStudents[msg.sender], "Student not whitelisted");
        _;
    }
    
    // Functions
    
    /**
     * @dev Đăng ký thi cho sinh viên
     * @param _studentId MSSV của sinh viên
     * @param _subject Môn học
     * @param _examSession Ca thi
     */
    function registerForExam(
        string memory _studentId,
        string memory _subject,
        string memory _examSession
    ) external onlyWhitelistedStudent nonReentrant {
        require(!isCheater[msg.sender], "Cheating detected: action blocked");
        require(bytes(_studentId).length > 0, "Student ID cannot be empty");
        require(bytes(_subject).length > 0, "Subject cannot be empty");
        require(bytes(_examSession).length > 0, "Exam session cannot be empty");
        require(!students[msg.sender].isRegistered, "Already registered");
        require(studentIdToWallet[_studentId] == address(0), "Student ID already registered");
        
        students[msg.sender] = Student({
            studentId: _studentId,
            subject: _subject,
            examSession: _examSession,
            walletAddress: msg.sender,
            isRegistered: true,
            isVerified: false,
            registrationTime: block.timestamp,
            verificationTime: 0
        });
        
        studentIdToWallet[_studentId] = msg.sender;
        
        emit StudentRegistered(
            msg.sender,
            _studentId,
            _subject,
            _examSession,
            block.timestamp
        );
    }
    
    /**
     * @dev Xác minh danh tính sinh viên (tự xác minh)
     * @param _ipAddress IP address của sinh viên
     * @param _imageHash Hash của ảnh xác minh
     */
    function verifyIdentity(
        string memory _ipAddress,
        string memory _imageHash
    ) external onlyRegisteredStudent {
        require(!isCheater[msg.sender], "Cheating detected: action blocked");
        require(!students[msg.sender].isVerified, "Student already verified");
        
        students[msg.sender].isVerified = true;
        students[msg.sender].verificationTime = block.timestamp;
        
        VerificationLog memory log = VerificationLog({
            studentWallet: msg.sender,
            studentId: students[msg.sender].studentId,
            ipAddress: _ipAddress,
            imageHash: _imageHash,
            timestamp: block.timestamp,
            success: true
        });
        
        verificationLogs[msg.sender].push(log);
        
        emit IdentityVerified(
            msg.sender,
            students[msg.sender].studentId,
            _ipAddress,
            _imageHash,
            block.timestamp
        );
    }
    
    /**
     * @dev Ghi log xác minh thất bại
     * @param _studentWallet Địa chỉ ví của sinh viên
     * @param _ipAddress IP address
     * @param _imageHash Hash của ảnh
     * @param _reason Lý do thất bại
     */
    function logFailedVerification(
        address _studentWallet,
        string memory _ipAddress,
        string memory _imageHash,
        string memory _reason
    ) external onlyOwner {
        VerificationLog memory log = VerificationLog({
            studentWallet: _studentWallet,
            studentId: students[_studentWallet].studentId,
            ipAddress: _ipAddress,
            imageHash: _imageHash,
            timestamp: block.timestamp,
            success: false
        });
        
        verificationLogs[_studentWallet].push(log);
    }
    
    /**
     * @dev Hoàn thành thi (tự động gọi khi sinh viên hoàn thành)
     * @param _studentWallet Địa chỉ ví sinh viên
     */
    function completeExam(address _studentWallet) external onlyOwner {
        require(!isCheater[_studentWallet], "Cheating detected: action blocked");
        require(students[_studentWallet].isVerified, "Student not verified");
        
        emit ExamCompleted(
            _studentWallet,
            students[_studentWallet].studentId,
            students[_studentWallet].subject,
            block.timestamp
        );
    }
    
    /**
     * @dev Lấy thông tin sinh viên
     * @param _walletAddress Địa chỉ ví
     * @return Thông tin sinh viên
     */
    function getStudentInfo(address _walletAddress) external view returns (Student memory) {
        return students[_walletAddress];
    }
    
    /**
     * @dev Lấy log xác minh của sinh viên
     * @param _walletAddress Địa chỉ ví
     * @return Mảng log xác minh
     */
    function getVerificationLogs(address _walletAddress) external view returns (VerificationLog[] memory) {
        return verificationLogs[_walletAddress];
    }
    
    /**
     * @dev Thêm sinh viên vào whitelist (chỉ owner)
     * @param _studentAddress Địa chỉ ví sinh viên
     */
    function addStudentToWhitelist(address _studentAddress) external onlyOwner {
        require(_studentAddress != address(0), "Invalid address");
        require(!whitelistedStudents[_studentAddress], "Student already whitelisted");
        whitelistedStudents[_studentAddress] = true;
        whitelistCount++;
        whitelistedAddresses.push(_studentAddress);
        emit StudentWhitelisted(_studentAddress, block.timestamp);
    }
    
    /**
     * @dev Xóa sinh viên khỏi whitelist (chỉ owner)
     * @param _studentAddress Địa chỉ ví sinh viên
     */
    function removeStudentFromWhitelist(address _studentAddress) external onlyOwner {
        require(_studentAddress != address(0), "Invalid address");
        require(whitelistedStudents[_studentAddress], "Student not in whitelist");
        whitelistedStudents[_studentAddress] = false;
        whitelistCount--;
        // Remove from array
        for (uint i = 0; i < whitelistedAddresses.length; i++) {
            if (whitelistedAddresses[i] == _studentAddress) {
                whitelistedAddresses[i] = whitelistedAddresses[whitelistedAddresses.length - 1];
                whitelistedAddresses.pop();
                break;
            }
        }
        emit StudentRemovedFromWhitelist(_studentAddress, block.timestamp);
    }
    
    /**
     * @dev Thêm nhiều sinh viên vào whitelist cùng lúc
     * @param _studentAddresses Mảng địa chỉ ví sinh viên
     */
    function addMultipleStudentsToWhitelist(address[] memory _studentAddresses) external onlyOwner {
        for (uint256 i = 0; i < _studentAddresses.length; i++) {
            address studentAddress = _studentAddresses[i];
            if (studentAddress != address(0) && !whitelistedStudents[studentAddress]) {
                whitelistedStudents[studentAddress] = true;
                whitelistCount++;
                whitelistedAddresses.push(studentAddress);
                emit StudentWhitelisted(studentAddress, block.timestamp);
            }
        }
    }
    
    /**
     * @dev Kiểm tra sinh viên có trong whitelist không
     * @param _studentAddress Địa chỉ ví sinh viên
     * @return true nếu trong whitelist
     */
    function isStudentWhitelisted(address _studentAddress) external view returns (bool) {
        return whitelistedStudents[_studentAddress];
    }
    
    /**
     * @dev Lấy danh sách địa chỉ đã whitelist
     * @return Mảng địa chỉ ví
     */
    function getWhitelistedAddresses() external view returns (address[] memory) {
        return whitelistedAddresses;
    }
    
    /**
     * @dev Kiểm tra sinh viên đã đăng ký chưa
     * @param _walletAddress Địa chỉ ví
     * @return true nếu đã đăng ký
     */
    function isStudentRegistered(address _walletAddress) external view returns (bool) {
        return students[_walletAddress].isRegistered;
    }
    
    /**
     * @dev Kiểm tra sinh viên đã xác minh chưa
     * @param _walletAddress Địa chỉ ví
     * @return true nếu đã xác minh
     */
    function isStudentVerified(address _walletAddress) external view returns (bool) {
        return students[_walletAddress].isVerified;
    }

    function markCheating(address student, string memory reason) external onlyOwner {
        isCheater[student] = true;
        emit CheatingDetected(student, reason, block.timestamp);
    }
    /**
     * @dev Gỡ trạng thái gian lận cho sinh viên (chỉ owner)
     * @param student Địa chỉ ví sinh viên
     */
    function unmarkCheating(address student) external onlyOwner {
        isCheater[student] = false;
        // Có thể emit event nếu muốn
    }
    function isStudentCheater(address student) public view returns (bool) {
        return isCheater[student];
    }
} 
 
 
 