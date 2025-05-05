FROM node:18.20.0

WORKDIR /app

# Copy backend directory
COPY backend ./

# Install dependencies
RUN cd /app && npm install

# Build the application
RUN cd /app && npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Start the application with migrations and seeding
CMD ["sh", "-c", "cd /app && npm run migrate && npm run seed && npm start"]
