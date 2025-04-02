package mdb

import (
	"context"
	"encoding/json"
	"fmt"

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

func (r *MongoAnalyticsRepository) GetPostAnalytics(ctx context.Context, username string, title string, version string) (*db.PostAnalytics, error) {
	filter := map[string]string{"username": username, "title": title, "version": version}
	var analytics db.PostAnalytics
	err := r.collection.FindOne(ctx, filter).Decode(&analytics)
	if err != nil {
		return nil, err
	}
	return &analytics, nil
}

func (r *MongoAnalyticsRepository) UpdateViewsAnalytics(ctx context.Context, username string, title string, version string, views int) error {
	filter := bson.M{"username": username, "title": title, "version": version}
	update := bson.M{"$set": bson.M{"views": views}}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.ModifiedCount == 0 {
		return fmt.Errorf("no analytics found with the given details")
	}
	return nil
}

func (r *MongoAnalyticsRepository) IncrementViews(ctx context.Context, username string, title string, version string) error {
	filter := bson.M{"username": username, "title": title, "version": version}
	update := bson.M{"$inc": bson.M{"views": 1}}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.ModifiedCount == 0 {
		return fmt.Errorf("no analytics found with the given details")
	}
	return nil
}

func (r *MongoAnalyticsRepository) UpdateLikesAnalytics(ctx context.Context, username string, title string, version string, likes int) error {
	filter := bson.M{"username": username, "title": title, "version": version}
	update := bson.M{"$set": bson.M{"likes": likes}}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.ModifiedCount == 0 {
		return fmt.Errorf("no analytics found with the given details")
	}
	return nil
}

func (r *MongoAnalyticsRepository) IncrementLikes(ctx context.Context, username string, title string, version string) error {
	filter := bson.M{"username": username, "title": title, "version": version}
	update := bson.M{"$inc": bson.M{"likes": 1}}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.ModifiedCount == 0 {
		return fmt.Errorf("no analytics found with the given details")
	}
	return nil
}

func (r *MongoAnalyticsRepository) DeletePostAnalytics(ctx context.Context, username string, title string) (int, error) {
	filter := bson.M{"username": username, "title": title}
	res, err := r.collection.DeleteMany(ctx, filter)
	if err != nil {
		return 0, err
	}
	return int(res.DeletedCount), nil
}
