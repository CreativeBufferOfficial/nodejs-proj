FROM node:12.14.1-alpine

RUN mkdir -p /srv/adax_payment_api

COPY package.json /srv/adax_payment_api

WORKDIR /srv/adax_payment_api
# RUN yarn install

RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
 && npm install --silent \
 && apk del .build-deps

COPY . /srv/adax_payment_api

# Build app for production
RUN npm run build
RUN ls
ENV NODE_ENV production

CMD ["node", "./dist/server.js"]

EXPOSE 5000