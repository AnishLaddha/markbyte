package auth_test

import (
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
)

func TestHashPassword(t *testing.T) {
	password := "testpassword"
	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword(%s) = %v; want nil", password, err)
	}

	if !auth.VerifyPassword(hashedPassword, password) {
		t.Fatalf("VerifyPassword(%s, %s) = false; want true", hashedPassword, password)
	}
}

// func TestSignupEndpoint(t *testing.T) {
// 	auth.ResetUsers()
// 	router := server.SetupRouter()
// 	ts := httptest.NewServer(router) // ts = This = 808 = MANGO MANGO MANGO = crashouts
// 	defer ts.Close()

// 	payload, _ := json.Marshal(map[string]string{"username": "testuser", "password": "testpassword"})

// 	resp, err := http.Post(ts.URL+"/signup", "application/json", bytes.NewBuffer(payload))
// 	if err != nil {
// 		t.Fatalf("http.Post() = %v; want nil", err)
// 	}

// 	defer resp.Body.Close()

// 	if resp.StatusCode != http.StatusCreated {
// 		t.Fatalf("Expected status code %d; got %d", http.StatusCreated, resp.StatusCode)
// 	}
// }

// func TestLoginEndpoint(t *testing.T) {
// 	auth.ResetUsers()
// 	router := server.SetupRouter()
// 	ts := httptest.NewServer(router)
// 	defer ts.Close()

// 	payload, _ := json.Marshal(map[string]string{"username": "testuser", "password": "testpassword"})
// 	resp, err := http.Post(ts.URL+"/signup", "application/json", bytes.NewBuffer(payload))
// 	if err != nil {
// 		t.Fatalf("http.Post() = %v; want nil", err)
// 	}
// 	defer resp.Body.Close()

// 	payload, _ = json.Marshal(map[string]string{"username": "testuser", "password": "testpassword"})
// 	resp, err = http.Post(ts.URL+"/login", "application/json", bytes.NewBuffer(payload))
// 	if err != nil {
// 		t.Fatalf("http.Post() = %v; want nil", err)
// 	}
// 	defer resp.Body.Close()
// }
