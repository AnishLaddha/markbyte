package mdb

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoBlogPostDataRepository struct {
	collection *mongo.Collection
}

var _ db.BlogPostDataDB = (*MongoBlogPostDataRepository)(nil)

func NewMongoBlogPostDataRepository(client *mongo.Client, dbName, collectionName string) *MongoBlogPostDataRepository {
	collection := client.Database(dbName).Collection(collectionName)
	return &MongoBlogPostDataRepository{collection}
}

func (r *MongoBlogPostDataRepository) CreateBlogPost(ctx context.Context, post *db.BlogPostData) (string, error) {
	res, err := r.collection.InsertOne(ctx, post)
	if err != nil {
		return "", err
	}

	idBytes, err := json.Marshal(res.InsertedID)
	if err != nil {
		return "", err
	}

	return string(idBytes), err
}

func (r *MongoBlogPostDataRepository) DeleteBlogPost(ctx context.Context, username string, title string, version string) error {
	filter := bson.M{"user": username, "title": title, "version": version}
	res, err := r.collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return fmt.Errorf("no blog post found with the given details")
	}
	return nil
}

func (r *MongoBlogPostDataRepository) UpdateActiveStatus(ctx context.Context, username string, title string, version string, isActive bool) error {
	filter := bson.M{"user": username, "title": title, "version": version}
	update := bson.M{"$set": bson.M{"is_active": isActive}}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if res.ModifiedCount == 0 {
		return fmt.Errorf("no blog post found with the given details")
	}
	return nil
}

func (r *MongoBlogPostDataRepository) FetchAllUserBlogPosts(ctx context.Context, username string) ([]db.BlogPostVersionsData, error) {

	var titles []string

	err := r.collection.Distinct(ctx, "title", bson.M{"user": username}).Decode(&titles)
	if err != nil {
		return nil, err
	}

	var blogs []db.BlogPostVersionsData

	for _, title := range titles {
		blog_data, err := r.FetchAllPostVersions(ctx, username, title)
		if err != nil {
			return nil, err
		}
		blogs = append(blogs, blog_data)
	}

	return blogs, nil
}

func (r *MongoBlogPostDataRepository) FetchAllPostVersions(ctx context.Context, username string, title string) (db.BlogPostVersionsData, error) {
	empty := db.BlogPostVersionsData{}
	filter := bson.M{"user": username, "title": title}
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return empty, err
	}
	defer cursor.Close(ctx)

	var blogs []db.BlogPostData
	if err = cursor.All(ctx, &blogs); err != nil {
		return empty, err
	}

	latestVer := 0
	activeVer := 0

	for _, blog := range blogs {
		ve, _ := strconv.Atoi(blog.Version)
		if ve > latestVer {
			latestVer = ve
		}
		if blog.IsActive {
			activeVer = ve
		}
	}

	blog_data := db.BlogPostVersionsData{
		User:          username,
		Title:         title,
		Versions:      blogs,
		LatestVersion: strconv.Itoa(latestVer),
		ActiveVersion: strconv.Itoa(activeVer),
	}

	return blog_data, nil
}

func (r *MongoBlogPostDataRepository) FetchAllActiveBlogPosts(ctx context.Context, username string) ([]db.BlogPostData, error) {
	filter := bson.M{"is_active": true, "user": username}
	opts := options.Find().SetSort(bson.D{{Key: "date_uploaded", Value: -1}})
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var blogs []db.BlogPostData
	if err = cursor.All(ctx, &blogs); err != nil {
		return nil, err
	}

	return blogs, nil
}
