FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/
COPY client-host/package.json ./client-host/
COPY client-player/package.json ./client-player/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
