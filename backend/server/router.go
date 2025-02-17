package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/jwtauth/v5"
	"github.com/shrijan-swaminathan/markbyte/backend/api"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")

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

	// Protected routes
	r.Group(func(protected chi.Router) {
		protected.Use(jwtauth.Verifier(auth.TokenAuth))
		protected.Use(jwtauth.Authenticator(auth.TokenAuth))
		protected.Use(auth.JWTAuthMiddleware)

		protected.Post("/upload", api.HandleUpload)
		protected.Get("/user/blog_posts", api.HandleFetchAllBlogPosts)

	})

	r.Get("/static/*", api.HandleStatic)
	r.Get("/{username}/{post}", api.HandleFetchBlogPost)

	return r
}
