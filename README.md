# markbyte
For markdown-based no-code blogsite creation


to start:
```bash
docker-compose up -d --build
```

to view frontend/backend logs 
```bash
docker-compose logs -f backend frontend
```

to pipe them into a log file as well
```bash
docker-compose logs -f backend frontend | tee -a logs.txt
```

to view all logs (not recomended, outside of debugging mongo/redis)
```bash
docker-compose logs -f
```

to stop (you can also hit stop in docker)
```
docker-compose down
```