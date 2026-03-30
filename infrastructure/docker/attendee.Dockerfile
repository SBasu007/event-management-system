FROM node:20-bookworm-slim
WORKDIR /app
COPY services/attendee-service/package*.json ./
RUN npm install --omit=dev
COPY services/attendee-service/ ./
EXPOSE 5004
CMD ["node", "src/app.js"]