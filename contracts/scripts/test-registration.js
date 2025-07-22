const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Student Registration...");

  // Lấy signer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  // Lấy contract
  const examRegistration = await ethers.getContract("ExamRegistration");
  console.log("📋 Contract address:", await examRegistration.getAddress());

  // Test address
  const testStudentAddress = "0x4EE204518233e2e71025C75E59eF204435479844";
  const testStudentId = "SV001";
  const testSubject = "Toán học";
  const testExamSession = "Ca 1 (8:00 - 10:00)";

  console.log("\n📊 Current Status:");
  console.log("📍 Test student address:", testStudentAddress);
  
  try {
    const isWhitelisted = await examRegistration.isStudentWhitelisted(testStudentAddress);
    const isRegistered = await examRegistration.isStudentRegistered(testStudentAddress);
    const isVerified = await examRegistration.isStudentVerified(testStudentAddress);
    
    console.log("   Whitelisted:", isWhitelisted);
    console.log("   Registered:", isRegistered);
    console.log("   Verified:", isVerified);
  } catch (error) {
    console.log("❌ Error checking status:", error.message);
  }

  // Thêm vào whitelist nếu chưa có
  try {
    const isWhitelisted = await examRegistration.isStudentWhitelisted(testStudentAddress);
    if (!isWhitelisted) {
      console.log("\n➕ Adding student to whitelist...");
      const tx = await examRegistration.addStudentToWhitelist(testStudentAddress);
      await tx.wait();
      console.log("✅ Student added to whitelist");
    } else {
      console.log("\nℹ️  Student already in whitelist");
    }
  } catch (error) {
    console.log("❌ Error adding to whitelist:", error.message);
  }

  // Test registration
  try {
    console.log("\n📝 Testing registration...");
    console.log("   Student ID:", testStudentId);
    console.log("   Subject:", testSubject);
    console.log("   Exam Session:", testExamSession);
    
    const tx = await examRegistration.registerForExam(
      testStudentId,
      testSubject,
      testExamSession
    );
    
    console.log("📋 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Registration successful! Block:", receipt.blockNumber);
    
    // Kiểm tra lại trạng thái
    const isRegistered = await examRegistration.isStudentRegistered(testStudentAddress);
    console.log("📊 Registration status after:", isRegistered);
    
    if (isRegistered) {
      const studentInfo = await examRegistration.getStudentInfo(testStudentAddress);
      console.log("📋 Student info:", {
        studentId: studentInfo.studentId,
        subject: studentInfo.subject,
        examSession: studentInfo.examSession,
        walletAddress: studentInfo.walletAddress,
        registrationTime: studentInfo.registrationTime.toString(),
        isVerified: studentInfo.isVerified
      });
    }
    
  } catch (error) {
    console.log("❌ Error during registration:", error.message);
    console.log("❌ Error code:", error.code);
  }

  console.log("\n✅ Test completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 