#!/bin/bash

# Compliance Checker - Run Script
# This script starts both the backend and frontend servers

echo "=============================================="
echo "   COMPLIANCE CHECKER - Starting Services"
echo "=============================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env and add your GROQ_API_KEY"
fi

# Check for Python virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🐍 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt --quiet

# Start backend in background
echo "🚀 Starting Backend API (port 8000)..."
cd backend 2>/dev/null || true
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if node_modules exists for frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start frontend
echo "🌐 Starting Frontend (port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "=============================================="
echo "   Services Started Successfully!"
echo "=============================================="
echo "  Backend API:  http://localhost:8000"
echo "  Frontend:     http://localhost:3000"
echo "  API Docs:     http://localhost:8000/docs"
echo "=============================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Handle shutdown
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for processes
wait
