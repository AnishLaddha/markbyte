package api

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

type S3Credentials struct {
	AccessKey string
	SecretKey string
	Bucket    string
	Region    string
}

var LoadCredentials = func() (S3Credentials, error) {

	if os.Getenv("RUNNING_IN_DOCKER") != "true" {
		_ = godotenv.Load() // ignore error, it may not exist
	}

	bucket := os.Getenv("S3_BUCKET_NAME")
	region := os.Getenv("S3_REGION")
	accessKey := os.Getenv("S3_ACCESS_KEY_ID")
	secretKey := os.Getenv("S3_SECRET_ACCESS_KEY")

	if bucket == "" || region == "" || accessKey == "" || secretKey == "" {
		return S3Credentials{}, fmt.Errorf("missing required environment variables for s3")
	}

	return S3Credentials{
		AccessKey: accessKey,
		SecretKey: secretKey,
		Bucket:    bucket,
		Region:    region,
	}, nil
}

func UploadHTMLFile(ctx context.Context, htmlString string, key string, cred S3Credentials) (string, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(cred.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cred.AccessKey, cred.SecretKey, "")))
	if err != nil {
		return "", fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	htmlReader := bytes.NewReader([]byte(htmlString))

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(cred.Bucket),
		Key:         aws.String(key),
		Body:        htmlReader,
		ContentType: aws.String("text/html"),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to s3: %w", err)
	}

	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", cred.Bucket, cred.Region, key)

	return url, nil
}

func UploadMDFile(ctx context.Context, mdString string, key string, cred S3Credentials) (string, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(cred.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cred.AccessKey, cred.SecretKey, "")))
	if err != nil {
		return "", fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	mdReader := bytes.NewReader([]byte(mdString))

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(cred.Bucket),
		Key:         aws.String(key),
		Body:        mdReader,
		ContentType: aws.String("text/markdown"),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to s3: %w", err)
	}

	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", cred.Bucket, cred.Region, key)

	return url, nil
}

var ReadFilefromS3 = func(ctx context.Context, key string, cred S3Credentials) (string, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(cred.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cred.AccessKey, cred.SecretKey, "")))
	if err != nil {
		return "", fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(cred.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", fmt.Errorf("failed to read file from s3: %w", err)
	}

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read file from s3: %w", err)
	}
	return buf.String(), nil
}

// func ReadHTMLFromURL(ctx context.Context, url string) (string, error) {
// 	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to create HTTP request: %w", err)
// 	}
// 	resp, err := http.DefaultClient.Do(req)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to fetch HTML from URL: %w", err)
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode != http.StatusOK {
// 		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
// 	}

// 	htmlBytes, err := io.ReadAll(resp.Body)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to read response body: %w", err)
// 	}

// 	return string(htmlBytes), nil

// }

func DeleteFile(ctx context.Context, key string, cred S3Credentials) error {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(cred.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cred.AccessKey, cred.SecretKey, "")))
	if err != nil {
		return fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	_, err = client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(cred.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete file from s3: %w", err)
	}

	return nil
}

func UploadImages(ctx context.Context, images map[string][]byte, cred S3Credentials) (map[string]string, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(cred.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cred.AccessKey, cred.SecretKey, "")))
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	urls := make(map[string]string)

	var contentType string

	for key, image := range images {
		imageReader := bytes.NewReader(image)
		ext := strings.ToLower(filepath.Ext(key)) // ".jpg"
		if ext == ".jpg" || ext == ".jpeg" {
			contentType = "image/jpeg"
		} else if ext == ".png" {
			contentType = "image/png"
		} else {
			return nil, fmt.Errorf("unsupported image extension: %s", ext)
		}

		_, err = client.PutObject(ctx, &s3.PutObjectInput{
			Bucket: aws.String(cred.Bucket),
			Key:    aws.String(key),
			Body:   imageReader,
			//content type needs to be set for images, could be jpg or png depends on extension
			ContentType: aws.String(contentType),
		})
		if err != nil {
			return nil, fmt.Errorf("failed to upload file to s3: %w", err)
		}

		url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", cred.Bucket, cred.Region, key)
		urls[key] = url
	}

	return urls, nil
}
