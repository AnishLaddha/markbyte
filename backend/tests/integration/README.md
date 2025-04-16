# Integration Tests for markbyte

This directory contains integration tests for the markbyte application. These tests verify that the different components of the system work together correctly.

## Test Overview

The integration tests are designed to test:

1. **API Endpoints** - Verifies that all API endpoints work correctly
2. **Database Operations** - Tests database CRUD operations
3. **Authentication Flow** - Tests user registration, login, and authentication

## Test Requirements

- Docker for running MongoDB and Redis test containers
- Go testing environment

## Running the Tests

### 1. Set up the test environment

First, start the required Docker containers for testing:

```bash
# Make the script executable
chmod +x setup_test_env.sh

# Run the script to start MongoDB and Redis containers
./setup_test_env.sh
```

### 2. Run the tests

Once the test environment is set up, run the tests with:

```bash
# Make the script executable
chmod +x run_tests.sh

# Run the tests
./run_tests.sh
```

Alternatively, you can run specific test files directly:

```bash
cd ../../  # Navigate to backend root
go test -v ./tests/integration/api_integration_test.go
go test -v ./tests/integration/db_integration_test.go
```

### 3. Clean up

When you're done testing, press Ctrl+C in the terminal where `setup_test_env.sh` is running to stop and remove the Docker containers.

## Test Files

- **api_integration_test.go**: Tests all API endpoints to ensure they accept requests and return responses
- **db_integration_test.go**: Tests database CRUD operations
- **setup_test_env.sh**: Script to set up test environment with Docker containers
- **run_tests.sh**: Script to run all integration tests

## Notes

- These tests verify that the components work together correctly but don't fix any issues in the actual code
- If tests fail, they indicate where there might be issues in the application's integration points
- The tests use separate test databases to avoid affecting production data 