#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ParkShare Clean Restart ===${NC}"

# Kill ALL existing Node.js processes that might interfere
echo -e "${YELLOW}🧹 Cleaning up ALL existing processes...${NC}"
pkill -f "node" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true

# Wait for processes to terminate
sleep 3

# Check if ports are free
echo -e "${YELLOW}🔍 Checking port availability...${NC}"
if lsof -i :3001 >/dev/null 2>&1; then
    echo -e "${RED}❌ Port 3001 still in use, force killing...${NC}"
    lsof -ti :3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo -e "${RED}❌ Port 3000 still in use, force killing...${NC}"
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}✅ Ports are now free${NC}"

# Start Backend with explicit localhost binding
echo -e "${GREEN}🚀 Starting Backend (localhost:3001)...${NC}"
cd /Users/yashrajpardeshi/ParkShare/backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}"

# Wait and verify backend
sleep 8
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend process running${NC}"
    
    # Test backend connectivity
    for i in {1..10}; do
        if curl -s -f http://localhost:3001/api/spots > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend API responding at http://localhost:3001${NC}"
            break
        else
            echo -e "${YELLOW}⏳ Waiting for backend API... ($i/10)${NC}"
            sleep 2
        fi
        
        if [ $i -eq 10 ]; then
            echo -e "${RED}❌ Backend API not responding after 20 seconds${NC}"
            echo -e "${YELLOW}Backend log:${NC}"
            tail -20 /tmp/backend.log
            exit 1
        fi
    done
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo -e "${YELLOW}Backend log:${NC}"
    cat /tmp/backend.log
    exit 1
fi

# Start Frontend with explicit localhost
echo -e "${GREEN}🎨 Starting Frontend (localhost:3000)...${NC}"
cd /Users/yashrajpardeshi/ParkShare/frontend
PORT=3000 BROWSER=none npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}"

# Wait for frontend to compile and start
echo -e "${YELLOW}⏳ Waiting for frontend to compile...${NC}"
sleep 20

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend process running${NC}"
    
    # Test frontend connectivity  
    for i in {1..15}; do
        if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend responding at http://localhost:3000${NC}"
            break
        else
            echo -e "${YELLOW}⏳ Waiting for frontend... ($i/15)${NC}"
            sleep 3
        fi
        
        if [ $i -eq 15 ]; then
            echo -e "${RED}❌ Frontend not responding after 45 seconds${NC}"
            echo -e "${YELLOW}Frontend log:${NC}"
            tail -20 /tmp/frontend.log
            exit 1
        fi
    done
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo -e "${YELLOW}Frontend log:${NC}"
    cat /tmp/frontend.log
    exit 1
fi

echo -e "${BLUE}=== ✅ ParkShare Successfully Started ===${NC}"
echo -e "${GREEN}🎉 Both services are running with consistent localhost URLs!${NC}"
echo ""
echo -e "${YELLOW}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}🔧 Backend:  http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}🧪 Test URLs:${NC}"
echo -e "${YELLOW}• API Health: curl http://localhost:3001/api/spots${NC}"
echo -e "${YELLOW}• Frontend:   Open http://localhost:3000 in browser${NC}"
echo ""
echo -e "${BLUE}📝 Login Credentials:${NC}"
echo -e "${YELLOW}• Email: test@example.com${NC}"
echo -e "${YELLOW}• Password: password123${NC}"
echo ""
echo -e "${RED}Press Ctrl+C to stop both services${NC}"

# Function to handle cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped cleanly${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Keep script running and monitor processes
while true; do
    # Check if processes are still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}❌ Backend process died${NC}"
        exit 1
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${RED}❌ Frontend process died${NC}"
        exit 1
    fi
    
    sleep 5
done