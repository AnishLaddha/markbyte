package db

import (
	"context"
	"time"
)

type User struct {
	Username string  `json:"username" bson:"username"`
	Password string  `json:"password" bson:"password"`
	Email    *string `json:"email" bson:"email"`
	Style    string  `json:"style,omitempty" bson:"style,omitempty"`
}

type UserDB interface {
	CreateUser(ctx context.Context, user *User) (string, error)
	GetUser(ctx context.Context, username string) (*User, error)
	RemoveUser(ctx context.Context, username string) error
	GetUserStyle(ctx context.Context, username string) (string, error)
	UpdateUserStyle(ctx context.Context, username string, style string) error
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
	DeleteBlogPost(ctx context.Context, username string, title string) (int, error)
	UpdateActiveStatus(ctx context.Context, username string, title string, version string, isActive bool) error
	FetchAllUserBlogPosts(ctx context.Context, username string) ([]BlogPostVersionsData, error)
	FetchAllPostVersions(ctx context.Context, username string, title string) (BlogPostVersionsData, error)
	FetchAllActiveBlogPosts(ctx context.Context, username string) ([]BlogPostData, error)
	FetchActiveBlog(ctx context.Context, username string, title string) (string, error)
}

type PostAnalytics struct {
	Username string    `json:"username" bson:"username"`
	Title    string    `json:"title" bson:"title"`
	Version  string    `json:"version" bson:"version"`
	Date     time.Time `json:"date" bson:"date"`
	Views    int       `json:"views" bson:"views"`
	Likes    int       `json:"likes" bson:"likes"`
}

type AnalyticsDB interface {
	CreatePostAnalytics(ctx context.Context, post *PostAnalytics) (string, error)
	GetPostAnalytics(ctx context.Context, username string, title string, version string) (*PostAnalytics, error)
	UpdateViewsAnalytics(ctx context.Context, username string, title string, version string, views int) error
	UpdateLikesAnalytics(ctx context.Context, username string, title string, version string, likes int) error
	IncrementViews(ctx context.Context, username string, title string, version string) error
	IncrementLikes(ctx context.Context, username string, title string, version string) error
	DeletePostAnalytics(ctx context.Context, username string, title string) (int, error)
}
