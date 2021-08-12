FROM node:14-slim

WORKDIR /app

COPY ./index.js ./
COPY ./package*.json ./

RUN npm ci

CMD ["node", "index.js"]
