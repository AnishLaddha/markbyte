#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to check if a container is already running
check_container() {
    local container_name=$1
    if docker ps -a | grep -q $container_name; then
        if docker ps | grep -q $container_name; then
            echo -e "${YELLOW}Container $container_name is already running${NC}"
            return 0
        else
            echo -e "${YELLOW}Container $container_name exists but is not running. Removing...${NC}"
            docker rm $container_name >/dev/null 2>&1 || { echo -e "${RED}Failed to remove container $container_name${NC}"; exit 1; }
            return 1
        fi
    else
        return 1
    fi
}

# Function to clean up on error or interruption
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    docker stop mongodb-test redis-test >/dev/null 2>&1 || true
    docker rm mongodb-test redis-test >/dev/null 2>&1 || true
    echo -e "${YELLOW}Test environment has been cleaned up${NC}"
    exit 1
}

# Setup trap for cleanup
trap cleanup INT TERM

# Check MongoDB container
if ! check_container "mongodb-test"; then
    echo -e "${GREEN}Starting MongoDB for integration tests...${NC}"
    docker run -d --name mongodb-test -p 27017:27017 mongo:latest >/dev/null 2>&1 || { 
        echo -e "${RED}Failed to start MongoDB container${NC}"
        exit 1
    }
    
    # Wait for MongoDB to be ready
    echo -e "${YELLOW}Waiting for MongoDB to be ready...${NC}"
    for i in {1..30}; do
        if docker exec mongodb-test mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            echo -e "${GREEN}MongoDB is ready${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}MongoDB failed to start within 30 seconds${NC}"
            cleanup
        fi
        sleep 1
    done
fi

# Check Redis container
if ! check_container "redis-test"; then
    echo -e "${GREEN}Starting Redis for integration tests...${NC}"
    docker run -d --name redis-test -p 6379:6379 redis:alpine >/dev/null 2>&1 || {
        echo -e "${RED}Failed to start Redis container${NC}"
        docker stop mongodb-test >/dev/null 2>&1 || true
        docker rm mongodb-test >/dev/null 2>&1 || true
        exit 1
    }
    
    # Wait for Redis to be ready
    echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
    for i in {1..10}; do
        if docker exec redis-test redis-cli ping >/dev/null 2>&1; then
            echo -e "${GREEN}Redis is ready${NC}"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${RED}Redis failed to start within 10 seconds${NC}"
            cleanup
        fi
        sleep 1
    done
fi

# Verify both services are running
echo -e "${GREEN}Verifying services...${NC}"
if ! docker ps | grep -q mongodb-test; then
    echo -e "${RED}MongoDB container is not running${NC}"
    cleanup
fi

if ! docker ps | grep -q redis-test; then
    echo -e "${RED}Redis container is not running${NC}"
    cleanup
fi

echo -e "${GREEN}Test environment is ready!${NC}"
echo -e "${GREEN}Run tests with: go test -v ./backend/tests/integration/...${NC}"

# Setup complete
echo -e "${YELLOW}Press Ctrl+C to stop the test environment when finished${NC}"

# Wait for signal and handle it properly
trap "echo -e '${YELLOW}Stopping test containers...${NC}'; docker stop mongodb-test redis-test; docker rm mongodb-test redis-test; echo -e '${GREEN}Containers cleaned up${NC}'" EXIT

# Keep script running until Ctrl+C
while true; do sleep 1; done 