# Multi-stage build for React/Vite app

# Stage 1: Build the application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package.json ./

# Clean install dependencies (ignore lock file if corrupted)
RUN npm install --silent --force

# Copy source code (exclude problematic files)
COPY src ./src
COPY public ./public
COPY index.html .
COPY vite.config.js .
COPY tailwind.config.js .
COPY postcss.config.js .

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine AS production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
