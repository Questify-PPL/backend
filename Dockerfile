# Build image
FROM node:18-alpine as build

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Production image
FROM node:20-alpine as production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

RUN rm package.json yarn.lock

EXPOSE 3001

CMD ["node", "dist/main"]