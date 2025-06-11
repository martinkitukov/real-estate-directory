# Frontend Dockerfile for Development
FROM node:18-alpine

WORKDIR /app

# Install dependencies needed for some npm packages
RUN apk add --no-cache libc6-compat

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for Next.js
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Development server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"] 