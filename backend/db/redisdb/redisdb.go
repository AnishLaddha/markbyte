package redisdb

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var client *redis.Client
var RedisActive bool

func Init() error {
	var REDIS_URL string
	if os.Getenv("RUNNING_IN_DOCKER") == "true" {
		REDIS_URL = "redis:6379"
	} else {
		REDIS_URL = "localhost:6379"
	}
	client = redis.NewClient(&redis.Options{
		Addr:     REDIS_URL,
		Password: "",
		DB:       0,
	})

	ctx := context.Background()
	_, err := client.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("failed to connect to redis")
		RedisActive = false
		return err
	}
	RedisActive = true
	return nil
}

// func GetClient() *redis.Client {
// 	return client
// }

func SetEndpoint(ctx context.Context, endpoint string, htmlContent *string) error {
	if htmlContent == nil {
		return fmt.Errorf("htmlContent is nil")
	}
	err := client.Set(ctx, endpoint, *htmlContent, 20*time.Minute).Err()
	if err != nil {
		fmt.Println("failed to set value (redis)")
		return err
	}
	return nil
}

func GetEndpoint(ctx context.Context, endpoint string) (string, error) {
	val, err := client.Get(ctx, endpoint).Result()
	if err != redis.Nil && err != nil {
		fmt.Printf("Error getting value from redis %v", err)
		return "", err
	}
	return val, nil
}

func DeleteEndpoint(ctx context.Context, endpoint string) error {
	del, err := client.Del(ctx, endpoint).Result()
	if err != nil {
		fmt.Printf("error deleting in redis: %v", err)
		return err
	} else if del > 1 {
		fmt.Printf("multiple deleted")
	}
	return nil
}
