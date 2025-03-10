package auth_test

import (
	"testing"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
)

// TestHashAndVerifyPassword verifies that a password is hashed and then successfully verified.
func TestHashAndVerifyPassword(t *testing.T) {
	password := "testpassword"
	hashed, err := auth.HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword returned error: %v", err)
	}
	if !auth.VerifyPassword(hashed, password) {
		t.Fatalf("VerifyPassword failed for password: %s", password)
	}
}

// TestJWTGenerationAndValidation verifies that a JWT generated for a user is valid.
func TestJWTGenerationAndValidation(t *testing.T) {
	user := &auth.User{
		ID:       "12345",
		Username: "testuser",
	}
	token, err := auth.GenerateJWT(user)
	if err != nil {
		t.Fatalf("GenerateJWT returned error: %v", err)
	}

	valid, err := auth.ValidateJWT(token)
	if err != nil {
		t.Fatalf("ValidateJWT returned error: %v", err)
	}
	if !valid {
		t.Fatalf("ValidateJWT failed for token: %s", token)
	}
}
