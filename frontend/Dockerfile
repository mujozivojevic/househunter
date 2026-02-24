# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build argument for API URL (default to empty if not provided)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script that handles Railway's PORT variable
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'if [ -n "$PORT" ] && [ "$PORT" != "80" ]; then' >> /start.sh && \
    echo '  sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo 'nginx -t' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]

