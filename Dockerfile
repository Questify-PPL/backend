FROM node:lts-alpine AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . . 

RUN yarn build

FROM node:lts-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]