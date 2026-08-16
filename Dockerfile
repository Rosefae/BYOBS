FROM ghcr.io/puppeteer/puppeteer:latest

# Add Puppeteer user to owner group for the files it'll need to write
ARG DATA_GROUP_OWNER_ID
ENV GROUP_ID=${DATA_GROUP_OWNER_ID}
USER root
# RUN usermod -aG $(getent group ${GROUP_ID} | cut -d: -f1) $(getent user ${PPTRUSER_UID})
RUN PPTRUSER_NAME=$(id -u -n ${PPTRUSER_UID}) \
    && usermod -aG ${GROUP_ID} $PPTRUSER_NAME

# Install NVM
RUN apt-get update && apt-get install -y curl
USER $PPTRUSER_UID
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

WORKDIR /app

# Upgrade Node
ENV NVM_DIR=~/.nvm
RUN /bin/bash -c "source $NVM_DIR/nvm.sh \
    && nvm install 26 \
    && nvm use 26"

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    npm install

COPY . .

EXPOSE 8081

CMD [ "node", "--env-file=.env", "server.js" ]