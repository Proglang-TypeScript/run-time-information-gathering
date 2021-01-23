FROM node:12-alpine

WORKDIR /usr/local/app
COPY . .

RUN apk add git && \
	apk add bash

RUN npm install npm@latest -g
RUN sh ./build/install.sh

ENTRYPOINT [ "./bin/run" ]