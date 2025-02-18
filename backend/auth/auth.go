package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"golang.org/x/crypto/bcrypt"
)

type contextAuthKey string

var UsernameKey = contextAuthKey("username")

var jwtSecret = []byte("secretkey")

var TokenAuth = jwtauth.New("HS256", jwtSecret, nil)

var userDB db.UserDB

// var users = map[string]string{}

func SetUserDB(repo db.UserDB) {
	userDB = repo
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func VerifyPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))

	return err == nil
}

func GenerateJWT(username string) (string, time.Time, error) {
	exp_time := time.Now().Add(time.Hour * 72)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"exp":      exp_time.Unix(),
	})

	t, err := token.SignedString(jwtSecret)

	return t, exp_time, err
}

func ValidateJWT(tokenStr string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, jwt.ErrInvalidKeyType
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	if exp, ok := claims["exp"].(float64); ok {
		if int64(exp) < time.Now().Unix() {
			return nil, errors.New("token expired")
		}
	}

	return token, nil
}

func JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenStr string
		cookie, err := r.Cookie("markbyte_login_token")
		if err == nil {
			tokenStr = cookie.Value
		} else {
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" {
				tokenStr = strings.TrimPrefix(authHeader, "Bearer ")

			}
		}
		if tokenStr == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		token, err := ValidateJWT(tokenStr)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["username"] == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		fmt.Println(claims["username"].(string))

		ctx := context.WithValue(r.Context(), UsernameKey, claims["username"].(string))

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
