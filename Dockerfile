FROM node:26

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    npm install

COPY . .

EXPOSE 8081

CMD [ "node", "--env-file=.env", "server.js" ]