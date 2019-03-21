FROM node:10-alpine

WORKDIR /usr/local/app
COPY . .

RUN apk update && \
	apk add git && \
	apk add bash

RUN npm install npm@latest -g
RUN sh ./build/install.sh

RUN ./tests/runTests.sh

ENTRYPOINT [ "./bin/run" ]