FROM python:3.10-slim
RUN apt-get update && \
    apt-get install -y cmake build-essential && \
    rm -rf /var/lib/apt/lists/*
RUN pip install flask face_recognition numpy
COPY face_ai_service.py /app/face_ai_service.py
WORKDIR /app
CMD ["python", "face_ai_service.py"]