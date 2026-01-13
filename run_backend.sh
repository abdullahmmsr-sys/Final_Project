#!/bin/bash

# Run only the backend server

echo "Starting Backend API..."

# Activate virtual environment from external SSD
source /Volumes/external/compliance_project/venv/bin/activate

# Run from project root
cd "$(dirname "$0")"

# Export environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
