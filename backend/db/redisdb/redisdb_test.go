package redisdb

import (
	"context"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRedisClient is a mock implementation of the Redis client
type MockRedisClient struct {
	mock.Mock
}

func (m *MockRedisClient) Ping(ctx context.Context) *redis.StatusCmd {
	args := m.Called(ctx)
	return args.Get(0).(*redis.StatusCmd)
}

func (m *MockRedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.StatusCmd {
	args := m.Called(ctx, key, value, expiration)
	return args.Get(0).(*redis.StatusCmd)
}

func (m *MockRedisClient) Get(ctx context.Context, key string) *redis.StringCmd {
	args := m.Called(ctx, key)
	return args.Get(0).(*redis.StringCmd)
}

func (m *MockRedisClient) Del(ctx context.Context, keys ...string) *redis.IntCmd {
	args := m.Called(ctx, keys)
	return args.Get(0).(*redis.IntCmd)
}

func (m *MockRedisClient) Scan(ctx context.Context, cursor uint64, match string, count int64) *redis.ScanCmd {
	args := m.Called(ctx, cursor, match, count)
	return args.Get(0).(*redis.ScanCmd)
}

func TestInit(t *testing.T) {
	tests := []struct {
		name          string
		setupEnv      func()
		expectedError bool
	}{
		{
			name: "Docker environment",
			setupEnv: func() {
				os.Setenv("RUNNING_IN_DOCKER", "true")
			},
			expectedError: false,
		},
		{
			name: "Local environment",
			setupEnv: func() {
				os.Setenv("RUNNING_IN_DOCKER", "false")
			},
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupEnv()
			err := Init()
			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestSetEndpoint(t *testing.T) {
	ctx := context.Background()
	htmlContent := "<html><body>Test</body></html>"

	tests := []struct {
		name          string
		endpoint      string
		htmlContent   *string
		setupMock     func(*MockRedisClient)
		expectedError bool
	}{
		{
			name:        "Successful set",
			endpoint:    "/test",
			htmlContent: &htmlContent,
			setupMock: func(m *MockRedisClient) {
				m.On("Set", ctx, "/test", htmlContent, 20*time.Minute).Return(redis.NewStatusCmd(ctx))
			},
			expectedError: false,
		},
		{
			name:          "Nil content",
			endpoint:      "/test",
			htmlContent:   nil,
			setupMock:     func(m *MockRedisClient) {},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := new(MockRedisClient)
			tt.setupMock(mockClient)

			err := SetEndpoint(ctx, tt.endpoint, tt.htmlContent)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				mockClient.AssertExpectations(t)
			}
		})
	}
}

func TestGetEndpoint(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		endpoint      string
		expectedValue string
		setupMock     func(*MockRedisClient)
		expectedError bool
	}{
		{
			name:          "Successful get",
			endpoint:      "/test",
			expectedValue: "<html><body>Test</body></html>",
			setupMock: func(m *MockRedisClient) {
				cmd := redis.NewStringCmd(ctx)
				cmd.SetVal("<html><body>Test</body></html>")
				m.On("Get", ctx, "/test").Return(cmd)
			},
			expectedError: false,
		},
		{
			name:          "Key not found",
			endpoint:      "/nonexistent",
			expectedValue: "",
			setupMock: func(m *MockRedisClient) {
				cmd := redis.NewStringCmd(ctx)
				cmd.SetErr(redis.Nil)
				m.On("Get", ctx, "/nonexistent").Return(cmd)
			},
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := new(MockRedisClient)
			tt.setupMock(mockClient)

			value, err := GetEndpoint(ctx, tt.endpoint)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedValue, value)
				mockClient.AssertExpectations(t)
			}
		})
	}
}

func TestDeleteEndpoint(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		endpoint      string
		setupMock     func(*MockRedisClient)
		expectedError bool
	}{
		{
			name:     "Successful delete",
			endpoint: "/test",
			setupMock: func(m *MockRedisClient) {
				cmd := redis.NewIntCmd(ctx)
				cmd.SetVal(1)
				m.On("Del", ctx, "/test").Return(cmd)
			},
			expectedError: false,
		},
		{
			name:     "Delete error",
			endpoint: "/test",
			setupMock: func(m *MockRedisClient) {
				cmd := redis.NewIntCmd(ctx)
				cmd.SetErr(assert.AnError)
				m.On("Del", ctx, "/test").Return(cmd)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := new(MockRedisClient)
			tt.setupMock(mockClient)

			err := DeleteEndpoint(ctx, tt.endpoint)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				mockClient.AssertExpectations(t)
			}
		})
	}
}

func TestDeleteEndpointByPrefix(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		prefix        string
		setupMock     func(*MockRedisClient)
		expectedError bool
	}{
		{
			name:   "Successful delete by prefix",
			prefix: "test",
			setupMock: func(m *MockRedisClient) {
				scanCmd := redis.NewScanCmd(ctx)
				scanCmd.SetVal([]string{"test1", "test2"}, 0)
				m.On("Scan", ctx, uint64(0), "test*", int64(1000)).Return(scanCmd)

				delCmd := redis.NewIntCmd(ctx)
				delCmd.SetVal(2)
				m.On("Del", ctx, []string{"test1", "test2"}).Return(delCmd)
			},
			expectedError: false,
		},
		{
			name:   "Scan error",
			prefix: "test",
			setupMock: func(m *MockRedisClient) {
				scanCmd := redis.NewScanCmd(ctx)
				scanCmd.SetErr(assert.AnError)
				m.On("Scan", ctx, uint64(0), "test*", int64(1000)).Return(scanCmd)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := new(MockRedisClient)
			tt.setupMock(mockClient)

			err := DeleteEndpointByPrefix(ctx, tt.prefix)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				mockClient.AssertExpectations(t)
			}
		})
	}
} 