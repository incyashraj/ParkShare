#!/bin/bash

# ParkShare Development Script
# This script helps manage the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Killing process on port $port"
        lsof -ti:$port | xargs kill -9
        sleep 2
    fi
}

# Function to install dependencies
install_deps() {
    print_status "Installing dependencies for all components..."
    
    # Root dependencies
    npm install
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    # Mobile dependencies
    print_status "Installing mobile dependencies..."
    cd ParkShareMobile && npm install && cd ..
    
    print_success "All dependencies installed successfully!"
}

# Function to start services
start_services() {
    local service=$1
    
    case $service in
        "all"|"")
            print_status "Starting all services..."
            kill_port 3000
            kill_port 3001
            npm start
            ;;
        "backend")
            print_status "Starting backend service..."
            kill_port 3001
            cd backend && npm start
            ;;
        "frontend")
            print_status "Starting frontend service..."
            kill_port 3000
            cd frontend && npm start
            ;;
        "mobile")
            print_status "Starting mobile service..."
            cd ParkShareMobile && npm start
            ;;
        *)
            print_error "Unknown service: $service"
            print_status "Available services: all, backend, frontend, mobile"
            exit 1
            ;;
    esac
}

# Function to stop services
stop_services() {
    print_status "Stopping all ParkShare services..."
    kill_port 3000
    kill_port 3001
    print_success "All services stopped!"
}

# Function to check service status
check_status() {
    print_status "Checking service status..."
    
    if check_port 3000; then
        print_success "Frontend (React) is running on port 3000"
    else
        print_warning "Frontend (React) is not running"
    fi
    
    if check_port 3001; then
        print_success "Backend (Node.js) is running on port 3001"
    else
        print_warning "Backend (Node.js) is not running"
    fi
}

# Function to show help
show_help() {
    echo "ParkShare Development Script"
    echo ""
    echo "Usage: ./scripts/dev.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install          Install all dependencies"
    echo "  start [service]  Start services (all, backend, frontend, mobile)"
    echo "  stop             Stop all services"
    echo "  status           Check service status"
    echo "  clean            Clean all node_modules"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev.sh install"
    echo "  ./scripts/dev.sh start"
    echo "  ./scripts/dev.sh start backend"
    echo "  ./scripts/dev.sh status"
}

# Function to clean node_modules
clean_all() {
    print_status "Cleaning all node_modules..."
    rm -rf node_modules
    cd backend && rm -rf node_modules && cd ..
    cd frontend && rm -rf node_modules && cd ..
    cd ParkShareMobile && rm -rf node_modules && cd ..
    print_success "All node_modules cleaned!"
}

# Main script logic
case $1 in
    "install")
        install_deps
        ;;
    "start")
        start_services $2
        ;;
    "stop")
        stop_services
        ;;
    "status")
        check_status
        ;;
    "clean")
        clean_all
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 