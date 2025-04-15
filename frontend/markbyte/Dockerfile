# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /markbyte

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_FRONTEND_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

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

