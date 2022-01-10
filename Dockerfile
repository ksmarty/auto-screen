FROM mcr.microsoft.com/playwright:focal

ENV DOCKER=true
ENV XDG_CONFIG_HOME=/app

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable
RUN pnpm install
COPY . /app
RUN pnpm build:js

RUN useradd -ms /bin/bash node
RUN chown -R node /app
USER node
CMD node dist/index.js
