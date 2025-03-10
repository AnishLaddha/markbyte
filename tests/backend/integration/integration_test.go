package integration_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/server"
)

// TestSignupEndpoint simulates sending a signup request to the API.
func TestSignupEndpoint(t *testing.T) {
	// Setup the router; ensure SetupRouter initializes all relevant routes.
	router := server.SetupRouter()
	ts := httptest.NewServer(router)
	defer ts.Close()

	signupPayload := map[string]string{
		"username": "newuser",
		"email":    "newuser@example.com",
		"password": "password123",
	}
	payloadBytes, err := json.Marshal(signupPayload)
	if err != nil {
		t.Fatalf("Error marshaling signup payload: %v", err)
	}

	resp, err := http.Post(ts.URL+"/signup", "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		t.Fatalf("POST /signup failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected status code 201, got %d", resp.StatusCode)
	}
}
