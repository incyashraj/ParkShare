#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ParkShare Application Startup ===${NC}"

# Kill any existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2

# Start Backend
echo -e "${GREEN}Starting Backend...${NC}"
cd /Users/yashrajpardeshi/ParkShare/backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}"

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    # Test backend connectivity
    if curl -s http://localhost:3001 > /dev/null; then
        echo -e "${GREEN}✅ Backend responding on http://localhost:3001${NC}"
    else
        echo -e "${RED}❌ Backend not responding${NC}"
        echo "Backend log:"
        tail -10 /tmp/backend.log
    fi
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Backend log:"
    cat /tmp/backend.log
    exit 1
fi

# Start Frontend
echo -e "${GREEN}Starting Frontend...${NC}"
cd /Users/yashrajpardeshi/ParkShare/frontend
BROWSER=none npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}"

# Wait for frontend to compile
echo -e "${YELLOW}Waiting for frontend to compile...${NC}"
sleep 15

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    
    # Wait for frontend to be ready
    echo -e "${YELLOW}Checking frontend connectivity...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✅ Frontend responding on http://localhost:3000${NC}"
            break
        else
            echo -e "${YELLOW}Waiting for frontend to be ready... ($i/10)${NC}"
            sleep 3
        fi
    done
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo "Frontend log:"
    cat /tmp/frontend.log
    exit 1
fi

echo -e "${BLUE}=== ParkShare Application Started ===${NC}"
echo -e "${GREEN}🎉 Your ParkShare app is now running!${NC}"
echo -e "${YELLOW}📱 Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}⚙️  Backend:  http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}Test credentials:${NC}"
echo -e "${YELLOW}Email: test@example.com${NC}"
echo -e "${YELLOW}Password: password123${NC}"
echo -e "${YELLOW}Stripe Test Card: 4242 4242 4242 4242${NC}"
echo ""
echo -e "${RED}Press Ctrl+C to stop both services${NC}"

# Function to handle cleanup
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Services stopped${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Keep script running
while true; do
    sleep 1
done