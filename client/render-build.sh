#!/bin/bash
set -e

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Create a simple file to indicate successful build
echo "Build completed successfully!"
