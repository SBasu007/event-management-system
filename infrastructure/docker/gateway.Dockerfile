FROM node:20-bookworm-slim
WORKDIR /app
COPY api-gateway/package*.json ./
RUN npm install --omit=dev
COPY api-gateway/ ./
EXPOSE 5000
CMD ["node", "src/app.js"]