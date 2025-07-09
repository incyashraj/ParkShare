#!/bin/bash

echo "🔧 Restarting ParkShare with API fixes..."

# Kill existing processes
pkill -f "node server.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 3

# Start backend
echo "🚀 Starting backend with fixed API routes..."
cd /Users/yashrajpardeshi/ParkShare/backend
npm start &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Waiting for backend to start..."
sleep 8

# Test backend
echo "🧪 Testing backend APIs..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Backend basic connectivity: OK"
else
    echo "❌ Backend basic connectivity: FAILED"
    exit 1
fi

# Test API endpoints
echo "Testing API endpoints..."
API_TESTS=(
    "http://localhost:3001/api/users"
    "http://localhost:3001/api/parking-spots"
)

for endpoint in "${API_TESTS[@]}"; do
    if curl -s "$endpoint" > /dev/null; then
        echo "✅ $endpoint: OK"
    else
        echo "❌ $endpoint: FAILED"
    fi
done

# Test auth endpoint
echo "Testing auth endpoint..."
AUTH_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"uid":"test123"}' \
    http://localhost:3001/api/login)

if echo "$AUTH_RESPONSE" | grep -q "message"; then
    echo "✅ Auth endpoint: OK"
else
    echo "❌ Auth endpoint: FAILED"
fi

# Start frontend
echo "🎨 Starting frontend..."
cd /Users/yashrajpardeshi/ParkShare/frontend
PORT=3000 npm start &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo "Waiting for frontend to compile..."
sleep 20

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
fi

echo ""
echo "🎯 Application Status:"
echo "• Backend: http://localhost:3001"
echo "• Frontend: http://localhost:3000"
echo "• Test Login: Email: test@example.com, Password: password123"
echo ""
echo "🔧 API Changes Made:"
echo "• All routes now use /api/ prefix"
echo "• Frontend updated to match backend routes"
echo "• Authentication endpoints fixed"
echo ""
echo "Press Ctrl+C to stop both services"

# Keep running
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' SIGINT SIGTERM
wait