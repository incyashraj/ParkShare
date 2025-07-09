#!/bin/bash

# Kill any existing processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "Starting ParkShare Backend..."
cd /Users/yashrajpardeshi/ParkShare/backend
npm start &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo "Waiting for backend to start..."
sleep 5

echo "Starting ParkShare Frontend..."
cd /Users/yashrajpardeshi/ParkShare/frontend
BROWSER=none npm start &
FRONTEND_PID=$!

echo "Frontend started with PID: $FRONTEND_PID"
echo "Backend running on: http://localhost:3001"
echo "Frontend running on: http://localhost:3000"
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID