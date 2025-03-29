BINARY_NAME=markbyte

CMD_DIR=cmd

build:
	go build -o $(BINARY_NAME) $(CMD_DIR)/*.go

run: clean build start-service
	./$(BINARY_NAME)

start-service:
	docker start mongodb
	docker start redis-container

stops:
	docker stop redis-container
	docker stop mongodb

clean:
	rm -f $(BINARY_NAME)
	rm -f $(CMD_DIR)/static/*.html

fmt:
	go fmt ./...

test:
	go test ./...

lint:
	golangci-lint run ./...

# docker-build:
# 	DOCKER_BUILDKIT=1 docker build -t markbyte-backend .

# docker-run:
# 	docker run --rm \
# 		--env-file .env \
# 		-e RUNNING_IN_DOCKER=true \
# 		--network markbyte-net \
# 		-p 8080:8080 \
# 		markbyte-backend

# start-redis:
# 	@if [ -z "$$(docker ps -a --filter name=^/redis-alp --format '{{.Names}}')" ]; then \
# 		echo "Creating and starting redis-alp container..."; \
# 		docker run -d --name redis-alp --network markbyte-net -p 6379:6379 redis:alpine; \
# 	else \
# 		echo "Starting existing redis-dev container..."; \
# 		docker start redis-alp; \
# 	fi

# start-mongo:
# 	@if docker ps -a --format '{{.Names}}' | grep -xq 'mongo'; then \
# 		echo "Starting existing mongo container..."; \
# 		docker start mongo; \
# 	else \
# 		echo "Creating and starting mongo container with volume..."; \
# 		docker volume create mongo_data; \
# 		docker run -d \
# 			--name mongo \
# 			--network markbyte-net \
# 			-p 27017:27017 \
# 			-v mongo_data:/data/db \
# 			mongo:latest; \
# 	fi

# docker-start: start-redis start-mongo docker-run

# docker-stop:
# 	docker stop redis-alp mongo

# docker-frontend-build:
# 	docker build -t markbyte-frontend -f ../frontend/markbyte/Dockerfile ../frontend/markbyte

# # Run frontend container (create or start)
# docker-start-frontend:
# 	@if docker ps -a --format '{{.Names}}' | grep -xq 'markbyte-frontend'; then \
# 		echo "Starting existing frontend container..."; \
# 		docker start markbyte-frontend; \
# 	else \
# 		echo "Creating and starting frontend container..."; \
# 		docker run --rm \
# 			--name markbyte-frontend \
# 			--network markbyte-net \
# 			-p 5173:5173 \
# 			markbyte-frontend; \
# 	fi
