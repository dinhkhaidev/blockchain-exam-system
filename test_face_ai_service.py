import requests

# Đường dẫn tới AI service
AI_URL = 'http://localhost:5001'

# Đường dẫn tới 2 ảnh khuôn mặt để test
IMAGE1_PATH = 'test1.jpg'  # Ảnh khuôn mặt 1
IMAGE2_PATH = 'test2.jpg'  # Ảnh khuôn mặt 2 (có thể giống hoặc khác)

# 1. Gửi ảnh 1 lên AI service để lấy embedding
with open(IMAGE1_PATH, 'rb') as f:
    files = {'image': f}
    r1 = requests.post(f'{AI_URL}/extract-embedding', files=files)
    print('Extract embedding 1:', r1.json())
    embedding1 = r1.json().get('embedding')

# 2. Gửi ảnh 2 lên AI service để lấy embedding
with open(IMAGE2_PATH, 'rb') as f:
    files = {'image': f}
    r2 = requests.post(f'{AI_URL}/extract-embedding', files=files)
    print('Extract embedding 2:', r2.json())
    embedding2 = r2.json().get('embedding')

# 3. So sánh 2 embedding
if embedding1 and embedding2:
    compare_payload = {
        'embedding1': embedding1,
        'embedding2': embedding2
    }
    r3 = requests.post(f'{AI_URL}/compare-embedding', json=compare_payload)
    print('Compare result:', r3.json())
else:
    print('Không lấy được embedding từ 1 hoặc 2 ảnh!') 