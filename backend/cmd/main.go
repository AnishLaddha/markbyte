package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/shrijan-swaminathan/markbyte/backend/api"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db/mdb"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
	"github.com/shrijan-swaminathan/markbyte/backend/server"
)

func main() {
	var MONGO_URL string
	if os.Getenv("RUNNING_IN_DOCKER") == "true" {
		MONGO_URL = "mongodb://mongo:27017"
	} else {
		MONGO_URL = "mongodb://localhost:27017"
	}
	userDB, err := mdb.NewUserDB(MONGO_URL, "markbyte", "users")
	if err != nil {
		fmt.Printf("Failed to create userDB: %v\n", err)
	}
	auth.SetUserDB(userDB)

	blogPostDataDB, err := mdb.NewBlogPostDataDB(MONGO_URL, "markbyte", "blog_post_data")
	if err != nil {
		fmt.Printf("Failed to create blogPostDataDB: %v\n", err)
	}
	api.SetBlogPostDataDB(blogPostDataDB)

	analyticsDB, err := mdb.NewMongoAnalyticsDB(MONGO_URL, "markbyte", "analytics")
	if err != nil {
		fmt.Printf("Failed to create analyticsDB: %v\n", err)
	}
	api.SetAnalyticsDB(analyticsDB)

	err = redisdb.Init()
	if err != nil {
		fmt.Printf("\nFailed to create Redis Instance\n")
	}

	port := ":8080"
	fmt.Printf("Starting server on %s\n", port)
	err = http.ListenAndServe(port, server.SetupRouter())
	if err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
	}
}
