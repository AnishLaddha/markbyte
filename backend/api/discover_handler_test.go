package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHandleDiscoverNewPosts(t *testing.T) {
	blogPostDataDB = &mockBlogPostDataDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	req := httptest.NewRequest("GET", "/", nil)
	rr := httptest.NewRecorder()
	HandleDiscoverNewPosts(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestHandleDiscoverTopPosts(t *testing.T) {
	blogPostDataDB = &mockBlogPostDataDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	req := httptest.NewRequest("GET", "/", nil)
	rr := httptest.NewRecorder()
	HandleDiscoverTopPosts(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}
