import React, { useRef, useState } from 'react';
import axios from 'axios';

function AdminAddStudent() {
  const [studentId, setStudentId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const [imageFile, setImageFile] = useState(null);

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

  // Gửi đăng ký
  const handleAddStudent = async () => {
    if (!studentId || !walletAddress || !imageFile) {
      alert('Vui lòng nhập đủ thông tin và chọn/chụp ảnh!');
      return;
    }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('walletAddress', walletAddress);
    formData.append('face', imageFile);
    try {
      const res = await axios.post('/api/admin/add-student', formData, {
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
      <h2>Thêm sinh viên & Mint NFT</h2>
      <div>
        <label>Mã sinh viên:</label>
        <input value={studentId} onChange={e => setStudentId(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div>
        <label>Địa chỉ ví:</label>
        <input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={{ margin: '16px 0' }}>
        <video ref={videoRef} width={320} height={240} autoPlay style={{ display: 'block', marginBottom: 8 }} />
        <button onClick={startCamera}>Bật camera</button>
        <button onClick={capture}>Chụp ảnh</button>
        <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
      </div>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <button onClick={handleAddStudent} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? 'Đang xử lý...' : 'Thêm sinh viên & Mint NFT'}
      </button>
      {result && (
        <div style={{ marginTop: 16 }}>
          {result.success && <span style={{ color: 'green' }}>✅ Mint NFT thành công!<br/>TxHash: {result.txHash}<br/>MetadataURI: {result.metadataURI}</span>}
          {!result.success && <span style={{ color: 'red' }}>Lỗi: {result.error}</span>}
        </div>
      )}
    </div>
  );
}

export default AdminAddStudent; 