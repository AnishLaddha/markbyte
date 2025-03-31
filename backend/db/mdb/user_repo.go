package mdb

import (
	"context"
	"encoding/json"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type MongoUserRepository struct {
	collection *mongo.Collection
}

var _ db.UserDB = (*MongoUserRepository)(nil)

func NewMongoUserRepository(client *mongo.Client, dbName, collectionName string) *MongoUserRepository {
	collection := client.Database(dbName).Collection(collectionName)
	return &MongoUserRepository{collection}
}

// CreateUser creates a new user in the database
func (r *MongoUserRepository) CreateUser(ctx context.Context, user *db.User) (string, error) {
	res, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return "", err
	}
	idBytes, err := json.Marshal(res.InsertedID)
	if err != nil {
		return "", err
	}

	return string(idBytes), err
}

func (r *MongoUserRepository) GetUser(ctx context.Context, username string) (*db.User, error) {
	var user db.User
	err := r.collection.FindOne(ctx, map[string]string{"username": username}).Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *MongoUserRepository) RemoveUser(ctx context.Context, username string) error {
	_, err := r.collection.DeleteOne(ctx, map[string]string{"username": username})
	return err
}

func (r *MongoUserRepository) GetUserStyle(ctx context.Context, username string) (string, error) {
	var user db.User
	err := r.collection.FindOne(ctx, map[string]string{"username": username}).Decode(&user)
	if err != nil {
		return "", err
	}
	if user.Style == "" {
		return "default", nil
	}
	return user.Style, nil
}

func (r *MongoUserRepository) UpdateUserStyle(ctx context.Context, username string, style string) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"username": username}, bson.M{"$set": bson.M{"style": style}})
	return err
}
