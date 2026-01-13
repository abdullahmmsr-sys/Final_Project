#!/bin/bash

# Run only the frontend server

echo "Starting Frontend..."

cd "$(dirname "$0")/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

npm start
