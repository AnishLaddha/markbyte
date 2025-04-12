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
	"go.mongodb.org/mongo-driver/v2/mongo/options"
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

func (m *MockMongoCollection) Find(ctx context.Context, filter interface{}, opts ...*mongo.FindOptions) (*mongo.Cursor, error) {
	args := m.Called(ctx, filter, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*mongo.Cursor), args.Error(1)
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

func (m *MockMongoCollection) Distinct(ctx context.Context, fieldName string, filter interface{}, opts ...*mongo.DistinctOptions) ([]interface{}, error) {
	args := m.Called(ctx, fieldName, filter)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]interface{}), args.Error(1)
}

func TestCreateBlogPost(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoBlogPostDataRepository{collection: mockCollection}

	tests := []struct {
		name          string
		post          *db.BlogPostData
		setupMock     func()
		expectedError bool
	}{
		{
			name: "Successful creation",
			post: &db.BlogPostData{
				User:         "testuser",
				Title:        "Test Post",
				DateUploaded: time.Now(),
				Version:      "1",
				IsActive:     true,
			},
			setupMock: func() {
				result := &mongo.InsertOneResult{}
				mockCollection.On("InsertOne", ctx, mock.AnythingOfType("*db.BlogPostData")).Return(result, nil)
			},
			expectedError: false,
		},
		{
			name: "Insert error",
			post: &db.BlogPostData{
				User:  "testuser",
				Title: "Test Post",
			},
			setupMock: func() {
				mockCollection.On("InsertOne", ctx, mock.AnythingOfType("*db.BlogPostData")).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			id, err := repo.CreateBlogPost(ctx, tt.post)

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

func TestDeleteBlogPost(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoBlogPostDataRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		title         string
		setupMock     func()
		expectedCount int
		expectedError bool
	}{
		{
			name:     "Successful deletion",
			username: "testuser",
			title:    "Test Post",
			setupMock: func() {
				result := &mongo.DeleteResult{DeletedCount: 1}
				mockCollection.On("DeleteOne", ctx, bson.M{"user": "testuser", "title": "Test Post"}).Return(result, nil)
			},
			expectedCount: 1,
			expectedError: false,
		},
		{
			name:     "Delete error",
			username: "testuser",
			title:    "Test Post",
			setupMock: func() {
				mockCollection.On("DeleteOne", ctx, bson.M{"user": "testuser", "title": "Test Post"}).Return(nil, assert.AnError)
			},
			expectedCount: 0,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			count, err := repo.DeleteBlogPost(ctx, tt.username, tt.title)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Equal(t, 0, count)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedCount, count)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestUpdateActiveStatus(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoBlogPostDataRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		title         string
		version       string
		isActive      bool
		setupMock     func()
		expectedError bool
	}{
		{
			name:     "Successful update",
			username: "testuser",
			title:    "Test Post",
			version:  "1",
			isActive: true,
			setupMock: func() {
				result := &mongo.UpdateResult{ModifiedCount: 1}
				mockCollection.On("UpdateOne", ctx, bson.M{"user": "testuser", "title": "Test Post", "version": "1"}, bson.M{"$set": bson.M{"is_active": true}}).Return(result, nil)
			},
			expectedError: false,
		},
		{
			name:     "Update error",
			username: "testuser",
			title:    "Test Post",
			version:  "1",
			isActive: true,
			setupMock: func() {
				mockCollection.On("UpdateOne", ctx, bson.M{"user": "testuser", "title": "Test Post", "version": "1"}, bson.M{"$set": bson.M{"is_active": true}}).Return(nil, assert.AnError)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			err := repo.UpdateActiveStatus(ctx, tt.username, tt.title, tt.version, tt.isActive)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestFetchAllUserBlogPosts(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoBlogPostDataRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		setupMock     func()
		expectedPosts []db.BlogPostVersionsData
		expectedError bool
	}{
		{
			name:     "Successful fetch",
			username: "testuser",
			setupMock: func() {
				mockCollection.On("Distinct", ctx, "title", bson.M{"user": "testuser"}).Return([]interface{}{"Post1", "Post2"}, nil)
			},
			expectedPosts: []db.BlogPostVersionsData{
				{
					User:  "testuser",
					Title: "Post1",
				},
				{
					User:  "testuser",
					Title: "Post2",
				},
			},
			expectedError: false,
		},
		{
			name:     "Fetch error",
			username: "testuser",
			setupMock: func() {
				mockCollection.On("Distinct", ctx, "title", bson.M{"user": "testuser"}).Return(nil, assert.AnError)
			},
			expectedPosts: nil,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			posts, err := repo.FetchAllUserBlogPosts(ctx, tt.username)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Nil(t, posts)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, len(tt.expectedPosts), len(posts))
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestFetchAllPostVersions(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoBlogPostDataRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		title         string
		setupMock     func()
		expectedData  db.BlogPostVersionsData
		expectedError bool
	}{
		{
			name:     "Successful fetch",
			username: "testuser",
			title:    "Test Post",
			setupMock: func() {
				cursor := &mongo.Cursor{}
				mockCollection.On("Find", ctx, bson.M{"user": "testuser", "title": "Test Post"}, mock.Anything).Return(cursor, nil)
			},
			expectedData: db.BlogPostVersionsData{
				User:  "testuser",
				Title: "Test Post",
			},
			expectedError: false,
		},
		{
			name:     "Fetch error",
			username: "testuser",
			title:    "Test Post",
			setupMock: func() {
				mockCollection.On("Find", ctx, bson.M{"user": "testuser", "title": "Test Post"}, mock.Anything).Return(nil, assert.AnError)
			},
			expectedData:  db.BlogPostVersionsData{},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			data, err := repo.FetchAllPostVersions(ctx, tt.username, tt.title)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Equal(t, db.BlogPostVersionsData{}, data)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedData.User, data.User)
				assert.Equal(t, tt.expectedData.Title, data.Title)
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestFetchAllActiveBlogPosts(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoBlogPostDataRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		setupMock     func()
		expectedPosts []db.BlogPostData
		expectedError bool
	}{
		{
			name:     "Successful fetch",
			username: "testuser",
			setupMock: func() {
				cursor := &mongo.Cursor{}
				mockCollection.On("Find", ctx, bson.M{"is_active": true, "user": "testuser"}, mock.Anything).Return(cursor, nil)
			},
			expectedPosts: []db.BlogPostData{
				{
					User:     "testuser",
					Title:    "Active Post",
					IsActive: true,
				},
			},
			expectedError: false,
		},
		{
			name:     "Fetch error",
			username: "testuser",
			setupMock: func() {
				mockCollection.On("Find", ctx, bson.M{"is_active": true, "user": "testuser"}, mock.Anything).Return(nil, assert.AnError)
			},
			expectedPosts: nil,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			posts, err := repo.FetchAllActiveBlogPosts(ctx, tt.username)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Nil(t, posts)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, len(tt.expectedPosts), len(posts))
			}

			mockCollection.AssertExpectations(t)
		})
	}
}

func TestFetchActiveBlog(t *testing.T) {
	ctx := context.Background()
	mockCollection := new(MockMongoCollection)
	repo := &MongoBlogPostDataRepository{collection: mockCollection}

	tests := []struct {
		name          string
		username      string
		title         string
		setupMock     func()
		expectedVer   string
		expectedError bool
	}{
		{
			name:     "Successful fetch",
			username: "testuser",
			title:    "Test Post",
			setupMock: func() {
				result := &mongo.SingleResult{}
				mockCollection.On("FindOne", ctx, bson.M{"user": "testuser", "title": "Test Post", "is_active": true}).Return(result)
			},
			expectedVer:   "1",
			expectedError: false,
		},
		{
			name:     "Fetch error",
			username: "testuser",
			title:    "Test Post",
			setupMock: func() {
				result := &mongo.SingleResult{}
				mockCollection.On("FindOne", ctx, bson.M{"user": "testuser", "title": "Test Post", "is_active": true}).Return(result)
			},
			expectedVer:   "",
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			version, err := repo.FetchActiveBlog(ctx, tt.username, tt.title)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Empty(t, version)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedVer, version)
			}

			mockCollection.AssertExpectations(t)
		})
	}
} 