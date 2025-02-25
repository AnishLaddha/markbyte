package db

import (
	"context"
	"time"
)

type User struct {
	Username string  `json:"username" bson:"username"`
	Password string  `json:"password" bson:"password"`
	Email    *string `json:"email" bson:"email"`
}

type UserDB interface {
	CreateUser(ctx context.Context, user *User) (string, error)
	GetUser(ctx context.Context, username string) (*User, error)
	RemoveUser(ctx context.Context, username string) error
}

type BlogPostData struct {
	User         string    `json:"user" bson:"user"`
	Title        string    `json:"title" bson:"title"`
	DateUploaded time.Time `json:"date_uploaded" bson:"date_uploaded"`
	Version      string    `json:"version" bson:"version"`
	Link         *string   `json:"link,omitempty" bson:"link,omitempty"`
	IsActive     bool      `json:"is_active" bson:"is_active"`
	DirectLink   *string   `json:"direct_link,omitempty" bson:"direct_link,omitempty"`
}

type BlogPostVersionsData struct {
	User          string         `json:"user" bson:"user"`
	Title         string         `json:"title" bson:"title"`
	Versions      []BlogPostData `json:"versions" bson:"versions"`
	LatestVersion string         `json:"latest_version" bson:"latest_version"`
	ActiveVersion string         `json:"active_version" bson:"active_version"`
}

type BlogPostDataDB interface {
	CreateBlogPost(ctx context.Context, post *BlogPostData) (string, error)
	DeleteBlogPost(ctx context.Context, username string, title string, version string) error
	UpdateActiveStatus(ctx context.Context, username string, title string, version string, isActive bool) error
	FetchAllUserBlogPosts(ctx context.Context, username string) ([]BlogPostVersionsData, error)
	FetchAllPostVersions(ctx context.Context, username string, title string) (BlogPostVersionsData, error)
	FetchAllActiveBlogPosts(ctx context.Context, username string) ([]BlogPostData, error)
}
