# Stage 1: Build the React frontend with Vite
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend-react/package*.json ./
RUN npm install
COPY frontend-react ./
RUN npm run build

# Stage 2: Build the Flask backend
FROM python:3.12-slim
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files (excluding frontend-react which is already built)
COPY . .

# Copy Vite build to static folder
COPY --from=frontend-builder /app/dist ./frontend-react/dist

EXPOSE 5000

CMD ["python", "main.py"]
