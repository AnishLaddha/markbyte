package server

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/shrijan-swaminathan/markbyte/backend/api"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
)

func CORS(next http.Handler) http.Handler {

	allowedOrigins := map[string]bool{
		"http://localhost:5173":    true,
		"https://markbyte.xyz":     true,
		"https://www.markbyte.xyz": true,
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")
		if origin == "" || allowedOrigins[origin] {
			if origin != "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				w.Header().Set("Access-Control-Allow-Origin", "https://markbyte.xyz")
			}
		} else {
			http.Error(w, "Origin not allowed", http.StatusForbidden)
			return
		}

		//w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func SetupRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(CORS)

	r.Post("/signup", auth.HandleSignup)
	r.Post("/login", auth.HandleLogin)
	r.Post("/logout", auth.HandleLogout)

	// Protected routes
	r.Group(func(protected chi.Router) {
		// protected.Use(jwtauth.Verifier(auth.TokenAuth))
		// protected.Use(jwtauth.Authenticator(auth.TokenAuth))
		protected.Use(auth.JWTAuthMiddleware)

		protected.Get("/auth", auth.HandleLoggedInUser)
		protected.Post("/upload", api.HandleUpload)
		protected.Post("/zipupload", api.HandleZipUpload)
		protected.Get("/user/blog_posts", api.HandleFetchAllBlogPosts)
		protected.Post("/upload/github", api.HandleGithubUpload)
		protected.Post("/publish", api.HandlePublishPostVersion)
		protected.Post("/render", markdown_render.HandleRender)
		protected.Post("/markdown", api.HandleFetchMD)
		protected.Post("/delete", api.HandleDelete)
		protected.Get("/user/style", api.HandleFetchUserStyle)
		protected.Post("/user/style", api.HandleUpdateUserStyle)
		protected.Post("/user/pfp", api.HandleUpdateUserProfilePicture)
		protected.Post("/user/name", api.HandleUpdateUserName)
		protected.Get("/user/info", api.HandleUserInfo)
		protected.Post("/post/analytics", api.HandleGetPostAnalytics)
		protected.Get("/user/analytics", api.HandleAllAnalytics)
		protected.Get("/user/analytics/timestamps", api.HandleUserActiveTimestamps)
		protected.Post("/user/about/upload", api.HandleAboutPageUpload)
	})

	r.Get("/static/*", api.HandleStatic)
	r.Get("/{username}/{post}", api.HandleFetchBlogPost)
	r.Get("/user/posts", api.HandleFetchUserActivePosts)
	r.Post("/user/about", api.HandleAboutPageGet)
	r.Get("/discover/new", api.HandleDiscoverNewPosts)
	r.Get("/discover/top", api.HandleDiscoverTopPosts)
	fmt.Println("Server Started.")

	return r
}
