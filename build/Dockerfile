FROM node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553
WORKDIR /usr/local/app
RUN chown node:node /usr/local/app
COPY --chown=node:node . .
USER node
RUN npm ci --ignore-scripts --omit=dev
ENTRYPOINT ["npm", "run", "--silent", "generate", "--"]
