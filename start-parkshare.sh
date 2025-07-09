#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting ParkShare Application...${NC}"

# Kill any existing processes on ports 3000 and 3001
echo -e "${YELLOW}📋 Cleaning up existing processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start Backend
echo -e "${GREEN}⚙️  Starting ParkShare Backend...${NC}"
cd /Users/yashrajpardeshi/ParkShare/backend
npm start &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
echo -e "${YELLOW}⏳ Waiting for backend to initialize...${NC}"
sleep 5

# Start Frontend
echo -e "${GREEN}🎨 Starting ParkShare Frontend...${NC}"
cd /Users/yashrajpardeshi/ParkShare/frontend
BROWSER=none npm start &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
echo ""
echo -e "${GREEN}🎉 ParkShare is now running!${NC}"
echo -e "${YELLOW}📱 Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}⚙️  Backend:  http://localhost:3001${NC}"
echo ""
echo -e "${RED}Press Ctrl+C to stop both services${NC}"
echo ""

# Function to handle cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping ParkShare services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID