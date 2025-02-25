# THE DATABASE


## RUN MONGO WITH DOCKER

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongodb/mongodb-community-server:latest
```

## RUN REDIS WITH DOCKER

```bash
docker run --name redis-container -p 6379:6379 -d redis
```