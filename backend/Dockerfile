# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install sqlite3 dependencies and OpenSSL for Prisma
RUN apk add --no-cache python3 make g++ sqlite openssl openssl-dev && \
    ln -s /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 && \
    ln -s /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port (Railway sets PORT automatically)
EXPOSE $PORT

# Start script that runs migrations then starts the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

