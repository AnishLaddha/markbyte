package auth_test

import (
	"testing"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/stretchr/testify/assert"
)

func TestHashPassword(t *testing.T) {
	password := "testPassword123!"
	hashedPassword, err := auth.HashPassword(password)

	assert.NoError(t, err, "HashPassword should not return an error")
	assert.NotEqual(t, password, hashedPassword, "Hashed password should be different from original")
	assert.NotEmpty(t, hashedPassword, "Hashed password should not be empty")
}

func TestVerifyPassword(t *testing.T) {
	password := "testPassword123!"
	hashedPassword, _ := auth.HashPassword(password)

	assert.True(t, auth.VerifyPassword(hashedPassword, password), "Password verification should succeed")
	assert.False(t, auth.VerifyPassword(hashedPassword, "wrongPassword"), "Password verification should fail for incorrect password")
}

func TestGenerateJWT(t *testing.T) {
	username := "testuser"
	token, expirationTime, err := auth.GenerateJWT(username)

	assert.NoError(t, err, "GenerateJWT should not return an error")
	assert.NotEmpty(t, token, "Generated token should not be empty")
	assert.True(t, expirationTime.After(time.Now()), "Expiration time should be in the future")
}

func TestValidateJWT(t *testing.T) {
	username := "testuser"
	token, _, _ := auth.GenerateJWT(username)
	print(token, "\n")
	_, err := auth.ValidateJWT(token)
	assert.NoError(t, err, "ValidateJWT should not return an error for a valid token")
	// assert.Equal(t, new_token, token, "Validated token should not be nil")
	// _, err = auth.ValidateJWT("invalidtoken")
	// assert.Error(t, err, "ValidateJWT should return an error for an invalid token")
}