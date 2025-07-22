const { ethers } = require("hardhat");

async function testConnection() {
  console.log("🔍 Kiểm tra kết nối với smart contracts...\n");

  try {
    // Lấy signer
    const [signer] = await ethers.getSigners();
    console.log("✅ Signer:", await signer.getAddress());

    // Deploy contracts để test
    console.log("\n📝 Deploying ExamRegistration contract...");
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const examRegistration = await ExamRegistration.deploy();
    await examRegistration.waitForDeployment();
    const examRegistrationAddress = await examRegistration.getAddress();
    console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);

    console.log("\n🎨 Deploying ExamCertificateNFT contract...");
    const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
    const examCertificateNFT = await ExamCertificateNFT.deploy();
    await examCertificateNFT.waitForDeployment();
    const examCertificateNFTAddress = await examCertificateNFT.getAddress();
    console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);

    // Test các function cơ bản
    console.log("\n🧪 Testing contract functions...");

    // Test đăng ký thi
    console.log("📝 Testing registerForExam...");
    const tx = await examRegistration.registerForExam(
      "SV001",
      "Blockchain",
      "Ca 1"
    );
    await tx.wait();
    console.log("✅ registerForExam successful");

    // Test lấy thông tin sinh viên
    console.log("👤 Testing getStudentInfo...");
    const studentInfo = await examRegistration.getStudentInfo(await signer.getAddress());
    console.log("✅ getStudentInfo successful");
    console.log("   Student ID:", studentInfo.studentId);
    console.log("   Subject:", studentInfo.subject);
    console.log("   Is Registered:", studentInfo.isRegistered);

    // Test mint NFT
    console.log("\n🎨 Testing mintCertificate...");
    const mintTx = await examCertificateNFT.mintCertificate(
      await signer.getAddress(),
      "SV001",
      "Blockchain",
      "Ca 1",
      "192.168.1.1",
      "ipfs://metadata"
    );
    await mintTx.wait();
    console.log("✅ mintCertificate successful");

    // Test lấy thông tin NFT
    console.log("📊 Testing getExamInfo...");
    const tokenId = await examCertificateNFT.getTokenIdByWallet(await signer.getAddress());
    const examInfo = await examCertificateNFT.getExamInfo(tokenId);
    console.log("✅ getExamInfo successful");
    console.log("   Token ID:", tokenId.toString());
    console.log("   Student ID:", examInfo.studentId);
    console.log("   Subject:", examInfo.subject);

    console.log("\n🎉 TẤT CẢ TEST ĐỀU THÀNH CÔNG!");
    console.log("✅ Smart contracts hoạt động bình thường");
    console.log("✅ Frontend có thể kết nối và sử dụng");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 

async function testConnection() {
  console.log("🔍 Kiểm tra kết nối với smart contracts...\n");

  try {
    // Lấy signer
    const [signer] = await ethers.getSigners();
    console.log("✅ Signer:", await signer.getAddress());

    // Deploy contracts để test
    console.log("\n📝 Deploying ExamRegistration contract...");
    const ExamRegistration = await ethers.getContractFactory("ExamRegistration");
    const examRegistration = await ExamRegistration.deploy();
    await examRegistration.waitForDeployment();
    const examRegistrationAddress = await examRegistration.getAddress();
    console.log("✅ ExamRegistration deployed to:", examRegistrationAddress);

    console.log("\n🎨 Deploying ExamCertificateNFT contract...");
    const ExamCertificateNFT = await ethers.getContractFactory("ExamCertificateNFT");
    const examCertificateNFT = await ExamCertificateNFT.deploy();
    await examCertificateNFT.waitForDeployment();
    const examCertificateNFTAddress = await examCertificateNFT.getAddress();
    console.log("✅ ExamCertificateNFT deployed to:", examCertificateNFTAddress);

    // Test các function cơ bản
    console.log("\n🧪 Testing contract functions...");

    // Test đăng ký thi
    console.log("📝 Testing registerForExam...");
    const tx = await examRegistration.registerForExam(
      "SV001",
      "Blockchain",
      "Ca 1"
    );
    await tx.wait();
    console.log("✅ registerForExam successful");

    // Test lấy thông tin sinh viên
    console.log("👤 Testing getStudentInfo...");
    const studentInfo = await examRegistration.getStudentInfo(await signer.getAddress());
    console.log("✅ getStudentInfo successful");
    console.log("   Student ID:", studentInfo.studentId);
    console.log("   Subject:", studentInfo.subject);
    console.log("   Is Registered:", studentInfo.isRegistered);

    // Test mint NFT
    console.log("\n🎨 Testing mintCertificate...");
    const mintTx = await examCertificateNFT.mintCertificate(
      await signer.getAddress(),
      "SV001",
      "Blockchain",
      "Ca 1",
      "192.168.1.1",
      "ipfs://metadata"
    );
    await mintTx.wait();
    console.log("✅ mintCertificate successful");

    // Test lấy thông tin NFT
    console.log("📊 Testing getExamInfo...");
    const tokenId = await examCertificateNFT.getTokenIdByWallet(await signer.getAddress());
    const examInfo = await examCertificateNFT.getExamInfo(tokenId);
    console.log("✅ getExamInfo successful");
    console.log("   Token ID:", tokenId.toString());
    console.log("   Student ID:", examInfo.studentId);
    console.log("   Subject:", examInfo.subject);

    console.log("\n🎉 TẤT CẢ TEST ĐỀU THÀNH CÔNG!");
    console.log("✅ Smart contracts hoạt động bình thường");
    console.log("✅ Frontend có thể kết nối và sử dụng");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 
 
 