#!/bin/sh
# Start script for Railway deployment
# Uses PORT environment variable or defaults to 8080

PORT="${PORT:-8080}"
echo "Starting uvicorn on port $PORT"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
