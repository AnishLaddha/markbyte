# The Backend / API

## Structure

The backend is comprised of:

cmd/* 
: the starting point of the server, including the API list in api.go

auth/*
: the authentication code

api/*
: the API connections for the features, currently for publishing and viewing

features/*
: the specific code for the features

## Running the code

You can run the code using:
```
make run
```
it will start the api on localhost:8080

to sign up:

```bash
curl -X POST http://localhost:8080/signup \
     -H "Content-Type: application/json" \
     -d '{"username": "[your username]", "password": "[your password]"}'
```

to log in:

```bash
curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"username": "[your username]", "password": "[your password]"}'
```

this will give you an authorization token.


to upload a file:
```bash
curl -X POST http://localhost:8080/upload \
     -H "Authorization: Bearer [your token]" \
     -F "file=@filename.md"
```

to view your uploaded file:
visit localhost:8080/static/filename.html