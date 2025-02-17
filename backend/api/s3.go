package api

import (
	"bytes"
	"context"
	"fmt"
	"os"

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

func LoadCredentials() (S3Credentials, error) {
	err := godotenv.Load()
	if err != nil {
		return S3Credentials{}, err
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

func ReadHTMLFile(ctx context.Context, key string, cred S3Credentials) (string, error) {
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
