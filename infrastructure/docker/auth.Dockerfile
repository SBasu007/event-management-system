FROM node:20-bookworm-slim
WORKDIR /app
COPY services/auth-service/package*.json ./
RUN npm install --omit=dev
COPY services/auth-service/ ./
EXPOSE 5001
CMD ["node", "src/app.js"]