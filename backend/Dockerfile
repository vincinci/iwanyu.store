FROM node:18-alpine

WORKDIR /app

# Install dependencies required for bcrypt
RUN apk add --no-cache make gcc g++ python3 git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Start the application with migrations and seeding
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
