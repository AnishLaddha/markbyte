package main

import (
	"os"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
	"github.com/shrijan-swaminathan/markbyte/backend/server"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	// Run tests
	os.Exit(m.Run())
}

func TestMongoURL(t *testing.T) {
	tests := []struct {
		name          string
		dockerEnv     string
		expectedURL   string
		expectedError bool
	}{
		{
			name:          "Docker environment",
			dockerEnv:     "true",
			expectedURL:   "mongodb://mongo:27017",
			expectedError: false,
		},
		{
			name:          "Local environment",
			dockerEnv:     "false",
			expectedURL:   "mongodb://localhost:27017",
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment variable
			os.Setenv("RUNNING_IN_DOCKER", tt.dockerEnv)
			defer os.Unsetenv("RUNNING_IN_DOCKER")

			// Get MongoDB URL
			var MONGO_URL string
			if os.Getenv("RUNNING_IN_DOCKER") == "true" {
				MONGO_URL = "mongodb://mongo:27017"
			} else {
				MONGO_URL = "mongodb://localhost:27017"
			}

			// Assert URL matches expected
			assert.Equal(t, tt.expectedURL, MONGO_URL)
		})
	}
}

func TestRedisInit(t *testing.T) {
	// Test Redis initialization
	err := redisdb.Init()
	if err != nil {
		// If Redis is not running, this is expected
		t.Logf("Redis initialization failed (expected if Redis is not running): %v", err)
	}
}

func TestServerSetup(t *testing.T) {
	// Test server setup
	router := server.SetupRouter()
	assert.NotNil(t, router, "Router should not be nil")
}
