#!/bin/bash

# Kill any existing processes on ports 3000 and 5173
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true

echo "Starting Multiply.ai development environment..."
echo "Frontend will be available at http://localhost:5173"
echo "Backend will be available at http://localhost:3000"
echo ""

# Start backend server in background
echo "Starting backend server..."
cd "$(dirname "$0")"
NODE_ENV=development node server/index.ts &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend dev server
echo "Starting frontend dev server..."
vite --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "Shutting down development servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for processes
wait