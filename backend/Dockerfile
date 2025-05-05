FROM node:18

WORKDIR /app

# Copy everything at once
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Build the application
RUN npm ci || npm install

# Expose the port
EXPOSE 10000

# Start the application with migrations and seeding
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
