FROM node:lts-alpine as production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

RUN yarn build

COPY . .

RUN rm package.json yarn.lock

EXPOSE 3001

CMD ["node", "dist/main"]