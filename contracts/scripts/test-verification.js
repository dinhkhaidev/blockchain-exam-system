const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Identity Verification...");

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
  const testIpAddress = "192.168.1.100";
  const testImageHash = "test_image_hash_123456789";

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

  // Đăng ký thi nếu chưa đăng ký
  try {
    const isRegistered = await examRegistration.isStudentRegistered(testStudentAddress);
    if (!isRegistered) {
      console.log("\n📝 Registering student for exam...");
      const tx = await examRegistration.registerForExam(
        testStudentId,
        testSubject,
        testExamSession
      );
      await tx.wait();
      console.log("✅ Student registered for exam");
    } else {
      console.log("\nℹ️  Student already registered");
    }
  } catch (error) {
    console.log("❌ Error registering for exam:", error.message);
  }

  // Test verification
  try {
    console.log("\n🔐 Testing verification...");
    console.log("   IP Address:", testIpAddress);
    console.log("   Image Hash:", testImageHash);
    
    const isVerified = await examRegistration.isStudentVerified(testStudentAddress);
    if (isVerified) {
      console.log("ℹ️  Student already verified");
    } else {
      const tx = await examRegistration.verifyIdentity(
        testIpAddress,
        testImageHash
      );
      
      console.log("📋 Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Verification successful! Block:", receipt.blockNumber);
    }
    
    // Kiểm tra lại trạng thái
    const isVerifiedAfter = await examRegistration.isStudentVerified(testStudentAddress);
    console.log("📊 Verification status after:", isVerifiedAfter);
    
    if (isVerifiedAfter) {
      const studentInfo = await examRegistration.getStudentInfo(testStudentAddress);
      console.log("📋 Student info:", {
        studentId: studentInfo.studentId,
        subject: studentInfo.subject,
        examSession: studentInfo.examSession,
        walletAddress: studentInfo.walletAddress,
        registrationTime: studentInfo.registrationTime.toString(),
        isVerified: studentInfo.isVerified,
        verificationTime: studentInfo.verificationTime ? studentInfo.verificationTime.toString() : 'N/A',
        ipAddress: studentInfo.ipAddress || 'N/A',
        imageHash: studentInfo.imageHash || 'N/A'
      });
    }
    
  } catch (error) {
    console.log("❌ Error during verification:", error.message);
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