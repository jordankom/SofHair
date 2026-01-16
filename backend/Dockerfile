# BACKEND - Dockerfile pour Cloud Run
FROM node:20-alpine

WORKDIR /app

# Dépendances
COPY package*.json ./
RUN npm ci

# Code
COPY . .

# Build TS -> JS
RUN npm run build

# Cloud Run
ENV NODE_ENV=production
EXPOSE 8080

# Démarrage
CMD ["node", "dist/server.js"]
