# Frontend Dockerfile for Development
FROM node:18-alpine

WORKDIR /app

# Install dependencies needed for some npm packages and curl for healthcheck
RUN apk add --no-cache libc6-compat curl

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with memory optimization
RUN npm ci --prefer-offline --no-audit --maxsockets 1

# Copy source code
COPY . .

# Set environment variables for Next.js with memory optimization
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

EXPOSE 3000

# Development server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"] 