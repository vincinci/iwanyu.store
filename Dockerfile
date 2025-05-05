# Build stage
FROM node:16-slim AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --quiet

# Copy source code
COPY backend/ ./

# Build the application
RUN npm run build

# Production stage
FROM node:16-slim

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --quiet --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/tsconfig.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Start the application with migrations and seeding
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
