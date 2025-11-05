# Frontend Dockerfile for Auto Trading App (Optional - Expo doesn't typically need Docker)
# Note: This is for containerization purposes only. Expo apps are typically built via EAS.
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Expose port (for Metro bundler if needed)
EXPOSE 8081

# Note: For production, you would typically use EAS build instead
# This Dockerfile is mainly for development/testing purposes
CMD ["npm", "start"]

