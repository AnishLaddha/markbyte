# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /markbyte

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve static files with `serve`
FROM node:20-alpine as prod

WORKDIR /markbyte

# install `serve`
RUN npm install -g serve

# copy build from previous stage
COPY --from=builder /markbyte/dist ./dist

EXPOSE 5173
CMD [ "serve", "-s", "dist", "-l", "5173" ]

