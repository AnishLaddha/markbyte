#!/bin/bash

# Set the environment variable to indicate we're running in test mode
export TESTING=true 

# Use test database names
export TEST_MONGO_URL="mongodb://localhost:27017"
export TEST_REDIS_HOST="localhost"
export TEST_REDIS_PORT="6379"

# Add JWT secret for testing
export JWT_SECRET="test_jwt_secret_for_integration_tests"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure the docker containers are running for tests
MONGO_RUNNING=$(docker ps | grep mongodb-test)
REDIS_RUNNING=$(docker ps | grep redis-test)

if [ -z "$MONGO_RUNNING" ] || [ -z "$REDIS_RUNNING" ]; then
    echo -e "${RED}MongoDB or Redis test containers not running${NC}"
    echo "Please run setup_test_env.sh first to start the test environment"
    exit 1
fi

# Run the integration tests
echo -e "${GREEN}Running integration tests...${NC}"
cd ../../ # Navigate to backend directory 
go test -v ./tests/integration/...

# Get the exit code
TEST_EXIT_CODE=$?

# Output the result
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All integration tests passed!${NC}"
else
    echo -e "${RED}Some integration tests failed${NC}"
fi

# Return the original exit code
exit $TEST_EXIT_CODE 