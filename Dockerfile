FROM mcr.microsoft.com/playwright:focal

ENV NODE_ENV=production
ENV DOCKER=true

WORKDIR /app
COPY . .
RUN yarn rebuild

RUN useradd -ms /bin/bash node
RUN chown -R node /app
USER node
CMD yarn start
