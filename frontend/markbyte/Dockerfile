FROM node:20-alpine  

WORKDIR /markbyte

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0"]