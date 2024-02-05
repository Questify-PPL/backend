# Build image
FROM node:lts-alpine as build

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Production image
FROM node:lts-alpine as production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

RUN rm package.json yarn.lock

EXPOSE 3001

CMD ["node", "dist/main"]