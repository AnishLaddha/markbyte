FROM golang:1.23 AS builder

WORKDIR /app

# Copy .dockerignore first to ensure it's effective
COPY .dockerignore .

COPY go.mod go.sum ./
RUN go mod download

# Now this COPY will respect .dockerignore
COPY . .

RUN CGO_ENABLED=0 go build -o backend/markbyte ./cmd/main.go

FROM gcr.io/distroless/base-debian11

WORKDIR /app

COPY --from=builder /app/backend/markbyte /app/backend/markbyte
COPY --from=builder /app/cmd/static /app/cmd/static

EXPOSE 8080

CMD ["/app/backend/markbyte"]
