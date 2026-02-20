# Stage 1: React Frontend bauen
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm install
COPY frontend-react/ ./
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=frontend-builder /app/frontend-react/dist ./frontend-react/dist

EXPOSE 8080
ENV FLASK_ENV=production
ENV PORT=8080

CMD ["python", "main.py"]
