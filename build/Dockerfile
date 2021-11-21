FROM node:12-alpine

RUN apk add git && \
	apk add bash

WORKDIR /usr/local/app

ENV NODE_ENV=production
COPY package*.json ./
COPY build ./build
COPY jalangi-commands ./jalangi-commands
RUN npm ci

COPY . .

ENTRYPOINT [ "npm", "run", "--silent", "generate", "--" ]