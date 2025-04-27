package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/shrijan-swaminathan/markbyte/backend/api"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db/mdb"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
	"github.com/shrijan-swaminathan/markbyte/backend/server"
)

func main() {
	_ = godotenv.Load()

	var MONGO_URL string
	if os.Getenv("RUNNING_IN_DOCKER") == "true" {
		env_mongo_url := os.Getenv("MONGO_URL")
		if env_mongo_url != "" {
			MONGO_URL = env_mongo_url
		} else {
			MONGO_URL = "mongodb://mongo:27017"
		}
	} else {
		MONGO_URL = "mongodb://localhost:27017"
	}
	userDB, err := mdb.NewUserDB(MONGO_URL, "markbyte", "users")
	if err != nil {
		log.Fatalf("Failed to create userDB: %v\n", err)
	}
	auth.SetUserDB(userDB)
	api.SetUserDB(userDB)
	markdown_render.SetUserDB(userDB)

	blogPostDataDB, err := mdb.NewBlogPostDataDB(MONGO_URL, "markbyte", "blog_post_data")
	if err != nil {
		log.Fatalf("Failed to create blogPostDataDB: %v\n", err)
	}
	api.SetBlogPostDataDB(blogPostDataDB)

	analyticsDB, err := mdb.NewMongoAnalyticsDB(MONGO_URL, "markbyte", "analytics")
	if err != nil {
		log.Fatalf("Failed to create analyticsDB: %v\n", err)
	}
	api.SetAnalyticsDB(analyticsDB)

	err = redisdb.Init()
	if err != nil {
		fmt.Printf("\nFailed to create Redis Instance\n")
	}

	api.SetGithubToken(os.Getenv("GITHUB_TOKEN"))

	port := ":8080"
	fmt.Printf("Starting server on %s\n", port)
	err = http.ListenAndServe("0.0.0.0:8080", server.SetupRouter())
	if err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
	}
}
