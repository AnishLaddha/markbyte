package mdb

import (
	"context"
	"testing"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// MockMongoCollection is a mock implementation of the MongoDB collection
type MockMongoCollection struct {
	mock.Mock
}

func (m *MockMongoCollection) InsertOne(ctx context.Context, document interface{}, opts ...*mongo.InsertOneOptions) (*mongo.InsertOneResult, error) {
	args := m.Called(ctx, document)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*mongo.InsertOneResult), args.Error(1)
}

func (m *MockMongoCollection) FindOne(ctx context.Context, filter interface{}, opts ...*mongo.FindOneOptions) *mongo.SingleResult {
	args := m.Called(ctx, filter)
	return args.Get(0).(*mongo.SingleResult)
}

func (m *MockMongoCollection) DeleteOne(ctx context.Context, filter interface{}, opts ...*mongo.DeleteOptions) (*mongo.DeleteResult, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*mongo.DeleteResult), args.Error(1)
}

func (m *MockMongoCollection) UpdateOne(ctx context.Context, filter interface{}, update interface{}, opts ...*mongo.UpdateOptions) (*mongo.UpdateResult, error) {
	args := m.Called(ctx, filter, update)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*mongo.UpdateResult), args.Error(1)
}

func TestCreateUser(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoUserRepository{collection: mockCollection}

	tests := []struct {
		name          string
		user          *db.User
		setupMock     func()
		expectedError bool
	}{
		{
			name: "Successful creation",
			user: &db.User{
				Username: "testuser",
				Password: "hashedpassword",
				Email:    stringPtr("test@example.com"),
			},
			setupMock: func() {
				result := &mongo.InsertOneResult{}
				mockCollection.On("InsertOne", ctx, mock.AnythingOfType("*db.User")).Return(result, nil)
			},
			expectedError: false,
		},
		{
			name: "Insert error",
			user: &db.User{
				Username: "testuser",
				Password: "hashedpassword",
			},
			setupMock: func() {
				mockCollection.On("InsertOne", ctx, mock.AnythingOfType("*db.User")).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			id, err := repo.CreateUser(ctx, tt.user)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Empty(t, id)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, id)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestGetUser(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoUserRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		setupMock     func()
		expectedUser  *db.User
		expectedError bool
	}{
		{
			name:     "User found",
			username: "testuser",
			setupMock: func() {
				result := &mongo.SingleResult{}
				mockCollection.On("FindOne", ctx, map[string]string{"username": "testuser"}).Return(result)
			},
			expectedUser: &db.User{
				Username: "testuser",
				Password: "hashedpassword",
			},
			expectedError: false,
		},
		{
			name:     "User not found",
			username: "nonexistent",
			setupMock: func() {
				result := &mongo.SingleResult{}
				mockCollection.On("FindOne", ctx, map[string]string{"username": "nonexistent"}).Return(result)
			},
			expectedUser:  nil,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			user, err := repo.GetUser(ctx, tt.username)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Nil(t, user)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedUser.Username, user.Username)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestRemoveUser(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoUserRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		setupMock     func()
		expectedError bool
	}{
		{
			name:     "Successful removal",
			username: "testuser",
			setupMock: func() {
				result := &mongo.DeleteResult{}
				mockCollection.On("DeleteOne", ctx, map[string]string{"username": "testuser"}).Return(result, nil)
			},
			expectedError: false,
		},
		{
			name:     "Delete error",
			username: "testuser",
			setupMock: func() {
				mockCollection.On("DeleteOne", ctx, map[string]string{"username": "testuser"}).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			err := repo.RemoveUser(ctx, tt.username)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestGetUserStyle(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoUserRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		setupMock     func()
		expectedStyle string
		expectedError bool
	}{
		{
			name:     "Style found",
			username: "testuser",
			setupMock: func() {
				result := &mongo.SingleResult{}
				mockCollection.On("FindOne", ctx, map[string]string{"username": "testuser"}).Return(result)
			},
			expectedStyle: "default",
			expectedError: false,
		},
		{
			name:     "User not found",
			username: "nonexistent",
			setupMock: func() {
				result := &mongo.SingleResult{}
				mockCollection.On("FindOne", ctx, map[string]string{"username": "nonexistent"}).Return(result)
			},
			expectedStyle: "",
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			style, err := repo.GetUserStyle(ctx, tt.username)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Empty(t, style)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedStyle, style)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestUpdateUserStyle(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoUserRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		style         string
		setupMock     func()
		expectedError bool
	}{
		{
			name:     "Successful update",
			username: "testuser",
			style:    "dark",
			setupMock: func() {
				result := &mongo.UpdateResult{}
				mockCollection.On("UpdateOne", ctx, bson.M{"username": "testuser"}, bson.M{"$set": bson.M{"style": "dark"}}).Return(result, nil)
			},
			expectedError: false,
		},
		{
			name:     "Update error",
			username: "testuser",
			style:    "dark",
			setupMock: func() {
				mockCollection.On("UpdateOne", ctx, bson.M{"username": "testuser"}, bson.M{"$set": bson.M{"style": "dark"}}).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			err := repo.UpdateUserStyle(ctx, tt.username, tt.style)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func stringPtr(s string) *string {
	return &s
} 