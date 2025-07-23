import React, { useRef, useState } from 'react';
import axios from 'axios';

function StudentVerify() {
  const [walletAddress, setWalletAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const [imageFile, setImageFile] = useState(null);

  // Kết nối MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } else {
      alert('Vui lòng cài đặt MetaMask!');
    }
  };

  // Bật webcam
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // Chụp ảnh từ webcam
  const capture = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    canvasRef.current.toBlob(blob => {
      setImageFile(new File([blob], 'face.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
  };

  // Upload file ảnh
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Gửi xác thực
  const handleVerify = async () => {
    if (!walletAddress || !imageFile) {
      alert('Vui lòng đăng nhập ví và chọn/chụp ảnh!');
      return;
    }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('walletAddress', walletAddress);
    formData.append('face', imageFile);
    try {
      const res = await axios.post('/api/student/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, error: err.response?.data?.error || err.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Xác minh danh tính sinh viên</h2>
      <button onClick={connectWallet} disabled={!!walletAddress}>
        {walletAddress ? `Đã kết nối: ${walletAddress.slice(0, 8)}...` : 'Kết nối MetaMask'}
      </button>
      <div style={{ margin: '16px 0' }}>
        <video ref={videoRef} width={320} height={240} autoPlay style={{ display: 'block', marginBottom: 8 }} />
        <button onClick={startCamera}>Bật camera</button>
        <button onClick={capture}>Chụp ảnh</button>
        <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
      </div>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <button onClick={handleVerify} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? 'Đang xác thực...' : 'Xác thực'}
      </button>
      {result && (
        <div style={{ marginTop: 16 }}>
          {result.success && result.verified && <span style={{ color: 'green' }}>✅ Xác thực thành công!</span>}
          {result.success && !result.verified && <span style={{ color: 'red' }}>❌ Không đúng khuôn mặt hoặc không đủ quyền!</span>}
          {!result.success && <span style={{ color: 'red' }}>Lỗi: {result.error}</span>}
        </div>
      )}
    </div>
  );
}

export default StudentVerify; 