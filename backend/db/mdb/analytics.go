package mdb

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type MongoAnalyticsRepository struct {
	collection *mongo.Collection
}

var _ db.AnalyticsDB = (*MongoAnalyticsRepository)(nil)

func NewMongoAnalyticsRepository(client *mongo.Client, dbName, collectionName string) *MongoAnalyticsRepository {
	collection := client.Database(dbName).Collection(collectionName)
	return &MongoAnalyticsRepository{collection}
}

func (r *MongoAnalyticsRepository) CreatePostAnalytics(ctx context.Context, analytics *db.PostAnalytics) (string, error) {
	res, err := r.collection.InsertOne(ctx, analytics)
	if err != nil {
		return "", err
	}

	idBytes, err := json.Marshal(res.InsertedID)
	if err != nil {
		return "", err
	}

	return string(idBytes), err
}

func (r *MongoAnalyticsRepository) GetPostAnalytics(ctx context.Context, username string, title string, version string) (db.PostAnalytics, error) {
	filter := map[string]string{"username": username, "title": title, "version": version}
	var analytics db.PostAnalytics
	err := r.collection.FindOne(ctx, filter).Decode(&analytics)
	if err != nil {
		return db.PostAnalytics{}, err
	}
	return analytics, nil
}

func (r *MongoAnalyticsRepository) IncrementViews(ctx context.Context, username string, title string, version string) error {
	filter := bson.M{"username": username, "title": title, "version": version}
	update := bson.M{"$push": bson.M{"views": time.Now()}}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.ModifiedCount == 0 {
		return fmt.Errorf("no analytics found with the given details")
	}
	return nil
}

// func (r *MongoAnalyticsRepository) IncrementLikes(ctx context.Context, username string, title string, version string) error {
// 	filter := bson.M{"username": username, "title": title, "version": version}
// 	update := bson.M{"$inc": bson.M{"likes": 1}}
// 	res, err := r.collection.UpdateOne(ctx, filter, update)
// 	if err != nil {
// 		return err
// 	}
// 	if res.ModifiedCount == 0 {
// 		return fmt.Errorf("no analytics found with the given details")
// 	}
// 	return nil
// }

func (r *MongoAnalyticsRepository) ToggleLike(ctx context.Context, postUsername string, title string, version string, likingUsername string) (bool, error) {
	filter := bson.M{"username": postUsername, "title": title, "version": version}

	// Try to add the like first
	update := bson.M{"$addToSet": bson.M{"likes": likingUsername}}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}
	if res.ModifiedCount == 0 {
		// If no document was modified, try to remove the like
		update = bson.M{"$pull": bson.M{"likes": likingUsername}}
		res, err = r.collection.UpdateOne(ctx, filter, update)
		if err != nil {
			return false, err
		}
		if res.ModifiedCount == 0 {
			return false, fmt.Errorf("no analytics found with the given details")
		}
		return false, nil // Post was unliked
	}
	return true, nil // Post was liked
}

func (r *MongoAnalyticsRepository) DeletePostAnalytics(ctx context.Context, username string, title string) (int, error) {
	filter := bson.M{"username": username, "title": title}
	res, err := r.collection.DeleteMany(ctx, filter)
	if err != nil {
		return 0, err
	}
	return int(res.DeletedCount), nil
}

func (r *MongoAnalyticsRepository) GetAllPostTimeStamps(ctx context.Context, username string, active_posts []db.BlogPostData) ([]time.Time, error) {
	post_timestamps := []time.Time{}
	for _, post := range active_posts {
		filter := bson.M{"username": username, "title": post.Title, "version": post.Version}
		var analytics db.PostAnalytics
		err := r.collection.FindOne(ctx, filter).Decode(&analytics)
		if err != nil {
			return nil, err
		}
		post_timestamps = append(post_timestamps, analytics.Views...)
	}
	return post_timestamps, nil
}
