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
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
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
		protected.Post("/publish", api.HandlePublishPostVersion)
		protected.Get("/like", api.HandleLikePost)
		protected.Get("/analytics", api.HandleGetPostAnalytics)
		protected.Post("/render", markdown_render.HandleRender)
		protected.Post("/markdown", api.HandleFetchMD)
		protected.Post("/delete", api.HandleDelete)
		protected.Get("/user/style", api.HandleFetchUserStyle)
		protected.Post("/user/style", api.HandleUpdateUserStyle)
		protected.Post("/user/pfp", api.HandleUpdateUserProfilePicture)
		protected.Post("/user/name", api.HandleUpdateUserName)
		protected.Get("/user/info", api.HandleUserInfo)
	})

	r.Get("/static/*", api.HandleStatic)
	r.Get("/{username}/{post}", api.HandleFetchBlogPost)
	r.Get("/get_all_posts", api.HandleFetchUserActivePosts)
	r.Get("/public/analytics", api.HandlePublicPostAnalytics)
	fmt.Println("Server Started.")

	return r
}
