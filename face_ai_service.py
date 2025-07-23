from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import io

app = Flask(__name__)

def get_face_embedding(image_bytes):
    img = face_recognition.load_image_file(io.BytesIO(image_bytes))
    encodings = face_recognition.face_encodings(img)
    if len(encodings) == 0:
        return None
    return encodings[0].tolist()

@app.route('/extract-embedding', methods=['POST'])
def extract_embedding():
    file = request.files['image']
    embedding = get_face_embedding(file.read())
    if embedding is None:
        return jsonify({'success': False, 'msg': 'No face found'}), 400
    return jsonify({'success': True, 'embedding': embedding})

@app.route('/compare-embedding', methods=['POST'])
def compare_embedding():
    data = request.json
    emb1 = np.array(data['embedding1'])
    emb2 = np.array(data['embedding2'])
    distance = np.linalg.norm(emb1 - emb2)
    threshold = 0.6  # Có thể điều chỉnh
    # Ép kiểu về bool và float chuẩn của Python để tránh lỗi Flask 3.x
    match = bool(distance < threshold)
    distance_val = float(distance)
    return jsonify({'match': match, 'distance': distance_val})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)