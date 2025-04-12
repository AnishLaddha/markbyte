package api

import (
	"context"
	"os"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockS3Client is a mock implementation of the S3 client
type MockS3Client struct {
	mock.Mock
}

func (m *MockS3Client) PutObject(ctx context.Context, params *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error) {
	args := m.Called(ctx, params)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*s3.PutObjectOutput), args.Error(1)
}

func (m *MockS3Client) GetObject(ctx context.Context, params *s3.GetObjectInput, optFns ...func(*s3.Options)) (*s3.GetObjectOutput, error) {
	args := m.Called(ctx, params)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*s3.GetObjectOutput), args.Error(1)
}

func (m *MockS3Client) DeleteObject(ctx context.Context, params *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error) {
	args := m.Called(ctx, params)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*s3.DeleteObjectOutput), args.Error(1)
}

func TestLoadCredentials(t *testing.T) {
	// Save original env vars
	originalEnv := map[string]string{
		"S3_BUCKET_NAME":      os.Getenv("S3_BUCKET_NAME"),
		"S3_REGION":          os.Getenv("S3_REGION"),
		"S3_ACCESS_KEY_ID":   os.Getenv("S3_ACCESS_KEY_ID"),
		"S3_SECRET_ACCESS_KEY": os.Getenv("S3_SECRET_ACCESS_KEY"),
	}

	// Clean up after test
	defer func() {
		for k, v := range originalEnv {
			if v == "" {
				os.Unsetenv(k)
			} else {
				os.Setenv(k, v)
			}
		}
	}()

	tests := []struct {
		name        string
		envVars     map[string]string
		expectError bool
	}{
		{
			name: "All credentials present",
			envVars: map[string]string{
				"S3_BUCKET_NAME":      "test-bucket",
				"S3_REGION":          "us-west-2",
				"S3_ACCESS_KEY_ID":   "test-access-key",
				"S3_SECRET_ACCESS_KEY": "test-secret-key",
			},
			expectError: false,
		},
		{
			name: "Missing bucket name",
			envVars: map[string]string{
				"S3_REGION":          "us-west-2",
				"S3_ACCESS_KEY_ID":   "test-access-key",
				"S3_SECRET_ACCESS_KEY": "test-secret-key",
			},
			expectError: true,
		},
		{
			name: "Missing region",
			envVars: map[string]string{
				"S3_BUCKET_NAME":      "test-bucket",
				"S3_ACCESS_KEY_ID":   "test-access-key",
				"S3_SECRET_ACCESS_KEY": "test-secret-key",
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment variables for test
			for k, v := range tt.envVars {
				os.Setenv(k, v)
			}

			creds, err := LoadCredentials()

			if tt.expectError {
				assert.Error(t, err)
				assert.Empty(t, creds)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.envVars["S3_BUCKET_NAME"], creds.Bucket)
				assert.Equal(t, tt.envVars["S3_REGION"], creds.Region)
				assert.Equal(t, tt.envVars["S3_ACCESS_KEY_ID"], creds.AccessKey)
				assert.Equal(t, tt.envVars["S3_SECRET_ACCESS_KEY"], creds.SecretKey)
			}
		})
	}
}

func TestUploadHTMLFile(t *testing.T) {
	mockClient := new(MockS3Client)
	ctx := context.Background()
	creds := S3Credentials{
		Bucket:    "test-bucket",
		Region:    "us-west-2",
		AccessKey: "test-access-key",
		SecretKey: "test-secret-key",
	}

	tests := []struct {
		name          string
		htmlString    string
		key           string
		setupMock     func()
		expectedError bool
	}{
		{
			name:       "Successful upload",
			htmlString: "<html><body>Test</body></html>",
			key:        "test.html",
			setupMock: func() {
				mockClient.On("PutObject", ctx, mock.AnythingOfType("*s3.PutObjectInput")).Return(&s3.PutObjectOutput{}, nil)
			},
			expectedError: false,
		},
		{
			name:       "Upload error",
			htmlString: "<html><body>Test</body></html>",
			key:        "test.html",
			setupMock: func() {
				mockClient.On("PutObject", ctx, mock.AnythingOfType("*s3.PutObjectInput")).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			url, err := UploadHTMLFile(ctx, tt.htmlString, tt.key, creds)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Empty(t, url)
			} else {
				assert.NoError(t, err)
				assert.Contains(t, url, creds.Bucket)
				assert.Contains(t, url, creds.Region)
				assert.Contains(t, url, tt.key)
			}

			mockClient.AssertExpectations(t)
		})
	}
}

func TestReadFilefromS3(t *testing.T) {
	mockClient := new(MockS3Client)
	ctx := context.Background()
	creds := S3Credentials{
		Bucket:    "test-bucket",
		Region:    "us-west-2",
		AccessKey: "test-access-key",
		SecretKey: "test-secret-key",
	}

	tests := []struct {
		name          string
		key           string
		content       string
		setupMock     func()
		expectedError bool
	}{
		{
			name:    "Successful read",
			key:     "test.html",
			content: "<html><body>Test</body></html>",
			setupMock: func() {
				mockClient.On("GetObject", ctx, mock.AnythingOfType("*s3.GetObjectInput")).Return(&s3.GetObjectOutput{}, nil)
			},
			expectedError: false,
		},
		{
			name:    "Read error",
			key:     "test.html",
			content: "",
			setupMock: func() {
				mockClient.On("GetObject", ctx, mock.AnythingOfType("*s3.GetObjectInput")).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			content, err := ReadFilefromS3(ctx, tt.key, creds)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Empty(t, content)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, content)
			}

			mockClient.AssertExpectations(t)
		})
	}
}

func TestDeleteFile(t *testing.T) {
	mockClient := new(MockS3Client)
	ctx := context.Background()
	creds := S3Credentials{
		Bucket:    "test-bucket",
		Region:    "us-west-2",
		AccessKey: "test-access-key",
		SecretKey: "test-secret-key",
	}

	tests := []struct {
		name          string
		key           string
		setupMock     func()
		expectedError bool
	}{
		{
			name: "Successful delete",
			key:  "test.html",
			setupMock: func() {
				mockClient.On("DeleteObject", ctx, mock.AnythingOfType("*s3.DeleteObjectInput")).Return(&s3.DeleteObjectOutput{}, nil)
			},
			expectedError: false,
		},
		{
			name: "Delete error",
			key:  "test.html",
			setupMock: func() {
				mockClient.On("DeleteObject", ctx, mock.AnythingOfType("*s3.DeleteObjectInput")).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			err := DeleteFile(ctx, tt.key, creds)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			mockClient.AssertExpectations(t)
		})
	}
} 