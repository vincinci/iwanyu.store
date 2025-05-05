FROM node:18-alpine

WORKDIR /app

# Copy the entire application first
COPY . .

# Install dependencies using npm install
RUN npm install

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Start the application with migrations and seeding
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
