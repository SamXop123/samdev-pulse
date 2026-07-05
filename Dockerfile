FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only (smaller image, no dev tooling)
RUN npm ci --omit=dev

# Copy application source
COPY src/ ./src/
COPY public/ ./public/
COPY scripts/ ./scripts/

# Expose the port the app runs on
EXPOSE 3000

# Default to production (overridable via docker-compose or -e)
ENV NODE_ENV=production

# Use non-root user for better security
USER node

# Start the server
CMD ["node", "src/server.js"]
