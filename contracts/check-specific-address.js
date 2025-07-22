const { ethers } = require("hardhat");

async function checkSpecificAddress() {
  try {
    console.log("🔍 Kiểm tra địa chỉ cụ thể...");
    
    // Contract address
    const CONTRACT_ADDRESS = "0x7B98682d9325d8E2602dD214155d320031e0e82c";
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("");
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
    // Get contract instance
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const contract = ExamRegistration.attach(CONTRACT_ADDRESS);
    
    // Địa chỉ bạn đang thắc mắc
    const targetAddress = "0x8e4Cf11A8F982c0cFD54f3f1F6A0db91f0c1b30a";
    
    console.log("🎯 Địa chỉ cần kiểm tra:", targetAddress);
    console.log("");
    
    // Kiểm tra whitelist status
    try {
      const isWhitelisted = await contract.isStudentWhitelisted(targetAddress);
      console.log(`📝 Trạng thái whitelist: ${isWhitelisted ? '✅ Có trong whitelist' : '❌ Không có trong whitelist'}`);
    } catch (error) {
      console.log(`❌ Lỗi kiểm tra: ${error.message}`);
    }
    
    // Kiểm tra thông tin sinh viên nếu có
    try {
      const studentInfo = await contract.getStudentInfo(targetAddress);
      console.log("📋 Thông tin sinh viên:");
      console.log(`   Student ID: ${studentInfo.studentId}`);
      console.log(`   Subject: ${studentInfo.subject}`);
      console.log(`   Exam Session: ${studentInfo.examSession}`);
      console.log(`   Is Registered: ${studentInfo.isRegistered}`);
      console.log(`   Is Verified: ${studentInfo.isVerified}`);
    } catch (error) {
      console.log("ℹ️  Sinh viên chưa đăng ký thi");
    }
    
    console.log("");
    
    // Kiểm tra các địa chỉ khác để so sánh
    const otherAddresses = [
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    ];
    
    console.log("🔍 So sánh với các địa chỉ khác:");
    for (const addr of otherAddresses) {
      try {
        const isWhitelisted = await contract.isStudentWhitelisted(addr);
        console.log(`${addr}: ${isWhitelisted ? '✅ Whitelisted' : '❌ Not whitelisted'}`);
      } catch (error) {
        console.log(`${addr}: ❌ Error - ${error.message}`);
      }
    }
    
    console.log("");
    console.log("✅ Kiểm tra hoàn tất!");
    
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
}

checkSpecificAddress()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 